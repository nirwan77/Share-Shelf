-- CreateTable
CREATE TABLE "post_comment_reactions" (
    "id" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "postCommentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_comment_reactions_postCommentId_userId_reaction_key" ON "post_comment_reactions"("postCommentId", "userId", "reaction");

-- AddForeignKey
ALTER TABLE "post_comment_reactions" ADD CONSTRAINT "post_comment_reactions_postCommentId_fkey" FOREIGN KEY ("postCommentId") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment_reactions" ADD CONSTRAINT "post_comment_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
