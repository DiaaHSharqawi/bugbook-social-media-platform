"use server";

import { cachedValidateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { validationsMessages } from "@/lib/translationKeys";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { getCreateCommentSchema } from "@/lib/validations";
import { getTranslations } from "next-intl/server";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user: loggedInUser } = await cachedValidateRequest();
  if (!loggedInUser) {
    throw new Error(`Unauthorized.`);
  }

  const t = await getTranslations();

  const createCommentSchemaMessages = {
    required: t(validationsMessages.required),
  };

  console.log({ content });

  const { content: validatedContent } = getCreateCommentSchema(
    createCommentSchemaMessages,
  ).parse({ content });

  /**
   * We need to create comment and return it to the front end.
   * So we have to modify the cache when we post and delete a comment.
   * Otherwise we have the same problem with revalidation taking so long if we have the too many pages
   */

  console.log({ postUserId: post.user.id, loggedInUserId: loggedInUser.id });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: validatedContent,
        postId: post.id,
        userId: loggedInUser.id,
      },
      include: getCommentDataInclude(loggedInUser.id),
    }),
    /** We want to comment on our post without diplsay notification */
    ...(post.user.id !== loggedInUser.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: loggedInUser.id,
              recipientId: post.user.id,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(commentId: string) {
  const { user: loggedInUser } = await cachedValidateRequest();

  if (!loggedInUser) {
    throw new Error(`Unauthorized.`);
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error(`Comment not found!`);
  }

  const isUserCommentAuthor = comment.userId === loggedInUser.id;

  if (!isUserCommentAuthor) {
    throw new Error(`Unauthorized.`);
  }

  /**
   * TODO: We dont have a way to distinguish btw different notification for different comment because we can leave multiple comment, we can solve this by storing comment id in the notification table.
   * I will assume its ok to not delete the notification when we delete the comment
   */

  const deletedComment = await prisma.comment.delete({
    where: {
      id: commentId,
    },
    include: getCommentDataInclude(loggedInUser.id),
  });

  return deletedComment;
}
