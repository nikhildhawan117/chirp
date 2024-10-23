import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import Image from "next/image";

import type { RouterOutputs } from "~/utils/api";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isPending: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full">
      <input
        placeholder="What's on your mind?!"
        className="grow bg-transparent"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {isPosting ? (
        <LoadingSpinner />
      ) : (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
    </div>
  );
};
// ·
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        alt={`@${author.username}'s profile picture`}
        src={author.profileImageUrl}
        className="h-8 w-8 rounded-full"
        height={32}
        width={32}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`· ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Oops! Something went wrong!</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  console.log(user);
  // Start fetching posts data immediately instead of waiting to render Feed.
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;
  console.log("Hello");

  console.log(user);

  return (
    <>
      <Head>
        <title>{`Chirp - ${isSignedIn ? user.username : "Sign In"}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4 ">
            <SignedIn>
              {/* Mount the UserButton component */}
              <div className="flex flex-row gap-3">
                <UserButton afterSignOutUrl="/" />
                <CreatePostWizard />
              </div>
            </SignedIn>
            <SignedOut>
              {/* Signed out users get sign in button */}
              <SignInButton />
            </SignedOut>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
