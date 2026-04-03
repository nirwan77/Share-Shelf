"use client";

import Image from "next/image";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import type { BookReview } from "./action";
import type { useVoteReview } from "./action";

/* ── helpers ── */

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
};

/* ── component ── */

type Props = {
  review: BookReview;
  bookId: string;
  canVote: boolean;
  voteReview: ReturnType<typeof useVoteReview>;
};

export const ReviewCard = ({ review, bookId, canVote, voteReview }: Props) => {
  const handleVote = (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!canVote) {
      toast.error("Please log in to vote.");
      return;
    }
    voteReview.mutate(
      { reviewId: review.id, bookId, voteType },
      {
        onError: () => toast.error("Failed to register vote."),
      },
    );
  };

  const isUpvoted = review.myVote === "UPVOTE";
  const isDownvoted = review.myVote === "DOWNVOTE";

  return (
    <div className="group relative bg-white rounded-2xl border border-[#f0f0e8] shadow-sm hover:shadow-md transition-all duration-300 p-6">
      {/* Top row: avatar + name + date + stars */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8D28] to-[#e67d1f] flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden text-white shadow-sm">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
            ) : (
              review.user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {review.user.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Star rating badge */}
        <div className="flex items-center gap-1.5 bg-[#fff9f4] border border-[#ffe0bc] rounded-full px-3 py-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= review.rating
                    ? "fill-[#FF8D28] text-[#FF8D28]"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[#FF8D28]">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-700 leading-relaxed mb-5">
        {review.comment}
      </p>

      {/* Bottom row: vote buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#f5f5ee]">
        <span className="text-xs text-gray-400 mr-auto">Was this helpful?</span>

        {/* Upvote */}
        <button
          onClick={() => handleVote("UPVOTE")}
          disabled={voteReview.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            isUpvoted
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm scale-105"
              : "bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-white" : ""}`} />
          <span>{review.upvotes}</span>
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote("DOWNVOTE")}
          disabled={voteReview.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            isDownvoted
              ? "bg-rose-500 text-white border-rose-500 shadow-sm scale-105"
              : "bg-white text-gray-500 border-gray-200 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50"
          }`}
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${isDownvoted ? "fill-white" : ""}`} />
          <span>{review.downvotes}</span>
        </button>
      </div>
    </div>
  );
};
