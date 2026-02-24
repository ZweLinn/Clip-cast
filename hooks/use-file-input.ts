import { useState, useRef, ChangeEvent } from "react";
export const useFileInput = (maxSize: number) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > maxSize) {
                alert(`File size should be less than ${maxSize / (1024 * 1024)} MB`);
                return;
            }
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);

            if (selectedFile.type.startsWith("video/")) {
                const video = document.createElement("video");
                video.preload = "metadata";
                video.onloadedmetadata = () => {
                    if (isFinite(video.duration) && video.duration > 0) {
                        setDuration(Math.round(video.duration));
                    } else {
                        setDuration(null);
                    }
                    URL.revokeObjectURL(video.src);
                };
                video.src = url;

            }
        };

    }

    const resetFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setDuration(null);
        if (inputRef.current) { inputRef.current.value = ""; }
    }

    return { file, previewUrl, duration, inputRef, handleFileChange, resetFile };
}