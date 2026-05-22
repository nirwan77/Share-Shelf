"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useGetLeaderboard,
  type LeaderboardUser as ApiLeaderboardUser,
} from "./action";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

type CategoryKey = "exchanged" | "reviews" | "likes" | "comments";
type TimeKey = "all" | "month" | "year";

type LeaderboardUser = {
  id: string;
  username: string;
  avatar: string;
  badge: string;
  scores: Record<CategoryKey, Record<TimeKey, number>>;
  trend: number;
};

const categories: Array<{
  key: CategoryKey;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
  unit: string;
}> = [
  {
    key: "exchanged",
    label: "Most Books Exchanged",
    shortLabel: "Books",
    icon: BookOpenCheck,
    unit: "books",
  },
  {
    key: "reviews",
    label: "Most Reviews Written",
    shortLabel: "Reviews",
    icon: Star,
    unit: "reviews",
  },
  {
    key: "likes",
    label: "Most Likes Received",
    shortLabel: "Likes",
    icon: Heart,
    unit: "likes",
  },
  {
    key: "comments",
    label: "Most Comments Posted",
    shortLabel: "Comments",
    icon: MessageCircle,
    unit: "comments",
  },
];

const timeRanges: Array<{ key: TimeKey; label: string }> = [
  { key: "all", label: "All Time" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

const seedUsers: LeaderboardUser[] = [
  {
    id: "current-user",
    username: "You",
    avatar: "/avatar.jpeg",
    badge: "Rising Curator",
    trend: 8,
    scores: {
      exchanged: { all: 178, month: 18, year: 74 },
      reviews: { all: 132, month: 16, year: 61 },
      likes: { all: 2410, month: 232, year: 1052 },
      comments: { all: 624, month: 74, year: 286 },
    },
  },
  {
    id: "u1",
    username: "Maya Reads",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    badge: "Exchange Legend",
    trend: 14,
    scores: {
      exchanged: { all: 312, month: 42, year: 156 },
      reviews: { all: 184, month: 21, year: 96 },
      likes: { all: 3862, month: 388, year: 1810 },
      comments: { all: 812, month: 91, year: 438 },
    },
  },
  {
    id: "u2",
    username: "Aarav Pages",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    badge: "Review Pro",
    trend: 11,
    scores: {
      exchanged: { all: 286, month: 35, year: 142 },
      reviews: { all: 231, month: 29, year: 128 },
      likes: { all: 3584, month: 314, year: 1588 },
      comments: { all: 728, month: 84, year: 391 },
    },
  },
  {
    id: "u3",
    username: "Luna Library",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    badge: "Community Voice",
    trend: 9,
    scores: {
      exchanged: { all: 241, month: 31, year: 119 },
      reviews: { all: 176, month: 23, year: 88 },
      likes: { all: 4216, month: 441, year: 1976 },
      comments: { all: 934, month: 103, year: 472 },
    },
  },
  {
    id: "u4",
    username: "Sam Shelf",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    badge: "Trusted Trader",
    trend: 6,
    scores: {
      exchanged: { all: 224, month: 22, year: 111 },
      reviews: { all: 119, month: 12, year: 52 },
      likes: { all: 2190, month: 201, year: 934 },
      comments: { all: 502, month: 55, year: 238 },
    },
  },
  {
    id: "u5",
    username: "Nisha Notes",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    badge: "Thoughtful Reviewer",
    trend: 12,
    scores: {
      exchanged: { all: 198, month: 19, year: 93 },
      reviews: { all: 213, month: 26, year: 116 },
      likes: { all: 2924, month: 275, year: 1270 },
      comments: { all: 618, month: 62, year: 301 },
    },
  },
  {
    id: "u6",
    username: "Kiran Chapters",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    badge: "Helpful Member",
    trend: 5,
    scores: {
      exchanged: { all: 186, month: 16, year: 82 },
      reviews: { all: 98, month: 9, year: 41 },
      likes: { all: 1874, month: 168, year: 802 },
      comments: { all: 576, month: 58, year: 255 },
    },
  },
  {
    id: "u7",
    username: "Isha Ink",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    badge: "Like Magnet",
    trend: 10,
    scores: {
      exchanged: { all: 162, month: 14, year: 70 },
      reviews: { all: 144, month: 15, year: 68 },
      likes: { all: 3348, month: 361, year: 1442 },
      comments: { all: 486, month: 47, year: 218 },
    },
  },
  {
    id: "u8",
    username: "Dev Bookclub",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
    badge: "Club Captain",
    trend: 4,
    scores: {
      exchanged: { all: 151, month: 12, year: 61 },
      reviews: { all: 87, month: 7, year: 35 },
      likes: { all: 1422, month: 122, year: 586 },
      comments: { all: 431, month: 39, year: 184 },
    },
  },
  {
    id: "u9",
    username: "Priya Prose",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=160&q=80",
    badge: "Conversation Starter",
    trend: 7,
    scores: {
      exchanged: { all: 140, month: 13, year: 58 },
      reviews: { all: 126, month: 13, year: 55 },
      likes: { all: 1650, month: 148, year: 704 },
      comments: { all: 662, month: 76, year: 312 },
    },
  },
  {
    id: "u10",
    username: "Rohan Reads",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
    badge: "Steady Sharer",
    trend: 3,
    scores: {
      exchanged: { all: 121, month: 9, year: 47 },
      reviews: { all: 76, month: 6, year: 31 },
      likes: { all: 1218, month: 103, year: 492 },
      comments: { all: 314, month: 28, year: 136 },
    },
  },
  {
    id: "u11",
    username: "Anika Annotates",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80",
    badge: "Sharp Critic",
    trend: 6,
    scores: {
      exchanged: { all: 106, month: 8, year: 43 },
      reviews: { all: 158, month: 18, year: 74 },
      likes: { all: 2016, month: 197, year: 842 },
      comments: { all: 356, month: 32, year: 151 },
    },
  },
];

const pageSize = 6;

function mapApiUserToLocal(
  user: ApiLeaderboardUser,
  category: CategoryKey,
  timeRange: TimeKey,
): LeaderboardUser {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar || "/avatar.jpeg",
    badge: user.badge,
    trend: user.trend,
    scores: {
      exchanged: { all: 0, month: 0, year: 0 },
      reviews: { all: 0, month: 0, year: 0 },
      likes: { all: 0, month: 0, year: 0 },
      comments: { all: 0, month: 0, year: 0 },
      [category]: {
        all: 0,
        month: 0,
        year: 0,
        [timeRange]: user.score,
      },
    },
  };
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState<CategoryKey>("exchanged");
  const [timeRange, setTimeRange] = useState<TimeKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const leaderboardQuery = useGetLeaderboard({
    category,
    timeRange,
    page: 1,
    limit: 50,
  });

  const currentUserId = leaderboardQuery.data?.currentUserId ?? "current-user";

  const users = useMemo(() => {
    if (!leaderboardQuery.data) return seedUsers;

    const apiUsers = [...leaderboardQuery.data.data];
    const currentUser = leaderboardQuery.data.currentUser;

    if (currentUser && !apiUsers.some((user) => user.id === currentUser.id)) {
      apiUsers.push(currentUser);
    }

    return apiUsers.map((user) => mapApiUserToLocal(user, category, timeRange));
  }, [category, leaderboardQuery.data, timeRange]);

  const isLoading = leaderboardQuery.isLoading && !leaderboardQuery.data;
  const error = leaderboardQuery.isError
    ? "Leaderboard data could not be loaded."
    : null;

  const selectedCategory = categories.find((item) => item.key === category)!;
  const SelectedIcon = selectedCategory.icon;

  const rankedUsers = useMemo(() => {
    return users
      .map((user) => ({
        ...user,
        score: user.scores[category][timeRange],
      }))
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [category, timeRange, users]);

  const currentUser = rankedUsers.find((user) => user.id === currentUserId);

  const filteredUsers = rankedUsers.filter((user) =>
    user.username.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const podiumUsers = rankedUsers.slice(0, 3);

  return (
    <div className="min-h-screen bg-black pt-28 pb-16 text-white">
      <div className="container mx-auto px-4">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="app-card p-5 md:p-7">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a00]/25 bg-[#ff7a00]/10 px-3 py-1 text-sm font-medium text-[#ffb36d]">
                  <Sparkles className="h-4 w-4" />
                  Live community standings
                </div>
                <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Leaderboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                  See who is exchanging, reviewing, and keeping the Share Shelf
                  community active.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Real-time updates
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {categories.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === category;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setCategory(item.key);
                      setPage(1);
                    }}
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff7a00]/40 hover:bg-white/[0.06]",
                      isActive &&
                        "border-[#ff7a00]/70 bg-[#ff7a00] text-black shadow-[0_16px_40px_rgba(255,122,0,0.2)] hover:translate-y-0 hover:border-[#ff7a00]/70 hover:bg-[#ff7a00] hover:text-black",
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-zinc-300",
                          isActive && "bg-black/15 text-black",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "h-4 w-4 text-zinc-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                          isActive && "text-black/70",
                        )}
                      />
                    </div>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={cn(
                        "mt-1 block text-xs text-zinc-500",
                        isActive && "text-black/65",
                      )}
                    >
                      Ranked by {item.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="app-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7a00]/10 text-[#ff7a00]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Your standing
                </p>
                <p className="text-xs text-zinc-500">Highlighted in every list</p>
              </div>
            </div>

            {currentUser ? (
              <div className="rounded-2xl border border-[#ff7a00]/25 bg-[#ff7a00]/10 p-4">
                <div className="flex items-center gap-3">
                  <Avatar user={currentUser} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{currentUser.username}</p>
                    <p className="text-sm text-zinc-400">Rank #{currentUser.rank}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500">Score</p>
                    <p className="text-xl font-semibold">
                      {currentUser.score.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Badge</p>
                    <p className="font-semibold">{currentUser.badge}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                Sign in to see your standing.
              </p>
            )}
          </aside>
        </section>

        <section className="app-card mb-8 p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTimeRange(item.key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-[#ff7a00]/40 hover:bg-white/[0.06] hover:text-white",
                    timeRange === item.key &&
                      "border-[#ff7a00] bg-[#ff7a00] text-black hover:bg-[#ff922f]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search users by username"
                className="h-11 pl-10 text-sm"
              />
            </div>
          </div>
        </section>

        {error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              leaderboardQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <>
            <section className="mb-8 grid items-end gap-4 md:grid-cols-3">
              {podiumUsers.map((user, index) => (
                <PodiumUser key={user.id} user={user} position={index} />
              ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-sm">
              <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ff7a00]">
                    <SelectedIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-white">
                      {selectedCategory.label}
                    </h2>
                    <p className="text-sm text-zinc-500">
                      {filteredUsers.length} users in this view
                    </p>
                  </div>
                </div>
              </div>

              {visibleUsers.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {visibleUsers.map((user) => (
                    <LeaderboardRow
                      key={user.id}
                      user={user}
                      unit={selectedCategory.unit}
                      isCurrentUser={user.id === currentUserId}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState search={search} />
              )}
            </section>

            {visibleUsers.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page === 1}
                    className="border-stone-200 bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    disabled={page === totalPages}
                    className="border-stone-200 bg-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PodiumUser({
  user,
  position,
}: {
  user: LeaderboardUser & { rank: number; score: number };
  position: number;
}) {
  const podiumStyles = [
    "md:order-2 border-[#ff7a00]/45 bg-[#ff7a00]/12 pt-8 md:min-h-[250px]",
    "md:order-1 border-white/10 bg-[#111114] pt-5 md:min-h-[220px]",
    "md:order-3 border-orange-500/25 bg-orange-500/10 pt-5 md:min-h-[205px]",
  ];

  return (
    <article
      className={cn(
        "relative rounded-2xl border p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff7a00]/50",
        podiumStyles[position],
      )}
    >
      <div className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-sm">
        #{user.rank}
      </div>
      {position === 0 && (
        <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ff7a00] text-black">
          <Crown className="h-6 w-6" />
        </div>
      )}
      <div className="mx-auto w-fit">
        <Avatar user={user} size={position === 0 ? "xl" : "lg"} />
      </div>
      <h3 className="mt-4 truncate text-lg font-semibold">{user.username}</h3>
      <p className="mt-1 text-sm text-zinc-500">{user.badge}</p>
      <p className="mt-4 text-3xl font-semibold">{user.score.toLocaleString()}</p>
      <Link
        href={`/user/${user.id}`}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#ff7a00]/50 hover:text-[#ffb36d]"
      >
        Visit profile
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function LeaderboardRow({
  user,
  unit,
  isCurrentUser,
}: {
  user: LeaderboardUser & { rank: number; score: number };
  unit: string;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4 transition-colors duration-300 hover:bg-white/[0.04] md:grid-cols-[72px_1fr_150px_150px_150px]",
        isCurrentUser && "bg-[#ff7a00]/10 hover:bg-[#ff7a00]/10",
      )}
    >
      <div className="flex items-center">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-semibold text-zinc-300",
            user.rank <= 3 && "border-[#ff7a00]/40 bg-[#ff7a00]/15 text-[#ffb36d]",
          )}
        >
          {user.rank}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Avatar user={user} size="md" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-white">{user.username}</p>
            {isCurrentUser && (
              <span className="rounded-full bg-[#ff7a00] px-2 py-0.5 text-xs font-semibold text-black">
                You
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{user.badge}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <ArrowUpRight className="h-4 w-4" />
        +{user.trend}% this period
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="text-left md:text-right">
          <p className="text-lg font-semibold text-white">
            {user.score.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{unit}</p>
        </div>
        <Award className="h-5 w-5 text-zinc-500" />
      </div>

      <div className="flex items-center md:justify-end">
        <Link
          href={`/user/${user.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-[#ff7a00]/50 hover:text-[#ffb36d]"
        >
          Visit profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Avatar({
  user,
  size,
}: {
  user: Pick<LeaderboardUser, "username" | "avatar">;
  size: "md" | "lg" | "xl";
}) {
  const dimensions = {
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  const imageSize = size === "xl" ? 80 : size === "lg" ? 64 : 48;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border-2 border-white/15 bg-zinc-800 shadow-sm",
        dimensions[size],
      )}
    >
      <Image
        src={user.avatar}
        alt={user.username}
        width={imageSize}
        height={imageSize}
        className="h-full w-full object-cover"
        unoptimized
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-white/10" />
            <div className="mx-auto mt-5 h-4 w-32 rounded bg-white/10" />
            <div className="mx-auto mt-3 h-3 w-24 rounded bg-white/5" />
            <div className="mx-auto mt-6 h-8 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-sm">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-4 w-36 rounded bg-white/10" />
              <div className="mt-2 h-3 w-24 rounded bg-white/5" />
            </div>
            <div className="h-6 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-zinc-500">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">No users found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        No leaderboard users match &quot;{search}&quot;. Try a different
        username.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-14 text-center text-red-900">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <Button onClick={onRetry} className="mt-5 bg-red-700 text-white hover:bg-red-800">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
