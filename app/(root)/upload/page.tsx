"use client";
import {
  getThumbnailUploadUrl,
  getVideoUploadUrl,
  saveVideoDetails,
} from "@/actions/video";
import FileInput from "@/components/ui/file-input";
import FormField from "@/components/ui/form-field";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { useFileInput } from "@/hooks/use-file-input";
import { set } from "better-auth";
import { useRouter } from "next/navigation";

import React, { ChangeEvent, useEffect } from "react";
import { useState } from "react";

const uploadFileToBunny = (
  file: File,
  uploadUrl: string,
  accessKey: string,
): Promise<void> =>
  fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if (!response.ok)
      throw new Error(`Upload failed with status ${response.status}`);
  });

const Page = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });

  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

  useEffect(() => {
    if (video.duration === null || video.duration === 0) {
      setVideoDuration(video.duration);
    }
  }, [video.duration]);

  const vasibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const handleFromDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload both video and thumbnail.");
        return;
      }
      if (!formData.title || !formData.description) {
        setError("Please fill in all required fields.");
        return;
      }

      // 1. upload URL
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey) {
        setError("Failed to get video upload URL. Please try again.");
        return;
      }

      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      const {
        uploadUrl: thumbnailUploadUrl,
        cdnUrl: thumbnailCdnUrl,
        accessKey: thumbnailAccessKey,
      } = await getThumbnailUploadUrl(videoId);

      if (!thumbnailUploadUrl || !thumbnailAccessKey) {
        setError("Failed to get thumbnail upload URL. Please try again.");
        return;
      }

      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey,
      );

      // save video details to DB
      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCdnUrl,
        ...formData,
        duration: videoDuration,
      });
      router.push(`/videos/${videoId}`);
    } catch (err) {
      console.error(err);
      setError("An error occurred while uploading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="wrapper-md  upload-page">
      <h1>Upload a video</h1>
      {error && <div className="error-field">{error}</div>}

      <form
        className="flex flex-col rounded-20 shadow-10 w-full gap-6 px-5 py-7.5"
        onSubmit={handleSubmit}
      >
        <FormField
          id="title"
          label="Title"
          placeholder="Enter video title"
          value={formData.title}
          onChange={handleFromDataChange}
        />

        <FormField
          id="description"
          label="Description"
          placeholder="Enter video description"
          value={formData.description}
          onChange={handleFromDataChange}
          as="textarea"
        />

        <FileInput
          id="video"
          label="Video"
          accept="video/*"
          file={video.file}
          previewUrl={video.previewUrl}
          inputRef={video.inputRef}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />

        <FileInput
          id="thumbnail"
          label="Thumbnail"
          accept="image/*"
          file={thumbnail.file}
          previewUrl={thumbnail.previewUrl}
          inputRef={thumbnail.inputRef}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />
        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleFromDataChange}
          as="select"
          options={vasibilityOptions}
        />
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </main>
  );
};

export default Page;
