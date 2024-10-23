import { User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db
      .select()
      .from(posts)
      .limit(100)
      .orderBy(desc(posts.createdAt));

    const users = (
      await clerkClient.users.getUserList({
        userId: allPosts.map((post) => post.authorId),
        limit: 100,
      })
    ).data.map(filterUserForClient);

    return allPosts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });
      if (!author.username)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post author username not found",
        });

      return {
        post,
        author: {
          ...author,
          username: author.username,
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
      const authorId = ctx.userId;

      const post = await ctx.db
        .insert(posts)
        .values({
          authorId,
          content: input.content,
        })
        .returning();

      return post[0];
    }),
});
