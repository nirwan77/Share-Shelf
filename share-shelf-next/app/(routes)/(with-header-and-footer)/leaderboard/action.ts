import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export type LeaderboardCategory = "exchanged" | "reviews" | "likes" | "comments";
export type LeaderboardTimeRange = "all" | "month" | "year";

export type LeaderboardUser = {
  id: string;
  username: string;
  avatar: string | null;
  score: number;
  rank: number;
  badge: string;
  trend: number;
  isCurrentUser: boolean;
};

export type LeaderboardResponse = {
  data: LeaderboardUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  category: LeaderboardCategory;
  timeRange: LeaderboardTimeRange;
  currentUser: LeaderboardUser | null;
  currentUserId: string | null;
  generatedAt: string;
};

export const useGetLeaderboard = ({
  category,
  timeRange,
  search,
  page,
  limit,
}: {
  category: LeaderboardCategory;
  timeRange: LeaderboardTimeRange;
  search?: string;
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["leaderboard", category, timeRange, search, page, limit],
    queryFn: async () => {
      const { data } = await axios.get<LeaderboardResponse>("/leaderboard", {
        params: { category, timeRange, search, page, limit },
      });
      return data;
    },
    refetchInterval: 5000,
  });
};
