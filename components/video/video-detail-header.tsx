"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { daysAgo } from "@/lib/utils";

const VideoDetailHeader = ({
  title,
  createdAt,
  userImg,
  username,
  videoId,
  ownerId,
  visibility,
  thumbnailUrl,
}: VideoDetailHeaderProps) => {
  const router = useRouter();
  const[copy , setCopy] = React.useState(false);

  const handleCopyLink =()=>{
    navigator.clipboard.writeText(`${window.location.origin}/video/${videoId}`);
    setCopy(true);
  }
  return (
    <header className="detail-header">
      <aside className="user-info">
        <figure>
          <button onClick={() => router.push(`/profile/${ownerId}`)}>
            <Image
              src={userImg || "/assets/images/dummy.jpg"}
              width={24}
              height={24}
              alt="Video thumbnail"
              className="rounded-full"
            />
            <h2>{username ?? "Guest"} </h2>
          </button>

          <figcaption>
            <span className="mt-1">・</span>
            <p>{daysAgo(createdAt)}</p>
          </figcaption>
        </figure>
      </aside>

      <aside className="cta">
        <button onClick={handleCopyLink}>
            <Image src={copy ? "/assets/images/checked.png" : "/assets/icons/link.svg"} width={24} height={24} alt="Share video"/>
        </button>

      </aside>
    </header>
  );
};

export default VideoDetailHeader;
