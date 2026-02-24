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
  const [uploadStep, setUploadStep] = useState<string | null>(null);
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

  useEffect(() => {
    const checkForRecordedVideo = async () => {
      try {
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;

        const { url, name, type, duration } = JSON.parse(stored);
        const blob = await fetch(url).then((res) => res.blob());
        const file = new File([blob], name, { type, lastModified: Date.now() });

        if (video.inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          video.inputRef.current.files = dataTransfer.files;

          const event = new Event("change", { bubbles: true });
          video.inputRef.current.dispatchEvent(event);

          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);
        }

        if (duration) setVideoDuration(duration);

        sessionStorage.removeItem("recordedVideo");
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error loading recorded video:", err);
      }
    };

    checkForRecordedVideo();
  }, [video]);

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
      setUploadStep("Preparing upload...");
      const result = await getVideoUploadUrl();
      if (result.error || !result.data) {
        setError(result.error ?? "Failed to get video upload URL.");
        return;
      }
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = result.data;

      if (!videoUploadUrl || !videoAccessKey) {
        setError("Failed to get video upload URL. Please try again.");
        return;
      }

      setUploadStep("Uploading video... (this may take a while)");
      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      setUploadStep("Uploading thumbnail...");
      const thumbnailresult = await getThumbnailUploadUrl(videoId);
      if (thumbnailresult.error || !thumbnailresult.data) {
        setError(
          thumbnailresult.error ?? "Failed to get thumbnail upload URL.",
        );
        return;
      }
      const {
        uploadUrl: thumbnailUploadUrl,
        cdnUrl: thumbnailCdnUrl,
        accessKey: thumbnailAccessKey,
      } = thumbnailresult.data;

      if (!thumbnailUploadUrl || !thumbnailAccessKey) {
        setError("Failed to get thumbnail upload URL. Please try again.");
        return;
      }

      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey,
      );

      setUploadStep("Saving video details...");
      // save video details to DB
      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCdnUrl,
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility as "public" | "private",
        duration: videoDuration,
      });
      router.push(`/video/${videoId}`);
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
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              {/* Spinner */}
              <svg
                className="animate-spin h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              {uploadStep}
            </span>
          ) : (
            "Upload Video"
          )}
        </button>
      </form>
    </main>
  );
};

export default Page;
