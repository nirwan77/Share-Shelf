import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axios } from "@/lib";

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
  isVerified: boolean;
  isBanned: boolean;
  _count: {
    userBookStatuses: number;
    posts: number;
    payments: number;
    banAppeals: number;
  };
}

export interface UserStatsResponse {
  data: UserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDetails {
  user: UserListItem & {
    _count: {
      userBookStatuses: number;
      userBookReviews: number;
      posts: number;
      postComments: number;
      payments: number;
      banAppeals: number;
    };
  };
  stats: {
    bookStatuses: {
      status: string;
      _count: { status: number };
    }[];
    payments: {
      totalAmount: number;
      successCount: number;
    };
    recentPayments: any[];
    recentBanAppeals: Array<{
      id: string;
      message: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

export const useGetUsers = (page: number, limit: number, search?: string) => {
  return useQuery<UserStatsResponse>({
    queryKey: ['users', page, limit, search],
    queryFn: async () => {
      const response = await axios.get('/dashboard-user-stats', {
        params: { page, limit, search },
      });
      return response.data;
    },
  });
};

export const useGetUserDetails = (id: string | null) => {
  return useQuery<UserDetails>({
    queryKey: ['user-details', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/dashboard-user-stats/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.patch(`/dashboard-user-stats/${id}/unban`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
    },
  });
};
