import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    name: user.firstName + " " + user.lastName,
    username: user.username,
    profileImageUrl: user.imageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    const user = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 10,
    });

    const filteredUser = user.map(filterUserForClient);

    return posts.map((post) => {
      const foundAuthor = filteredUser.find(
        (user) => user.id === post.authorId
      );
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
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.current_user;

    console.log("authorId", authorId);

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
