import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";

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
        alt="Profile Pic"
      />
      <input
        type="text"
        placeholder="What's happening?"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

export default function Home() {
  const { data, isLoading } = api.post.getAll.useQuery();
  const { user, isSignedIn } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Failed to load posts</div>;

  console.log({ data, fullName: user?.fullName, user });
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
          <div className="flex flex-col">
            {[...data, ...data]?.map(({ post, author }) => (
              <div className="border-b border-slate-400 p-8" key={post.id}>
                {author?.username} said: {post?.content}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
