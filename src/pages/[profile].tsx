import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { Suspense } from "react";
import superjson from "superjson";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/Loading";
import PostView from "~/components/PostView";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

type ProfilePageFeedProps = {
  userId: string;
};

const ProfilePageFeed = ({ userId }: ProfilePageFeedProps) => {
  const { isLoading, data: posts } = api.post.getPostByUserId.useQuery({
    userId: userId,
  });

  if (isLoading) {
    return (
      <div className="absolute right-0 top-0 flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="48" />
      </div>
    );
  }

  if (!posts?.length) return <div>No posts</div>;

  return (
    <div className="flex flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        {posts.map(({ post, author }) => (
          <PostView key={post.id} post={post} author={author} />
        ))}
      </Suspense>
    </div>
  );
};

type PageProps = {
  username: string;
};

const ProfilePage = ({ username }: PageProps) => {
  const { data: profileUser, isLoading: loadingUser } =
    api.profile.getUserByUsername.useQuery({
      username: username,
    });

  // this should never happens since we preload it
  if (loadingUser) return <div>Loading...</div>;

  if (!profileUser) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{profileUser?.username}</title>
        <meta name="Profile" content="Profile" />
      </Head>
      <Layout>
        <div className="relative h-36 justify-center border-slate-400 bg-violet-800 p-4">
          <Image
            src={profileUser.profileImageUrl}
            className="absolute bottom-0 left-0 -mb-[48px] ml-4 rounded-full border-4 border-black"
            width={96}
            height={96}
            alt={`Profile Pic of ${profileUser.name}`}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl">@{profileUser?.name}</div>
        <div className="border-b border-slate-400"></div>
        <ProfilePageFeed userId={profileUser.id} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, current_user: null },
    transformer: superjson,
  });

  const slug = context.params?.profile as string;

  const safeSlug = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username: safeSlug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: safeSlug,
    },
  };
};

export function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
