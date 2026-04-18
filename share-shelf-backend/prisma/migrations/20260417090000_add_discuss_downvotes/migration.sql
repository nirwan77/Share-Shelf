UPDATE "post_reactions"
SET "reaction" = 'UPVOTE'
WHERE "reaction" = 'like';

DELETE FROM "post_reactions"
WHERE "id" IN (
    SELECT "id"
    FROM (
        SELECT
            "id",
            ROW_NUMBER() OVER (
                PARTITION BY "postId", "userId"
                ORDER BY COALESCE("updatedAt", "createdAt") DESC, "id" DESC
            ) AS row_num
        FROM "post_reactions"
    ) ranked
    WHERE ranked.row_num > 1
);

UPDATE "post_comment_reactions"
SET "reaction" = 'UPVOTE'
WHERE "reaction" = 'like';

DELETE FROM "post_comment_reactions"
WHERE "id" IN (
    SELECT "id"
    FROM (
        SELECT
            "id",
            ROW_NUMBER() OVER (
                PARTITION BY "postCommentId", "userId"
                ORDER BY COALESCE("updatedAt", "createdAt") DESC, "id" DESC
            ) AS row_num
        FROM "post_comment_reactions"
    ) ranked
    WHERE ranked.row_num > 1
);

DROP INDEX "post_reactions_postId_userId_reaction_key";
CREATE UNIQUE INDEX "post_reactions_postId_userId_key"
ON "post_reactions"("postId", "userId");

DROP INDEX "post_comment_reactions_postCommentId_userId_reaction_key";
CREATE UNIQUE INDEX "post_comment_reactions_postCommentId_userId_key"
ON "post_comment_reactions"("postCommentId", "userId");
