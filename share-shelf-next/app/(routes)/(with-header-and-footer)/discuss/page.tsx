"use client";

import { useEffect, useState } from "react";
import { DiscussData, useDeletePost, useGetPostData, useLikePost } from "./action";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import { Trash2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts";

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState("latest");
  const [timeRange, setTimeRange] = useState("all_time");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [postText, setPostText] = useState("");
  const [page, setPage] = useState(1);
  const [accumulatedPosts, setAccumulatedPosts] = useState<DiscussData["posts"]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const { data, isLoading: queryLoading, isError } = useGetPostData({
    sortBy: ["latest", "most_liked", "most_commented"].includes(activeTab) ? activeTab : undefined,
    filter: ["my_posts", "following"].includes(activeTab) ? activeTab : undefined,
    timeRange,
    page,
    limit: 10,
  });
  const { mutateAsync } = useLikePost();
  const { data: profile } = useGetProfile();
  const { token } = useAuth();
  const { mutateAsync: deletePost } = useDeletePost();

  const { push } = useRouter();

  useEffect(() => {
    setPage(1);
    setAccumulatedPosts([]);
  }, [activeTab, timeRange]);

  useEffect(() => {
    if (!data?.posts) return;

    setAccumulatedPosts((prev: DiscussData["posts"]) => {
      // Avoid duplicates if React Query refetches the same page
      const existingIds = new Set(prev.map((p) => p.id));
      const newPosts = data.posts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newPosts];
    });

    const newLiked: Record<string, boolean> = { ...liked };
    const newCounts: Record<string, number> = { ...likeCounts };
    data.posts.forEach((post) => {
      newLiked[post.id] = post.isLikedByMe ?? false;
      newCounts[post.id] = post._count?.reactions ?? 0;
    });
    setLiked(newLiked);
    setLikeCounts(newCounts);
  }, [data]);

  const toggleLike = async (id: string) => {
    if (!token) {
      toast.error("Please login to like posts");
      return;
    }
    const isCurrentlyLiked = liked[id];

    setLiked((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [id]: isCurrentlyLiked ? prev[id] - 1 : prev[id] + 1,
    }));

    try {
      await mutateAsync(id);
    } catch {
      setLiked((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [id]: isCurrentlyLiked ? prev[id] + 1 : prev[id] - 1,
      }));
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

  const formatDate = (dateStr: string) => dayjs(dateStr).format("DD/MM/YYYY");

  const tabs = [
    { id: "latest", label: "Newest and Recent", sub: "Find the latest posts" },
    {
      id: "following",
      label: "Following",
      sub: "Posts from people you follow",
    },
    {
      id: "my_posts",
      label: "My Posts",
      sub: "Overview of your contributions",
    },
    {
      id: "most_liked",
      label: "Most Liked",
      sub: "Posts with most reactions",
    },
    {
      id: "most_commented",
      label: "Most Commented",
      sub: "Most active discussions",
    },
  ];

  return (
    <div className="flex pt-16 min-h-screen text-[#e0e0e0]">
      <aside className="w-[200px] bg-[#242424] px-2.5 py-4 flex flex-col gap-1 border-r border-[#2e2e2e] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-none text-left transition-colors duration-200 cursor-pointer ${activeTab === tab.id ? "bg-[#2e2e2e]" : "bg-transparent"
              }`}
          >
            <div
              className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${activeTab === tab.id ? "bg-[#e8630a]" : "bg-[#3a3a3a]"}`}
            >
              {tab.id === "latest" ? "🆕" : tab.id === "following" ? "👥" : tab.id === "my_posts" ? "📝" : tab.id === "most_liked" ? "❤️" : "💬"}
            </div>
            <div className="flex-1">
              <div
                className={`text-[11px] font-semibold flex items-center gap-1 ${activeTab === tab.id ? "text-white" : "text-[#aaa]"}`}
              >
                {tab.label}
              </div>
              <div className="text-[9px] text-[#666] mt-px">{tab.sub}</div>
            </div>
          </button>
        ))}
      </aside>

      {data && (
        <div className="flex-1 px-6 py-5">
          <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl px-4 py-2.5 mb-5 border border-[#333]">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                <User size={18} />
              </div>
            )}
            <input
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Let's share what going on your mind..."
              className="flex-1 bg-transparent border-none outline-none text-[#ccc] text-[13px]"
            />
            <button
              onClick={() => {
                if (!token) {
                  toast.error("Please login to create a post");
                  return;
                }
                push(`/discuss/post?content=${encodeURIComponent(postText)}`);
              }}
              className="bg-[#e8630a] text-white border-none rounded-lg px-[18px] py-2 font-semibold text-[13px] cursor-pointer whitespace-nowrap"
            >
              Create Post
            </button>
          </div>

          <div className="flex justify-between items-center mb-3.5">
            <span className="text-[13px] text-[#888]">
              {queryLoading && page === 1 ? "Loading..." : `${data?.meta?.total ?? 0} Results`}
            </span>
            <div className="flex items-center gap-2 text-[13px] text-[#aaa]">
              Time Range:
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-[#2a2a2a] border border-[#444] text-[#e8630a] rounded-md px-2 py-1 text-[13px] cursor-pointer"
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
            <div className="text-[#666] text-[13px] text-center mt-10">
              Loading posts...
            </div>
          )}
          {isError && (
            <div className="text-[#e8630a] text-[13px] text-center mt-10">
              Failed to load posts. Please try again.
            </div>
          )}

          {(!queryLoading || page > 1) && !isError && (
            <div className="flex flex-col gap-3.5">
              {accumulatedPosts.map((post) => (
                <div
                  onClick={() => push(`/discuss/${post.id}`)}
                  key={post.id}
                  className="bg-[#242424] cursor-pointer rounded-2xl border border-[#2e2e2e] p-4 flex gap-4 items-start transition-colors duration-200 hover:border-[#e8630a55]"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-[100px] h-[130px] object-cover rounded-lg shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/user/${post.createdByUser.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 group/user"
                      >
                        {post.createdByUser?.avatar ? (
                          <img
                            src={post.createdByUser.avatar}
                            alt={post.createdByUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#e8630a33] flex items-center justify-center text-[13px] font-bold text-[#e8630a]">
                            {post.createdByUser?.name?.[0]?.toUpperCase() ??
                              "?"}
                          </div>
                        )}
                        <div>
                          <div className="text-[13px] font-semibold text-white group-hover/user:text-[#e8630a] transition-colors">
                            {post.createdByUser?.name ?? "Unknown"}
                          </div>
                          <div className="text-[10px] text-[#666]">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 text-[12px] text-[#888]">
                        {/* <span>{post.viewsCount.toLocaleString()} Views</span> */}
                        <span>
                          {(likeCounts[post.id] ?? 0).toLocaleString()} Likes
                        </span>
                        <span>{post._count?.comments ?? 0} comments</span>

                        {profile?.id === post.createdByUser?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDeletingPostId(post.id);
                            }}
                            className="bg-transparent border-none cursor-pointer text-[#666] hover:text-red-500 transition-colors"
                            title="Delete post"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleLike(post.id);
                          }}
                          className={`bg-transparent border-none cursor-pointer text-lg transition-all duration-200 ${liked[post.id]
                            ? "text-[#e8630a] scale-125"
                            : "text-[#555] scale-100"
                            }`}
                        >
                          ♥
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-[15px] font-bold text-white line-clamp-1 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-[13px] text-[#ccc] leading-relaxed line-clamp-2">
                        {post.content ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {(data?.meta?.total ?? 0) > accumulatedPosts.length && (
                <button
                  onClick={() => setPage((p: number) => p + 1)}
                  disabled={queryLoading}
                  className="mt-4 bg-[#2a2a2a] hover:bg-[#333] text-[#aaa] border border-[#333] rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  {queryLoading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPostId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#242424] border border-[#333] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-[#aaa] text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#888] hover:bg-[#2e2e2e] transition-colors bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
