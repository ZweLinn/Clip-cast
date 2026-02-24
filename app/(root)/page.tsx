import { getAllVideos } from "@/actions/video";
import Header from "@/components/home/header";
import EmptyState from "@/components/ui/empty-state";
import Pagination from "@/components/ui/pagination";
import VideoCard from "@/components/video/video-card";
import React from "react";

const Page = async ({ searchParams }: SearchParams) => {
  const { page, filter, query } = await searchParams;
  const result = await getAllVideos(query, filter, Number(page) || 1);

  const videos = result.data?.videos || [];
  const pagination = result.data?.pagination  || null;

  

  return (
    <main className="wrapper page">
      <Header
        userImg="/assets/images/dummy.jpg"
        subHeader="Public Library"
        title="All videos"
      />

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
              duration={video?.duration }
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="/assets/icons/video.svg"
          title="No Videos Found"
          description="Try adjusting your search."
        />
      )}

      {pagination?.totalPages && pagination?.totalPages > 1 && (
        <Pagination
          currentPage={pagination?.currentPage}
          totalPages={pagination?.totalPages}
          queryString={query}
          filterString={filter}
        />
      )}
    </main>
  );
};

export default Page;
