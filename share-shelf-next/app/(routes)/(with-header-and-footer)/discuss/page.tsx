"use client";

import { useEffect, useState } from "react";
import { useGetPostData, useLikePost } from "./action";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState("newest");
  const [sortBy, setSortBy] = useState("Today");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [postText, setPostText] = useState("");

  const { data, isLoading, isError } = useGetPostData();
  const { mutateAsync } = useLikePost();

  const { push } = useRouter();

  useEffect(() => {
    if (!data) return;
    const initialLiked: Record<string, boolean> = {};
    const initialCounts: Record<string, number> = {};
    data.forEach((post) => {
      initialLiked[post.id] = post.isLikedByMe ?? false;
      initialCounts[post.id] = post._count?.reactions ?? 0;
    });
    setLiked(initialLiked);
    setLikeCounts(initialCounts);
  }, [data]);

  const toggleLike = async (id: string) => {
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

  const formatDate = (dateStr: string) => dayjs(dateStr).format("DD/MM/YYYY");

  const tabs = [
    { id: "newest", label: "Newest and Recent", sub: "Find the latest posts" },
    {
      id: "popular",
      label: "Popular of the day",
      sub: "Check featured today by craters",
    },
    {
      id: "following",
      label: "Following",
      badge: 89,
      sub: "Follow from your favorite persons",
    },
  ];

  return (
    <div className="flex pt-16 min-h-screen text-[#e0e0e0]">
      <aside className="w-[200px] bg-[#242424] px-2.5 py-4 flex flex-col gap-1 border-r border-[#2e2e2e] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-none text-left transition-colors duration-200 cursor-pointer ${
              activeTab === tab.id ? "bg-[#2e2e2e]" : "bg-transparent"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${activeTab === tab.id ? "bg-[#e8630a]" : "bg-[#3a3a3a]"}`}
            >
              {tab.id === "newest" ? "🆕" : tab.id === "popular" ? "🔥" : "👥"}
            </div>
            <div className="flex-1">
              <div
                className={`text-[11px] font-semibold flex items-center gap-1 ${activeTab === tab.id ? "text-white" : "text-[#aaa]"}`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="bg-[#e8630a] text-white rounded-full px-1 text-[9px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-[#666] mt-px">{tab.sub}</div>
            </div>
          </button>
        ))}
      </aside>

      {data && (
        <div className="flex-1 px-6 py-5">
          <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl px-4 py-2.5 mb-5 border border-[#333]">
            <img
              src="https://i.pravatar.cc/36?img=47"
              alt="me"
              className="w-9 h-9 rounded-full object-cover"
            />
            <input
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Let's share what going on your mind..."
              className="flex-1 bg-transparent border-none outline-none text-[#ccc] text-[13px]"
            />
            <button
              onClick={() =>
                push(`/discuss/post?content=${encodeURIComponent(postText)}`)
              }
              className="bg-[#e8630a] text-white border-none rounded-lg px-[18px] py-2 font-semibold text-[13px] cursor-pointer whitespace-nowrap"
            >
              Create Post
            </button>
          </div>

          <div className="flex justify-between items-center mb-3.5">
            <span className="text-[13px] text-[#888]">
              {isLoading ? "Loading..." : `${data?.length} Results`}
            </span>
            <div className="flex items-center gap-2 text-[13px] text-[#aaa]">
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#2a2a2a] border border-[#444] text-[#e8630a] rounded-md px-2 py-1 text-[13px] cursor-pointer"
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="text-[#666] text-[13px] text-center mt-10">
              Loading posts...
            </div>
          )}
          {isError && (
            <div className="text-[#e8630a] text-[13px] text-center mt-10">
              Failed to load posts. Please try again.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex flex-col gap-3.5">
              {data?.map((post) => (
                <div
                  onClick={() => push(`/discuss/${post.id}`)}
                  key={post.id}
                  className="bg-[#242424] rounded-2xl border border-[#2e2e2e] p-4 flex gap-4 items-start transition-colors duration-200 hover:border-[#e8630a55]"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-[100px] h-[130px] object-cover rounded-lg shrink-0"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                          <div className="text-[13px] font-semibold text-white">
                            {post.createdByUser?.name ?? "Unknown"}
                          </div>
                          <div className="text-[10px] text-[#666]">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[12px] text-[#888]">
                        <span>
                          {(likeCounts[post.id] ?? 0).toLocaleString()} Likes
                        </span>
                        <span>{post._count?.comments ?? 0} comments</span>
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`bg-transparent border-none cursor-pointer text-lg transition-all duration-200 ${
                            liked[post.id]
                              ? "text-[#e8630a] scale-125"
                              : "text-[#555] scale-100"
                          }`}
                        >
                          ♥
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-[13px] text-[#ccc] leading-relaxed">
                      {post.content ?? ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
