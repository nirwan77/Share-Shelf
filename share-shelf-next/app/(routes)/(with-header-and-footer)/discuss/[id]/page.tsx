"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit2, ThumbsDown, ThumbsUp, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeletePost, useVotePost } from "../action";
import {
  Comment,
  Post,
  useAddComment,
  useComments,
  usePost,
  useUpdatePost,
  useVoteComment,
} from "./action";
import { useGetProfile } from "../../profile/action";

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
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-700`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-zinc-300">{initials}</span>
      )}
    </div>
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
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
      />
    </svg>
  );
}

const applyCommentVoteTransition = (
  current: Comment,
  nextVote: "UPVOTE" | "DOWNVOTE",
): Comment => {
  const updated = { ...current };

  if (current.myVote === nextVote) {
    updated.myVote = null;
    if (nextVote === "UPVOTE") updated.upvotes = Math.max(0, current.upvotes - 1);
    if (nextVote === "DOWNVOTE") updated.downvotes = Math.max(0, current.downvotes - 1);
    return updated;
  }

  if (current.myVote === "UPVOTE") updated.upvotes = Math.max(0, current.upvotes - 1);
  if (current.myVote === "DOWNVOTE") updated.downvotes = Math.max(0, current.downvotes - 1);

  updated.myVote = nextVote;
  if (nextVote === "UPVOTE") updated.upvotes += 1;
  if (nextVote === "DOWNVOTE") updated.downvotes += 1;
  return updated;
};

const applyPostVoteTransition = (
  current: Post,
  nextVote: "UPVOTE" | "DOWNVOTE",
): Post => {
  const updated = { ...current };

  if (current.myVote === nextVote) {
    updated.myVote = null;
    if (nextVote === "UPVOTE") updated.upvotes = Math.max(0, current.upvotes - 1);
    if (nextVote === "DOWNVOTE") updated.downvotes = Math.max(0, current.downvotes - 1);
    return updated;
  }

  if (current.myVote === "UPVOTE") updated.upvotes = Math.max(0, current.upvotes - 1);
  if (current.myVote === "DOWNVOTE") updated.downvotes = Math.max(0, current.downvotes - 1);

  updated.myVote = nextVote;
  if (nextVote === "UPVOTE") updated.upvotes += 1;
  if (nextVote === "DOWNVOTE") updated.downvotes += 1;
  return updated;
};

function CommentItem({
  comment,
  postId,
}: {
  comment: Comment;
  postId: string;
}) {
  const queryClient = useQueryClient();
  const voteComment = useVoteComment(postId);
  const { token } = useAuth();

  const handleVote = (reaction: "UPVOTE" | "DOWNVOTE") => {
    if (!token) {
      toast.error("Please login to vote on comments");
      return;
    }

    const previousComment = comment;
    queryClient.setQueryData(["comments", postId], (old: Comment[] | undefined) =>
      old?.map((c) => (c.id === comment.id ? applyCommentVoteTransition(c, reaction) : c)) ?? old,
    );

    voteComment.mutate(
      { commentId: comment.id, reaction },
      {
        onError: () => {
          queryClient.setQueryData(["comments", postId], (old: Comment[] | undefined) =>
            old?.map((c) => (c.id === comment.id ? previousComment : c)) ?? old,
          );
          toast.error("Failed to register vote.");
        },
      },
    );
  };

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/user/${comment.user.id}`}>
        <Avatar src={comment.user.avatar} name={comment.user.name} size="w-8 h-8" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Link
            href={`/user/${comment.user.id}`}
            className="text-sm font-semibold text-white transition-colors hover:text-orange-500"
          >
            {comment.user.name}
          </Link>
          <span className="text-xs text-zinc-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="wrap-break-words text-sm text-zinc-300">{comment.comment}</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => handleVote("UPVOTE")}
            disabled={voteComment.isPending}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
              comment.myVote === "UPVOTE"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 text-zinc-500 hover:border-emerald-500/70 hover:text-emerald-400"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${comment.myVote === "UPVOTE" ? "fill-current" : ""}`} />
            <span>{comment.upvotes}</span>
          </button>
          <button
            onClick={() => handleVote("DOWNVOTE")}
            disabled={voteComment.isPending}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
              comment.myVote === "DOWNVOTE"
                ? "border-rose-500 bg-rose-500/10 text-rose-400"
                : "border-zinc-700 text-zinc-500 hover:border-rose-500/70 hover:text-rose-400"
            }`}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${comment.myVote === "DOWNVOTE" ? "fill-current" : ""}`} />
            <span>{comment.downvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/4 rounded bg-zinc-700" />
          <div className="h-3 w-1/6 rounded bg-zinc-700" />
        </div>
      </div>
      <div className="h-4 w-3/4 rounded bg-zinc-700" />
      <div className="h-4 w-1/2 rounded bg-zinc-700" />
    </div>
  );
}

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data: post, isLoading: postLoading, isError } = usePost(postId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(postId);
  const votePost = useVotePost();
  const addComment = useAddComment(postId);

  const [commentInput, setCommentInput] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost(postId);

  const handleVote = (reaction: "UPVOTE" | "DOWNVOTE") => {
    if (!token) {
      toast.error("Please login to vote on posts");
      return;
    }
    const previousPost = post;
    queryClient.setQueryData(["post", postId], (old: Post | undefined) =>
      old ? applyPostVoteTransition(old, reaction) : old,
    );
    votePost.mutate(
      { id: postId, reaction },
      {
        onError: () => {
          queryClient.setQueryData(["post", postId], previousPost);
          toast.error("Failed to register vote.");
        },
      },
    );
  };

  const handleUpdate = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    if (!editTitle.trim()) return;
    try {
      await updatePost({
        title: editTitle,
        content: editContent,
        image: editImage,
      });
      setIsEditing(false);
      setPreview(null);
    } catch (err) {
      console.error("Failed to update post", err);
      alert("Failed to update post. Please try again.");
    }
  };

  const startEditing = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setEditImage(post.image || null);
    setPreview(null);
    setIsEditing(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setEditImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setEditImage(null);
    setPreview(null);
  };

  const handleDelete = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    try {
      await deletePost(postId);
      router.push("/discuss");
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const submitComment = () => {
    if (!token) {
      toast.error("Please login to post a comment");
      return;
    }
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

  const isLoading = postLoading || commentsLoading;
  const truncatedContent =
    post?.content && post.content.length > 500 && !isExpanded
      ? `${post.content.slice(0, 500)}...`
      : post?.content;

  return (
    <div className="container mx-auto pt-16">
      {isLoading && <PostSkeleton />}
      {isError && <div className="py-8 text-center text-sm text-red-400">Failed to load post.</div>}
      {post && (
        <div>
          <div className="flex items-center gap-3 p-4 pb-3">
            <Link href={`/user/${post.createdByUser.id}`}>
              <Avatar src={post.createdByUser.avatar} name={post.createdByUser.name} />
            </Link>
            <div>
              <Link
                href={`/user/${post.createdByUser.id}`}
                className="text-sm font-semibold text-white transition-colors hover:text-orange-500"
              >
                {post.createdByUser.name}
              </Link>
              <p className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</p>
            </div>

            <div className="ml-auto flex gap-1">
              {profile?.id === post.createdByUser.id && (
                <>
                  <button
                    onClick={startEditing}
                    className="cursor-pointer border-none bg-transparent p-2 text-zinc-500 transition-colors hover:text-[#e8630a]"
                    title="Edit post"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="cursor-pointer border-none bg-transparent p-2 text-zinc-500 transition-colors hover:text-red-400"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="px-4 pb-3">
            {isEditing ? (
              <div className="space-y-3">
                <div className="group/image relative">
                  {editImage ? (
                    <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
                      <img
                        src={preview || (typeof editImage === "string" ? editImage : "")}
                        alt="preview"
                        className="max-h-[300px] h-auto w-full object-contain"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute right-2 top-2 cursor-pointer rounded-full border-none bg-red-600/80 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800 text-zinc-500 transition-all hover:border-[#e8630a] hover:text-[#e8630a]"
                    >
                      <Upload size={24} className="transition-transform group-hover:scale-110" />
                      <span className="text-xs font-semibold">Add Image</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-lg font-bold text-white outline-none transition-colors focus:border-[#e8630a]"
                  placeholder="Post title"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[150px] w-full resize-y rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-200 outline-none transition-colors focus:border-[#e8630a]"
                  placeholder="What's on your mind?"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border-none bg-transparent px-4 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-800"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#e8630a] px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#ff7a21] disabled:opacity-50"
                  >
                    <Check size={14} /> {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="mb-3 text-xl font-bold text-white">{post.title}</h1>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                  {truncatedContent}
                </p>
                {post.content && post.content.length > 500 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 cursor-pointer border-none bg-transparent text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    {isExpanded ? "See Less" : "See More"}
                  </button>
                )}
              </>
            )}
          </div>

          {!isEditing && post.image && (
            <div className="px-4 pb-3">
              <img
                src={post.image}
                alt="post"
                className="max-h-[600px] h-auto w-full rounded-xl bg-zinc-900/50 object-contain"
              />
            </div>
          )}

          <div className="flex items-center gap-4 border-b border-zinc-800 px-4 pb-4 pt-1">
            <button
              onClick={() => handleVote("UPVOTE")}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                post.myVote === "UPVOTE"
                  ? "text-emerald-400"
                  : "text-zinc-500 hover:text-emerald-400"
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${post.myVote === "UPVOTE" ? "fill-current" : ""}`} />
              <span>{post.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote("DOWNVOTE")}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                post.myVote === "DOWNVOTE"
                  ? "text-rose-400"
                  : "text-zinc-500 hover:text-rose-400"
              }`}
            >
              <ThumbsDown className={`h-4 w-4 ${post.myVote === "DOWNVOTE" ? "fill-current" : ""}`} />
              <span>{post.downvotes}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <CommentIcon />
              <span>{post._count.comments}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="join conversation"
              disabled={addComment.isPending}
              className="flex-1 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60"
            />
            {commentInput.trim() && (
              <button
                onClick={submitComment}
                disabled={addComment.isPending}
                className="text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
              >
                {addComment.isPending ? "Posting..." : "Post"}
              </button>
            )}
          </div>

          <div className="divide-y divide-zinc-800 px-4">
            {!commentsLoading && comments.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500">
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={postId} />
            ))}
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-in zoom-in rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl duration-200 fade-in">
            <h3 className="mb-2 text-lg font-bold text-white">Delete Post?</h3>
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              Are you sure you want to delete this post? This action cannot be undone and will remove all associated comments.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cursor-pointer rounded-xl border-none bg-transparent px-4 py-2 text-[13px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl border-none bg-red-600 px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
