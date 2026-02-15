import Header from "@/components/home/header";
import VideoCard from "@/components/video/video-card";
import React from "react";

const dummyCards = [
  {
    id: "1",
    title: "My First Video",
    thumbnail: "/assets/samples/thumbnail (1).png",
    userImg: "/assets/images/jason.png",
    username: "John Doe",
    createdAt: new Date("2025-05-01"),
    views: 100,
    visibility: "public",
    duration: 120
  },
  {
    id: "2",
    title: "Building a React Component Library",
    thumbnail: "/assets/samples/thumbnail (2).png",
    userImg: "/assets/images/sarah.png",
    username: "Sarah Chen",
    createdAt: new Date("2025-06-15"),
    views: 2340,
    visibility: "public",
    duration: 890
  },
  {
    id: "3",
    title: "TypeScript Tips & Tricks",
    thumbnail: "/assets/samples/thumbnail (3).png",
    userImg: "/assets/images/mike.png",
    username: "Mike Rodriguez",
    createdAt: new Date("2025-07-22"),
    views: 5670,
    visibility: "public",
    duration: 445
  },
  {
    id: "4",
    title: "CSS Grid Mastery Course",
    thumbnail: "/assets/samples/thumbnail (4).png",
    userImg: "/assets/images/emma.png",
    username: "Emma Watson",
    createdAt: new Date("2025-08-10"),
    views: 12500,
    visibility: "public",
    duration: 1820
  },
  {
    id: "5",
    title: "Next.js 14 Complete Guide",
    thumbnail: "/assets/samples/thumbnail (5).png",
    userImg: "/assets/images/alex.png",
    username: "Alex Kim",
    createdAt: new Date("2025-09-05"),
    views: 8900,
    visibility: "public",
    duration: 2150
  },
  {
    id: "6",
    title: "API Design Best Practices",
    thumbnail: "/assets/samples/thumbnail (6).png",
    userImg: "/assets/images/priya.png",
    username: "Priya Patel",
    createdAt: new Date("2025-10-18"),
    views: 4320,
    visibility: "unlisted",
    duration: 675
  },
  {
    id: "7",
    title: "Docker for Beginners",
    thumbnail: "/assets/samples/thumbnail (7).png",
    userImg: "/assets/images/james.png",
    username: "James Wilson",
    createdAt: new Date("2025-11-30"),
    views: 15800,
    visibility: "public",
    duration: 1560
  },
  {
    id: "8",
    title: "Advanced React Patterns",
    thumbnail: "/assets/samples/thumbnail (8).png",
    userImg: "/assets/images/lisa.png",
    username: "Lisa Anderson",
    createdAt: new Date("2025-12-14"),
    views: 6750,
    visibility: "public",
    duration: 990
  }
];

const Page = () => {
  return (
    <main className="wrapper page">
      <Header
        userImg="/assets/images/dummy.jpg"
        subHeader="Public Library"
        title="All videos"
      />
      
      <section className="video-grid">
        {
        dummyCards.map((card) => 
        (
          <VideoCard key={card.id} {...card}/>
        ))
      }
      </section>
    </main>
  );
};

export default Page;
