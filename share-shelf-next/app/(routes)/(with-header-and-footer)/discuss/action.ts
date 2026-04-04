import { axios } from "@/app/lib";
import { useMutation, useQuery } from "@tanstack/react-query";

export type DiscussData = {
  posts: Array<{
    _count: { comments: number; reactions: number };
    content: string | null;
    image: string | null;
    createdByUser: {
      avatar: string | null;
      id: string;
      name: string;
    };
    title: string;
    createdAt: string;
    id: string;
    isLikedByMe: boolean;
    viewsCount: number;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export interface FeedParams {
  filter?: string;
  timeRange?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const useDeletePost = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axios.delete(`/discuss/${postId}`);
      return data;
    },
  });
};

export const useGetPostData = (params?: FeedParams) => {
  return useQuery({
    queryKey: ["post", params],
    queryFn: async () => {
      const { data } = await axios.get<DiscussData>("/discuss", { params });
      return data;
    },
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post<DiscussData>(`/discuss/${id}/like`);
      return data;
    },
  });
};
