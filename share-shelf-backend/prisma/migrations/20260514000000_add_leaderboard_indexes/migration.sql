-- Leaderboard query support
CREATE INDEX "UserBookReview_userId_createdAt_idx" ON "UserBookReview"("userId", "createdAt");
CREATE INDEX "ReviewVote_reviewId_voteType_createdAt_idx" ON "ReviewVote"("reviewId", "voteType", "createdAt");
CREATE INDEX "posts_createdById_createdAt_idx" ON "posts"("createdById", "createdAt");
CREATE INDEX "post_reactions_postId_reaction_createdAt_idx" ON "post_reactions"("postId", "reaction", "createdAt");
CREATE INDEX "post_comments_userId_createdAt_idx" ON "post_comments"("userId", "createdAt");
CREATE INDEX "post_comment_reactions_postCommentId_reaction_createdAt_idx" ON "post_comment_reactions"("postCommentId", "reaction", "createdAt");
CREATE INDEX "BookPurchase_buyerId_status_createdAt_idx" ON "BookPurchase"("buyerId", "status", "createdAt");
CREATE INDEX "BookPurchase_sellerId_status_createdAt_idx" ON "BookPurchase"("sellerId", "status", "createdAt");
