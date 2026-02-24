'use server';

import { BUNNY } from "@/constants";
import { db } from "@/db";
import { videos, user } from "@/db/schema";
import { apiFetch, doesTitleMatch, getEnv, getOrderByClause, withErrorHandling } from "@/lib/utils";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/get-session-id";
import aj from "@/lib/arcjet";
import { fixedWindow, request } from "@arcjet/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
// Constants with full names
const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
    streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
    storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
};


const revalidatePaths = (paths: string[]) => {
    paths.forEach((path) => revalidatePath(path));
};

const validatWithArcjet = async (fingerprint: string) => {
    const rateLimit = await aj.withRule(
        fixedWindow({
            mode: "LIVE",
            window: '1m',
            max: 2,
            characteristics: ['fingerprint']

        })
    )
    const req = await request();

    const decision = await rateLimit.protect(req, { fingerprint })
    if (!decision.isDenied) {
        throw new Error("Rate limit exceeded. Please try again later.")
    }
}

const buildVideoWithUserQuery = () =>
    db
        .select({
            video: videos,
            user: { id: user.id, name: user.name, image: user.image },
        })
        .from(videos)
        .leftJoin(user, eq(videos.userId, user.id));

export const getVideoUploadUrl = withErrorHandling(async () => {
    await getSessionUserId();
    const videoResponse = await apiFetch<BunnyVideoResponse>(
        `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
        {
            method: "POST",
            bunnyType: "stream",
            body: { title: "Temp Title", collectionId: "" },
        }
    );
    const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;
    return {
        videoId: videoResponse.guid,
        uploadUrl,
        accessKey: ACCESS_KEYS.streamAccessKey,
    }
});


export const getThumbnailUploadUrl = withErrorHandling(
    async (videoId: string) => {
        const timestampedFileName = `${Date.now()}-${videoId}-thumbnail`;
        const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${timestampedFileName}`;
        const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${timestampedFileName}`;

        return {
            uploadUrl,
            cdnUrl,
            accessKey: ACCESS_KEYS.storageAccessKey,
        };
    }
);

export const saveVideoDetails = withErrorHandling(async (videoDetails: VideoDetails) => {
    const userId = await getSessionUserId();
    await validatWithArcjet(userId);

    await apiFetch(
        `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
        {
            method: "POST",
            bunnyType: "stream",
            body: {
                title: videoDetails.title,
                description: videoDetails.description,
            },
        }
    );

    await db.insert(videos).values({
  title:        videoDetails.title,
  description:  videoDetails.description,
  videoUrl:     `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
  videoId:      videoDetails.videoId,           
  thumbnailUrl: videoDetails.thumbnailUrl,      
  visibility:   videoDetails.visibility === "public" 
                  ? "public" as const 
                  : "private" as const,         
  userId,
  ...(videoDetails.duration !== undefined && { duration: videoDetails.duration }),
 
});

    revalidatePaths(["/"]);
    return {
        success: true,
        videoId: videoDetails.videoId

    };
})

export const getAllVideos = withErrorHandling(async (
    searchQuery: string = "",
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,

) => {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user.id || null;

    const canSeeTheVideo = or(
        eq(videos.visibility, "public"),
        eq(videos.userId, currentUserId!)
    )

    const whereConditions = searchQuery.trim() ?
        and(
            canSeeTheVideo,
            doesTitleMatch(videos, searchQuery)
        ) : (
            canSeeTheVideo
        )

    const [{ totalCount }] = await db.
        select({ totalCount: sql`count(*)` })
        .from(videos)
        .where(whereConditions)

    const totalVideos  = Number(totalCount);
    const totalPages = Math.ceil(totalVideos / pageSize);
    const videoRecords = await buildVideoWithUserQuery()
        .where(whereConditions)
        .orderBy(sortFilter ? getOrderByClause(sortFilter) : sql`${videos.createdAt} DESC`).limit(pageSize).offset((pageNumber - 1) * pageSize);

    return{
        videos: videoRecords,
        pagination: {
            totalVideos,
            totalPages,
            currentPage: pageNumber,
            pageSize
        }
    }
})

export const getVideoById = withErrorHandling(async (videoId: string) => {
    const [videoRecord] = await buildVideoWithUserQuery()
        .where(eq(videos.videoId, videoId));
        return videoRecord;

}
)

export const getTranscript = withErrorHandling(async (videoId: string) => {
  const response = await fetch(
    `${BUNNY.TRANSCRIPT_URL}/${videoId}/captions/en-auto.vtt`
  );
  return response.text();
});

export const incrementVideoViews = withErrorHandling(
  async (videoId: string) => {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1`, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));

    revalidatePaths([`/video/${videoId}`]);
    return {};
  }
);

export const getAllVideosByUser = withErrorHandling(
  async (
    userIdParameter: string,
    searchQuery: string = "",
    sortFilter?: string
  ) => {
    const currentUserId = (
      await auth.api.getSession({ headers: await headers() })
    )?.user.id;
    const isOwner = userIdParameter === currentUserId;

    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userIdParameter));
    if (!userInfo) throw new Error("User not found");

        /* eslint-disable @typescript-eslint/no-explicit-any */
    const conditions = [
      eq(videos.userId, userIdParameter),
      !isOwner && eq(videos.visibility, "public"),
      searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
    ].filter(Boolean) as any[];

    const userVideos = await buildVideoWithUserQuery()
      .where(and(...conditions))
      .orderBy(
        sortFilter ? getOrderByClause(sortFilter) : desc(videos.createdAt)
      );

    return { user: userInfo, videos: userVideos, count: userVideos.length };
  }
);

export const updateVideoVisibility = withErrorHandling(
  async (videoId: string, visibility: Visibility) => {
    await validatWithArcjet(videoId);
    await db
      .update(videos)
      .set({ visibility, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));

    revalidatePaths(["/", `/video/${videoId}`]);
    return {};
  }
);

export const getVideoProcessingStatus = withErrorHandling(
  async (videoId: string) => {
    const processingInfo = await apiFetch<BunnyVideoResponse>(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      { bunnyType: "stream" }
    );

    return {
      isProcessed: processingInfo.status === 4,
      encodingProgress: processingInfo.encodeProgress || 0,
      status: processingInfo.status,
    };
  }
);

export const deleteVideo = withErrorHandling(
  async (videoId: string, thumbnailUrl: string) => {
    await apiFetch(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      { method: "DELETE", bunnyType: "stream" }
    );

    const thumbnailPath = thumbnailUrl.split("thumbnails/")[1];
    await apiFetch(
      `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${thumbnailPath}`,
      { method: "DELETE", bunnyType: "storage", expectJson: false }
    );

    await db.delete(videos).where(eq(videos.videoId, videoId));
    revalidatePaths(["/", `/video/${videoId}`]);
    return {};
  }
);