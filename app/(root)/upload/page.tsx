"use client";
import FileInput from "@/components/ui/file-input";
import FormField from "@/components/ui/form-field";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { useFileInput } from "@/hooks/use-file-input";

import React, { ChangeEvent } from "react";
import { useState } from "react";

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });

  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

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
          previewUrl={video.previewURL}
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
          previewUrl={thumbnail.previewURL}
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
