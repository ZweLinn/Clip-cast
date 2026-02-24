import { getAllVideosByUser } from "@/actions/video";
import Header from "@/components/home/header";

import EmptyState from "@/components/ui/empty-state";
import VideoCard from "@/components/video/video-card";
import React from "react";

const Page = async ({ params , searchParams }: ParamsWithSearch) => {
  const { id } = await params;
  const {  filter, query } = await searchParams;
  const result = await getAllVideosByUser(id , query, filter);

  const user = result.data?.user;
  const videos = result.data?.videos || [];

  

  return (
    <div className="wrapper page">
        <Header title={user?.name || ""} subHeader={user?.email || ""} userImg={user?.image || ""}/>

        {videos?.length > 0 ? (
                <section className="video-grid">
                  {videos.map(({ video, user }) => (
                    <VideoCard
                      key={video.id}
                      id={video.videoId}
                      title={video.title}
                      thumbnail={video.thumbnailUrl}
                      createdAt={video.createdAt}
                      userImg={user?.image ?? ""}
                      username={user?.name ?? "Guest"}
                      views={video.views}
                      visibility={video.visibility}
                      duration={video?.duration}
                    />
                  ))}
                </section>
              ) : (
                <EmptyState
                  icon="/assets/icons/video.svg"
                  title="No Videos Found"
                  description="Add a video to get started"
                />
              )}
    </div>
  );
};

export default Page;
