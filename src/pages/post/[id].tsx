import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import Layout from "~/components/Layout";

export default function PostPage() {
  const { isLoaded: userLoaded } = useUser();

  // Return empty div if user is not loaded
  if (!userLoaded) return <div></div>;

  return (
    <>
      <Head>
        <title>Tweet</title>
        <meta name="Tweet" content="chirp" />
      </Head>
      <Layout>
        <div className="flex justify-center border-b border-slate-400 p-4">
          Tweet
        </div>
      </Layout>
    </>
  );
}
