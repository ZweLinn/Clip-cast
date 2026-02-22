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
import { and, eq, or, sql } from "drizzle-orm";
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
        ...videoDetails,
        videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    })

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