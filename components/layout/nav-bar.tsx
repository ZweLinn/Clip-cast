"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NavBar = () => {
  const router = useRouter();
  const {data : session} = authClient.useSession();
  const user = session?.user;
  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions :{
        onSuccess : () => {router.push("/sign-in")}
      }
    });
  }
  
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
            <button className="cursor-pointer" onClick={() => router.push(`/profile/${user.id}`)}>
              <Image
                src={user.image || "/assets/images/dummy.jpg"}
                alt="user"
                width={36}
                height={36}
                className="rounded-full aspect-square"
              />
            </button>
            <button className="cursor-pointer" onClick={handleSignOut}>
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
