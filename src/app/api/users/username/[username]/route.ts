import { cachedValidateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

interface UsernameParams {
  username: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<UsernameParams> },
) {
  const { username } = await params;

  try {
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

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id),
    });

    console.log(`server side`);
    console.log({ user });
    if (!user) {
      return Response.json(
        {
          error: "User not found !",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(user);
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
