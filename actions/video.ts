'use server';

import { BUNNY } from "@/constants";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { apiFetch, getEnv, withErrorHandling } from "@/lib/utils";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/get-session-id";
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