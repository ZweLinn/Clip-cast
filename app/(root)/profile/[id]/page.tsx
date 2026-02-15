import Header from "@/components/home/header";
import React from "react";

const Page = async ({ params }: ParamsWithSearch) => {
  const { id } = await params;
  return (
    <div className="wrapper page">
        <Header title="Zwe Linn" subHeader="zewlinnmg@gmail.com" userImg="/assets/images/dummy.jpg"/>
        <h1 className="font-karla text-2xl">page for user {id}</h1>
    </div>
  );
};

export default Page;
