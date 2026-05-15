import { axios } from "@/app/lib";
import { useMutation, useQuery } from "@tanstack/react-query";

export type DiscussVote = "UPVOTE" | "DOWNVOTE" | null;

export type DiscussData = {
  posts: Array<{
    _count: { comments: number };
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
    myVote: DiscussVote;
    upvotes: number;
    downvotes: number;
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

export const useVotePost = () => {
  return useMutation({
    mutationFn: async ({
      id,
      reaction,
    }: {
      id: string;
      reaction: Exclude<DiscussVote, null>;
    }) => {
      const { data } = await axios.post(`/discuss/${id}/react`, { reaction });
      return data;
    },
  });
};

export const useReportPost = () => {
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      details,
    }: {
      id: string;
      reason: string;
      details?: string;
    }) => {
      const { data } = await axios.post(`/discuss/${id}/report`, {
        reason,
        details,
      });
      return data;
    },
  });
};
