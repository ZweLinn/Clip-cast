"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import RecordScreen from "@/components/recording/record-screen";
import { filterOptions } from "@/constants";
import ImageWithFallback from   "@/components/ui/image-with-fallback";
import DropdownList from "@/components/home/drop-down-list";
import { updateURLParams } from "@/lib/utils";

const Header = ({ subHeader, title, userImg }: SharedHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [selectedFilter, setSelectedFilter] = useState(
    searchParams.get("filter") || "Most Recent"
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(searchParams.get("query") || "");
    setSelectedFilter(searchParams.get("filter") || "Most Recent");
  }, [searchParams]);

 useEffect(() => {
  // 1. If searchQuery is empty and there's no query in URL, don't do anything
  // This prevents an initial call on page load if not needed
  const currentQuery = searchParams.get("query") || "";
  if (searchQuery === currentQuery) return;

  const debounceTimer = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }

    // Use router.push or router.replace
    // .toString() ensures we are passing a string, not an object
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, 500);

  return () => clearTimeout(debounceTimer);
  
  // REMOVE searchParams and pathname from here if possible, 
  // or handle them carefully.
}, [searchQuery, router, searchParams, pathname]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    const url = updateURLParams(
      searchParams,
      { filter: filter || null },
      pathname
    );
    router.push(url);
  };

  const renderFilterTrigger = () => (
    <div className="filter-trigger">
      <figure>
        <Image
          src="/assets/icons/hamburger.svg"
          alt="hamburger"
          width={14}
          height={14}
        />
        <span>{selectedFilter}</span>
      </figure>
      <Image
        src="/assets/icons/arrow-down.svg"
        alt="arrow-down"
        width={20}
        height={20}
      />
    </div>
  );

  return (
    <header className="header">
      <section className="header-container">
        <figure className="details">
          {userImg && (
            <ImageWithFallback
              src={userImg}
              alt="user"
              width={66}
              height={66}
              className="rounded-full"
            />
          )}
          <article>
            <p>{subHeader}</p>
            <h1>{title}</h1>
          </article>
        </figure>
        <aside>
          <Link href="/upload">
            <Image
              src="/assets/icons/upload.svg"
              alt="upload"
              width={16}
              height={16}
            />
            <span>Upload a video</span>
          </Link>
          <RecordScreen />
        </aside>
      </section>
      <section className="search-filter">
        <div className="search">
          <input
            type="text"
            placeholder="Search for videos, tags, folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Image
            src="/assets/icons/search.svg"
            alt="search"
            width={16}
            height={16}
          />
        </div>
        <DropdownList
          options={filterOptions}
          selectedOption={selectedFilter}
          onOptionSelect={handleFilterChange}
          triggerElement={renderFilterTrigger()}
        />
      </section>
    </header>
  );
};

export default Header;