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
import { useDeletePost } from "../action";
import { useGetProfile } from "../../profile/action";
import { Trash2, Edit2, X, Check, Image as ImageIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUpdatePost } from "./action";
import { useRef, ChangeEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts";

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

function EyeIcon() {
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
        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
  const { token } = useAuth();

  const handleLike = () => {
    if (!token) {
      toast.error("Please login to like comments");
      return;
    }
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
      <Link href={`/user/${comment.user.id}`}>
        <Avatar
          src={comment.user.avatar}
          name={comment.user.name}
          size="w-8 h-8"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/user/${comment.user.id}`}
            className="text-sm font-semibold text-white hover:text-orange-500 transition-colors"
          >
            {comment.user.name}
          </Link>
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
          className={`mt-1.5 flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${comment.isLikedByMe
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
  const { token } = useAuth();

  const { data: post, isLoading: postLoading, isError } = usePost(postId);
  const { data: comments = [], isLoading: commentsLoading } =
    useComments(postId);
  const likePost = useLikePost();
  const addComment = useAddComment(postId);

  const [commentInput, setCommentInput] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
  const {
    mutateAsync: updatePost,
    isPending: isUpdating,
  } = useUpdatePost(postId);

  const handleLike = () => {
    if (!token) {
      toast.error("Please login to like posts");
      return;
    }
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
        image: editImage
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

  const isLiked = post?.isLikedByMe ?? false;
  const isLoading = postLoading || commentsLoading;
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedContent =
    post?.content && post.content.length > 500 && !isExpanded
      ? post.content.slice(0, 500) + "..."
      : post?.content;

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
            <Link href={`/user/${post.createdByUser.id}`}>
              <Avatar
                src={post.createdByUser.avatar}
                name={post.createdByUser.name}
              />
            </Link>
            <div>
              <Link
                href={`/user/${post.createdByUser.id}`}
                className="text-sm font-semibold text-white hover:text-orange-500 transition-colors"
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
                    className="p-2 text-zinc-500 hover:text-[#e8630a] transition-colors bg-transparent border-none cursor-pointer"
                    title="Edit post"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
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
                <div className="relative group/image">
                  {editImage ? (
                    <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                      <img
                        src={preview || (typeof editImage === 'string' ? editImage : '')}
                        alt="preview"
                        className="w-full h-auto max-h-[300px] object-contain"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg border-none cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 hover:border-[#e8630a] bg-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#e8630a] transition-all cursor-pointer group"
                    >
                      <Upload size={24} className="group-hover:scale-110 transition-transform" />
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-lg font-bold text-white outline-none focus:border-[#e8630a] transition-colors"
                  placeholder="Post title"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 leading-relaxed outline-none focus:border-[#e8630a] transition-colors min-h-[150px] resize-y"
                  placeholder="What's on your mind?"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-800 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-[#e8630a] hover:bg-[#ff7a21] transition-colors border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check size={14} /> {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white mb-3">{post.title}</h1>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {truncatedContent}
                </p>
                {post.content && post.content.length > 500 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold mt-2 bg-transparent border-none cursor-pointer"
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
                className="rounded-xl w-full h-auto max-h-[600px] object-contain bg-zinc-900/50"
              />
            </div>
          )}

          <div className="flex items-center gap-4 px-4 pb-4 pt-1 border-b border-zinc-800">
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              {/* <EyeIcon />
              <span>{post.viewsCount.toLocaleString()}</span> */}
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-red-400" : "text-zinc-500 hover:text-red-400"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone and will remove all associated comments.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-500 hover:bg-zinc-800 transition-colors bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors border-none cursor-pointer disabled:opacity-50"
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
