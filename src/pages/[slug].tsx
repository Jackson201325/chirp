import { useUser } from "@clerk/nextjs";
import Head from "next/head";

export default function ProfilePage() {
  const { isLoaded: userLoaded } = useUser();

  // Return empty div if user is not loaded
  if (!userLoaded) return <div></div>;

  return (
    <>
      <Head>
        <title>Tweet</title>
        <meta name="Profile" content="chirp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">Profile View</div>
        </div>
      </main>
    </>
  );
}
