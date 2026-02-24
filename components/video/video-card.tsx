'use client';
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

const VideoCard = ({
  id,
  title,
  thumbnail,
  userImg,
  username,
  createdAt,
  views,
  visibility,
  duration,
}: VideoCardProps) => {

  const [copy, setCopy] = useState(false);

  const handleCopyLink =()=>{
    navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
    setCopy(true);
  }
  return (
    <Link href={`/video/${id}`} className="video-card">
      <Image src={thumbnail} alt={title} width={290} height={160} className="thumbnail" />
      <article>
        <div>
          <figure>
            <Image
              src={userImg || "/assets/images/dummy.jpg"}
              alt={username}
              width={32}
              height={32}
              className="rounded-full aspect-square"
            />
            <figcaption>
              <h3>{username}</h3>
              <p>{visibility}</p>
            </figcaption>
          </figure>

          <aside>
            <Image
              src="/assets/icons/eye.svg"
              alt="view"
              width={16}
              height={16}
            />
            <span>{views}</span>
          </aside>
        </div>

        <h2>
          {title} -{" "}
          {createdAt.toLocaleDateString("en-Us", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </h2>
      </article>

      <button onClick={handleCopyLink} className="copy-btn">
        <Image
          src={
            copy ? "/assets/icons/checkmark.svg" : "/assets/icons/link.svg"
          }
          alt="Copy Link"
          width={18}
          height={18}
        />
      </button>
      {
        duration  && (
          <div className="duration">
            {Math.ceil(duration / 60)} min
          </div>
        )
      }
    </Link>
  );
};

export default VideoCard;
