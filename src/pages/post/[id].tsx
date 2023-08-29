import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/Loading";
import PostView from "~/components/PostView";
import ssgHelper from "~/server/api/helpers/ssgHelper";
import { api } from "~/utils/api";

type PostPageProps = {
  postId: string;
};

export default function PostPage({ postId }: PostPageProps) {
  const { data: tweet, isLoading } = api.post.getById.useQuery({
    postId: postId,
  });

  // Return empty div if user is not loaded
  if (!tweet) return <div></div>;

  if (isLoading) {
    return (
      <div className="absolute right-0 top-0 flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="48" />
      </div>
    );
  }

  const { post, author } = tweet;

  return (
    <>
      <Head>
        <title>{`${post.content} - @${author.username}`}</title>
        <meta name="Tweet" content="chirp" />
      </Head>
      <Layout>
        <PostView post={post} author={author} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = ssgHelper();

  const postId = context.params?.id;

  if (typeof postId !== "string") throw new Error("No Post ID provided");

  await ssg.post.getById.prefetch({ postId: postId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId: postId,
    },
  };
};

export function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
