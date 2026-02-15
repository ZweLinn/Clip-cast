"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
const DropDownList = () => {
  const options = ["Most recent", "Oldest", "Most viewed", "Least viewed"];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="filter-trigger">
          <figure>
            <Image
              src="/assets/icons/hamburger.svg"
              alt="filter"
              width={14}
              height={14}
            />
            Most recent
            <Image
              src="/assets/icons/arrow-down.svg"
              alt="arrow"
              width={14}
              height={14}
            />
          </figure>
        </div>

        {isOpen && (
          <ul className="dropdown">
            {options.map((option) => (
              <li key={option} className="list-item">
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DropDownList;
