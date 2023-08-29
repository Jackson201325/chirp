import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

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

      <div className="flex flex-shrink flex-col">
        <div className="flex gap-2 font-bold text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>@{author.username}</span>
          </Link>
          <span className="font-bold">·</span>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">
              {formatDistanceToNow(new Date(post.createdAt))} ago{" "}
            </span>
          </Link>
        </div>
        <span className="text-1xl whitespace-normal break-words">
          {post.content}
        </span>
      </div>
    </div>
  );
};

export default PostView;
