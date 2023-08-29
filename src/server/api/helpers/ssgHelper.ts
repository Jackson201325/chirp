import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "~/server/db";
import { appRouter } from "../root";

export const ssgHelper = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, current_user: null },
    transformer: superjson,
  });

export default ssgHelper;
