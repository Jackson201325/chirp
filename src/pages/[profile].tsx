import { createServerSideHelpers } from "@trpc/react-query/server";
import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps } from "next";
// import { InferGetStaticPropsType } from "next";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import Layout from "~/components/Layout";

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

  return (
    <>
      <Head>
        <title>{profileUser?.username}</title>
        <meta name="Profile" content="Profile" />
      </Head>
      <Layout>
        <div className="flex justify-center border-b border-slate-400 p-4">
          {profileUser?.name}
        </div>
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
