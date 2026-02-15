"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();
  const user = {};
  
  return (
    <header className="navbar">
      <nav>
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={32}
            height={32}
          />
          <h1>Clipcast</h1>
        </Link>

        {user && (
          <figure>
            <button className="cursor-pointer" onClick={() => router.push("/profile/66")}>
              <Image
                src="/assets/images/dummy.jpg"
                alt="user"
                width={36}
                height={36}
                className="rounded-full aspect-square"
              />
            </button>
            <button className="cursor-pointer">
              <Image
                src="/assets/icons/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
            </button>
          </figure>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
