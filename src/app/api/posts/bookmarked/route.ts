import { cachedValidateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const { user: loggedInUser } = await cachedValidateRequest();

    if (!loggedInUser) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: loggedInUser.id,
      },
      include: {
        post: {
          include: getPostDataInclude(loggedInUser.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMoreBookmarks = bookmarks.length > pageSize;
    const nextCursor = hasMoreBookmarks ? bookmarks[pageSize].id : null;

    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => {
        return bookmark.post;
      }),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
