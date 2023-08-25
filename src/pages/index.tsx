import { SignInButton, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Head from "next/head";
import Image from "next/image";
import { Suspense } from "react";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import LoadingSpinner from "./api/components/Loading";

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.imageUrl}
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
        alt={`"Profile Pic of ${user.fullName}"`}
      />
      <input
        type="text"
        placeholder="What's happening?"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithAuthor = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;

  return (
    <div className="flex gap-4 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
        alt="Profile Pic"
      />

      <div className="flex flex-col">
        <div className="flex gap-2 font-bold text-slate-300">
          <span>{author.name}</span>
          <span className="font-thin">@{author.username}</span>
          <span className="font-bold">·</span>
          <span className="font-thin">
            {formatDistanceToNow(new Date(post.createdAt))} ago{" "}
          </span>
        </div>
        <span className="text-1xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (!data) return <div>Failed to load posts</div>;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && data.length === 0) return <div>No posts yet</div>;

  return (
    <div className="flex flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        {[...data, ...data]?.map(({ author, post }) => (
          <PostView key={post.id} post={post} author={author} />
        ))}
      </Suspense>
    </div>
  );
};

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // We can call this twice here and in Feed because the request is cached
  // We wanna make sure this fetch is done before rendering the Feed
  api.post.getAll.useQuery();

  // Return empty div if user is not loaded
  if (!userLoaded) return <div> Loading User </div>;

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="chirp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}

            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
