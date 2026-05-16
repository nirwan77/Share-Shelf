"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import type { BookReview, useVoteReview } from "./action";

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
    <div className="group relative rounded-2xl border border-white/10 bg-[#111114] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff7a00]/35 hover:shadow-[0_22px_65px_rgba(255,122,0,0.1)] sm:p-6">
      {/* Top row: avatar + name + date + stars */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Link href={`/user/${review.user.id}`} className="flex items-center gap-3 group/user">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#ff7a00] to-[#ff9a3d] text-sm font-bold text-black shadow-sm transition-transform group-hover/user:scale-105">
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
            <p className="text-sm font-semibold text-white transition-colors group-hover/user:text-[#ffb36d]">
              {review.user.name}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </Link>

        {/* Star rating badge */}
        <div className="flex w-fit items-center gap-1.5 rounded-full border border-[#ff7a00]/25 bg-[#ff7a00]/10 px-3 py-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= review.rating
                    ? "fill-[#FF8D28] text-[#FF8D28]"
                    : "fill-zinc-800 text-zinc-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[#ffb36d]">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review text */}
      <p className="mb-5 text-sm leading-relaxed text-zinc-300">
        {review.comment}
      </p>

      {/* Bottom row: vote buttons */}
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
        <span className="mr-auto text-xs text-zinc-500">Was this helpful?</span>

        {/* Upvote */}
        <button
          onClick={() => handleVote("UPVOTE")}
          disabled={voteReview.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            isUpvoted
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm scale-105"
              : "bg-white/[0.04] text-zinc-500 border-white/10 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10"
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
              : "bg-white/[0.04] text-zinc-500 border-white/10 hover:border-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10"
          }`}
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${isDownvoted ? "fill-white" : ""}`} />
          <span>{review.downvotes}</span>
        </button>
      </div>
    </div>
  );
};
