"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
const page = () => {

  const handleSignInGoogle = async() => {
    return await authClient.signIn.social({provider: "google"})
  }

  const handleSignInGitHub = async() => {
    return await authClient.signIn.social({provider: "github"})
  }
  return (
    <main className="wrapper page sign-in justify-center">
      <aside className="google-sign-in">
        <section>
          <Link href="/" className="text-sm text-primary">
            <Image
              src="/assets/icons/logo.svg"
              alt="logo"
              width={40}
              height={40}
            />
            <h1>Clipcast</h1>
          </Link>

          <p>
            Create, share and discover videos effortlessly with{" "}
            <span>Clipcast </span>
          </p>
          <button onClick={handleSignInGoogle}>
            <Image
              src="/assets/icons/google.svg"
              alt="Google Sign In"
              width={22}
              height={22}
            />
            <span>Sign in with Google</span>
          </button>

          <div className="text-xl text-center">or</div>

          <button onClick={handleSignInGitHub}>
            <Image
              src="/assets/icons/GitHub_Invertocat_Black.svg"
              alt="GitHub Sign In"
              width={22}
              height={22}
            />
            <span>Sign in with GitHub</span>
          </button>
        </section>
      </aside>
    </main>
  );
};

export default page;
