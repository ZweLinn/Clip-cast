'use client';
import Link from "next/link";
import Image from "next/image";
import React from "react";

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

      <button onClick={()=>{}} className="copy-btn">
        <Image src="/assets/icons/link.svg" alt="copy" width={16} height={16} />
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
