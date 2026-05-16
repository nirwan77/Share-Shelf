"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock3,
  FileText,
  Flag,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import {
  DiscussData,
  DiscussVote,
  useDeletePost,
  useGetPostData,
  useReportPost,
  useVotePost,
} from "./action";
import { ReportModal } from "./components/ReportModal";

type VoteState = {
  myVote: DiscussVote;
  upvotes: number;
  downvotes: number;
};

const applyVoteTransition = (
  current: VoteState,
  nextVote: Exclude<DiscussVote, null>,
): VoteState => {
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

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState("latest");
  const [timeRange, setTimeRange] = useState("all_time");
  const [postVotes, setPostVotes] = useState<Record<string, VoteState>>({});
  const [postText, setPostText] = useState("");
  const [page, setPage] = useState(1);
  const [accumulatedPosts, setAccumulatedPosts] = useState<DiscussData["posts"]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const { data, isLoading: queryLoading, isError } = useGetPostData({
    sortBy: ["latest", "most_liked", "most_commented"].includes(activeTab)
      ? activeTab
      : undefined,
    filter: ["my_posts", "following"].includes(activeTab) ? activeTab : undefined,
    timeRange,
    page,
    limit: 10,
  });
  const { mutateAsync: votePost } = useVotePost();
  const { data: profile } = useGetProfile();
  const { token } = useAuth();
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: reportPost, isPending: isReporting } = useReportPost();
  const { push } = useRouter();

  useEffect(() => {
    setPage(1);
    setAccumulatedPosts([]);
  }, [activeTab, timeRange]);

  useEffect(() => {
    if (!data?.posts) return;

    setAccumulatedPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newPosts = data.posts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newPosts];
    });

    setPostVotes((prev) => {
      const next = { ...prev };
      data.posts.forEach((post) => {
        next[post.id] = {
          myVote: post.myVote ?? null,
          upvotes: post.upvotes ?? 0,
          downvotes: post.downvotes ?? 0,
        };
      });
      return next;
    });
  }, [data]);

  const toggleVote = async (id: string, reaction: Exclude<DiscussVote, null>) => {
    if (!token) {
      toast.error("Please login to vote on posts");
      return;
    }

    const previousState = postVotes[id] ?? {
      myVote: null,
      upvotes: 0,
      downvotes: 0,
    };

    setPostVotes((prev) => ({
      ...prev,
      [id]: applyVoteTransition(prev[id] ?? previousState, reaction),
    }));

    try {
      await votePost({ id, reaction });
    } catch {
      setPostVotes((prev) => ({ ...prev, [id]: previousState }));
      toast.error("Failed to register vote.");
    }
  };

  const handleDelete = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    if (!deletingPostId) return;
    try {
      await deletePost(deletingPostId);
      setAccumulatedPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      setDeletingPostId(null);
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const openReportPost = (postId: string) => {
    if (!token) {
      toast.error("Please login to report posts");
      return;
    }

    setReportingPostId(postId);
  };

  const handleReportPost = async (reason: string, details?: string) => {
    if (!reportingPostId) return;

    try {
      await reportPost({ id: reportingPostId, reason, details });
      toast.success("Report submitted");
      setReportingPostId(null);
    } catch (err) {
      console.error("Failed to report post", err);
      toast.error("Failed to submit report.");
      throw err;
    }
  };

  const formatDate = (dateStr: string) => dayjs(dateStr).format("DD/MM/YYYY");

  const tabs = [
    { id: "latest", label: "Newest and Recent", sub: "Find the latest posts", icon: Clock3 },
    { id: "following", label: "Following", sub: "Posts from people you follow", icon: Users },
    { id: "my_posts", label: "My Posts", sub: "Overview of your contributions", icon: FileText },
    { id: "most_liked", label: "Most Liked", sub: "Posts with most upvotes", icon: ThumbsUp },
    { id: "most_commented", label: "Most Commented", sub: "Most active discussions", icon: MessageCircle },
  ];

  return (
    <div className="flex min-h-screen flex-col pt-28 text-[#e0e0e0] lg:flex-row lg:pt-16">
      <aside className="w-full shrink-0 border-b border-white/10 bg-[#080808]/95 px-4 py-3 lg:w-[220px] lg:border-r lg:border-b-0 lg:px-2.5 lg:py-4">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[170px] cursor-pointer items-center gap-2.5 rounded-xl border-none px-3 py-2.5 text-left transition-colors duration-200 lg:min-w-0 ${
                  activeTab === tab.id ? "bg-[#2e2e2e]" : "bg-transparent"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    activeTab === tab.id ? "bg-[#e8630a] text-black" : "bg-[#3a3a3a] text-[#aaa]"
                  }`}
                >
                  <TabIcon size={17} />
                </div>
                <div className="flex-1">
                  <div
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      activeTab === tab.id ? "text-white" : "text-[#aaa]"
                    }`}
                  >
                    {tab.label}
                  </div>
                  <div className="mt-px text-[9px] text-[#666]">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {data && (
        <div className="flex-1 px-4 py-5 sm:px-6">
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111114] px-4 py-3 sm:flex-row sm:items-center">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
                <User size={18} />
              </div>
            )}
            <input
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Let's share what going on your mind..."
              className="min-h-10 flex-1 border-none bg-transparent text-[13px] text-[#ccc] outline-none"
            />
            <button
              onClick={() => {
                if (!token) {
                  toast.error("Please login to create a post");
                  return;
                }
                push(`/discuss/post?content=${encodeURIComponent(postText)}`);
              }}
              className="cursor-pointer whitespace-nowrap rounded-xl border-none bg-[#ff7a00] px-[18px] py-2.5 text-[13px] font-bold text-black transition-all hover:bg-[#ff922f]"
            >
              Create Post
            </button>
          </div>

          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[13px] text-[#888]">
              {queryLoading && page === 1 ? "Loading..." : `${data.meta.total ?? 0} Results`}
            </span>
            <div className="flex items-center gap-2 text-[13px] text-[#aaa]">
              Time Range:
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="cursor-pointer rounded-md border border-[#444] bg-[#2a2a2a] px-2 py-1 text-[13px] text-[#e8630a]"
              >
                <option value="all_time">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
              </select>
            </div>
          </div>

          {queryLoading && page === 1 && (
            <div className="mt-10 text-center text-[13px] text-[#666]">Loading posts...</div>
          )}
          {isError && (
            <div className="mt-10 text-center text-[13px] text-[#e8630a]">
              Failed to load posts. Please try again.
            </div>
          )}

          {(!queryLoading || page > 1) && !isError && (
            <div className="flex flex-col gap-3.5">
              {accumulatedPosts.map((post) => {
                const voteState = postVotes[post.id] ?? {
                  myVote: post.myVote,
                  upvotes: post.upvotes,
                  downvotes: post.downvotes,
                };

                return (
                  <div
                    onClick={() => push(`/discuss/${post.id}`)}
                    key={post.id}
                    className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-white/10 bg-[#111114] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff7a00]/40 sm:flex-row sm:items-start"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt="post"
                        className="h-[150px] w-full shrink-0 rounded-xl object-cover sm:h-[130px] sm:w-[100px]"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <Link
                          href={`/user/${post.createdByUser.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="group/user flex items-center gap-2"
                        >
                          {post.createdByUser.avatar ? (
                            <img
                              src={post.createdByUser.avatar}
                              alt={post.createdByUser.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8630a33] text-[13px] font-bold text-[#e8630a]">
                              {post.createdByUser.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div>
                            <div className="text-[13px] font-semibold text-white transition-colors group-hover/user:text-[#e8630a]">
                              {post.createdByUser.name ?? "Unknown"}
                            </div>
                            <div className="text-[10px] text-[#666]">
                              {formatDate(post.createdAt)}
                            </div>
                          </div>
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#888]">
                          <span>{voteState.upvotes.toLocaleString()} upvotes</span>
                          <span>{voteState.downvotes.toLocaleString()} downvotes</span>
                          <span>{post._count.comments ?? 0} comments</span>

                          {profile?.id === post.createdByUser.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setDeletingPostId(post.id);
                              }}
                              className="cursor-pointer border-none bg-transparent text-[#666] transition-colors hover:text-red-500"
                              title="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          {profile?.id !== post.createdByUser.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                openReportPost(post.id);
                              }}
                              disabled={isReporting}
                              className="cursor-pointer border-none bg-transparent text-[#666] transition-colors hover:text-amber-400 disabled:opacity-50"
                              title="Report post"
                            >
                              <Flag size={16} />
                            </button>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleVote(post.id, "UPVOTE");
                              }}
                              className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors ${
                                voteState.myVote === "UPVOTE"
                                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                                  : "border-[#3a3a3a] text-[#777] hover:border-emerald-500/60 hover:text-emerald-400"
                              }`}
                              title="Upvote post"
                            >
                              <ThumbsUp
                                size={14}
                                className={voteState.myVote === "UPVOTE" ? "fill-current" : ""}
                              />
                              <span className="text-[11px]">{voteState.upvotes}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleVote(post.id, "DOWNVOTE");
                              }}
                              className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors ${
                                voteState.myVote === "DOWNVOTE"
                                  ? "border-rose-500 bg-rose-500/15 text-rose-400"
                                  : "border-[#3a3a3a] text-[#777] hover:border-rose-500/60 hover:text-rose-400"
                              }`}
                              title="Downvote post"
                            >
                              <ThumbsDown
                                size={14}
                                className={voteState.myVote === "DOWNVOTE" ? "fill-current" : ""}
                              />
                              <span className="text-[11px]">{voteState.downvotes}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h3 className="mb-1 line-clamp-1 text-[15px] font-bold text-white">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-[#ccc]">
                          {post.content ?? ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(data.meta.total ?? 0) > accumulatedPosts.length && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={queryLoading}
                  className="mt-4 rounded-xl border border-[#333] bg-[#2a2a2a] py-2.5 text-sm text-[#aaa] transition-colors hover:bg-[#333] disabled:opacity-50"
                >
                  {queryLoading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {deletingPostId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-in rounded-2xl border border-[#333] bg-[#242424] p-6 shadow-2xl duration-200 fade-in zoom-in">
            <h3 className="mb-2 text-lg font-bold text-white">Delete Post?</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#aaa]">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingPostId(null)}
                className="cursor-pointer rounded-xl border-none bg-transparent px-4 py-2 text-[13px] font-semibold text-[#888] transition-colors hover:bg-[#2e2e2e]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer rounded-xl border-none bg-red-600 px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        open={!!reportingPostId}
        targetLabel="post"
        isSubmitting={isReporting}
        onOpenChange={(open) => {
          if (!open) setReportingPostId(null);
        }}
        onSubmit={handleReportPost}
      />
    </div>
  );
}
