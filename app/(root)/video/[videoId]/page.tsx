import { getVideoById ,getTranscript } from "@/actions/video";
import VideoDetailHeader from "@/components/video/video-detail-header";
import VideoInfo from "@/components/video/video-info";
import VideoPlayer from "@/components/video/video-player";
import { redirect } from "next/navigation";

import React from "react";

const Page = async ({ params }: Params) => {
  const { videoId } = await params;

  const videoDetail = await getVideoById(videoId);
  const video = videoDetail?.data?.video;
  const user = videoDetail?.data?.user;
  const transcriptresponse = await getTranscript(videoId);
  const transcript = transcriptresponse?.data;
  

  if (!video) redirect("/404");

  return (
    <main className="wrapper page">
      <h1 className="text-2xl">{video.title}</h1>

      <VideoDetailHeader
        title={video.title}
        createdAt={video.createdAt}
        userImg={user?.image}
        username={user?.name}
        videoId={video.videoId}
        ownerId={video.userId}
        visibility={video.visibility}
        thumbnailUrl={video.thumbnailUrl}
      />

      <section className="video-details">
        <div className="content">
          <VideoPlayer videoId={video.videoId} />
        </div>
        
          <VideoInfo
          transcript={transcript || ""}
          title={video.title}
          createdAt={video.createdAt}
          description={video.description}
          videoId={videoId}
          videoUrl={video.videoUrl}
        />

        
      
      </section>
    </main>
  );
};

export default Page;
