import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "../helpers/filterUser";
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 min seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const returnWithUser = async (posts: Post[]) => {
  const user = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
  });

  const filteredUser = user.map(filterUserForClient);

  return posts.map((post) => {
    const foundAuthor = filteredUser.find((user) => user.id === post.authorId);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!foundAuthor || foundAuthor?.username === null)
      throw new TRPCError({ code: "NOT_FOUND", message: "Author not found" });

    return {
      post,
      author: {
        ...foundAuthor,
        username: foundAuthor.username,
      },
    };
  });
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return returnWithUser(posts);
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.current_user;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  getPostByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(280),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(returnWithUser)
    ),

  getById: publicProcedure
    .input(
      z.object({
        postId: z.string().min(1).max(280),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      return (await returnWithUser([post]))[0];
    }),
});
