"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useLikePost } from "../action";
import {
  Comment,
  Post,
  useAddComment,
  useComments,
  useLikeComment,
  usePost,
} from "./action";
import { useQueryClient } from "@tanstack/react-query";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function Avatar({
  src,
  name,
  size = "w-10 h-10",
}: {
  src?: string | null;
  name: string;
  size?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`${size} rounded-full overflow-hidden shrink-0 bg-zinc-700 flex items-center justify-center`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-zinc-300">{initials}</span>
      )}
    </div>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
      />
    </svg>
  );
}

function CommentItem({
  comment,
  postId,
}: {
  comment: Comment;
  postId: string;
}) {
  const queryClient = useQueryClient();
  const likeComment = useLikeComment(postId);

  const handleLike = () => {
    // Optimistic update against the comments cache
    queryClient.setQueryData(
      ["comments", postId],
      (old: Comment[] | undefined) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id !== comment.id) return c;
          const liked = c.isLikedByMe;
          return {
            ...c,
            isLikedByMe: !liked,
            _count: {
              reactions: (c._count?.reactions ?? 0) + (liked ? -1 : 1),
            },
          };
        });
      },
    );

    likeComment.mutate(comment.id);
  };

  const reactionCount = comment._count?.reactions ?? 0;

  return (
    <div className="flex gap-3 py-3">
      <Avatar
        src={comment.user.avatar}
        name={comment.user.name}
        size="w-8 h-8"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">
            {comment.user.name}
          </span>
          <span className="text-xs text-zinc-500">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-zinc-300 wrap-break-words">
          {comment.comment}
        </p>
        <button
          onClick={handleLike}
          disabled={likeComment.isPending}
          className={`mt-1.5 flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
            comment.isLikedByMe
              ? "text-red-400"
              : "text-zinc-500 hover:text-red-400"
          }`}
        >
          <HeartIcon filled={comment.isLikedByMe} />
          {reactionCount > 0 && <span>{reactionCount}</span>}
        </button>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-zinc-700" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-zinc-700 rounded w-1/4" />
          <div className="h-3 bg-zinc-700 rounded w-1/6" />
        </div>
      </div>
      <div className="h-4 bg-zinc-700 rounded w-3/4" />
      <div className="h-4 bg-zinc-700 rounded w-1/2" />
    </div>
  );
}

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const queryClient = useQueryClient();

  const { data: post, isLoading: postLoading, isError } = usePost(postId);
  const { data: comments = [], isLoading: commentsLoading } =
    useComments(postId);
  const likePost = useLikePost();
  const addComment = useAddComment(postId);
  const [commentInput, setCommentInput] = useState("");

  const handleLike = () => {
    queryClient.setQueryData(["post", postId], (old: Post | undefined) => {
      if (!old) return old;
      const liked = old.isLikedByMe;
      return {
        ...old,
        isLikedByMe: !liked,
        _count: {
          ...old._count,
          reactions: old._count.reactions + (liked ? -1 : 1),
        },
      };
    });
    likePost.mutate(postId, {
      onError: () => {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
      },
    });
  };

  const submitComment = () => {
    if (!commentInput.trim() || addComment.isPending) return;
    addComment.mutate(commentInput.trim(), {
      onSuccess: () => setCommentInput(""),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  };

  const isLiked = post?.isLikedByMe ?? false;
  const isLoading = postLoading || commentsLoading;

  return (
    <div className="pt-16 container mx-auto">
      {isLoading && <PostSkeleton />}
      {isError && (
        <div className="text-red-400 text-sm text-center py-8">
          Failed to load post.
        </div>
      )}
      {post && (
        <div className="">
          <div className="flex items-center gap-3 p-4 pb-3">
            <Avatar
              src={post.createdByUser.avatar}
              name={post.createdByUser.name}
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {post.createdByUser.name}
              </p>
              <p className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="text-sm text-zinc-200 leading-relaxed">
              {post.content}
            </p>
          </div>

          {post.image && (
            <div className="px-4 pb-3">
              <img
                src={post.image}
                alt="post"
                className="rounded-xl w-full object-cover max-h-96"
              />
            </div>
          )}

          <div className="flex items-center gap-4 px-4 pb-4 pt-1 border-b border-zinc-800">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isLiked ? "text-red-400" : "text-zinc-500 hover:text-red-400"
              }`}
            >
              <HeartIcon filled={isLiked} />
              <span>{post._count.reactions}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <CommentIcon />
              <span>{post._count.comments}</span>
            </div>
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="join conversation"
              disabled={addComment.isPending}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors disabled:opacity-60"
            />
            {commentInput.trim() && (
              <button
                onClick={submitComment}
                disabled={addComment.isPending}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
              >
                {addComment.isPending ? "Posting..." : "Post"}
              </button>
            )}
          </div>

          <div className="px-4 divide-y divide-zinc-800">
            {!commentsLoading && comments.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-6">
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={postId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
