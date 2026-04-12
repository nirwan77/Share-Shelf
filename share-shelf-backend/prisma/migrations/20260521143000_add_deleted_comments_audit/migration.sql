-- CreateTable
CREATE TABLE "deleted_comments" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "postTitle" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "deletedByDashboardUserId" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deleted_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deleted_comments_commentId_key" ON "deleted_comments"("commentId");

-- CreateIndex
CREATE INDEX "deleted_comments_deletedAt_idx" ON "deleted_comments"("deletedAt");

-- CreateIndex
CREATE INDEX "deleted_comments_postId_idx" ON "deleted_comments"("postId");
