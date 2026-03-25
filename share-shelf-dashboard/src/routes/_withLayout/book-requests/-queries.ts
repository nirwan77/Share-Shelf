import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/lib/axios";

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  description: string | null;
  image: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface BookRequestsResponse {
  data: BookRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useGetBookRequests = (filters: { page?: number; limit?: number; status?: string } = {}) => {
  const { page = 1, limit = 10, status } = filters;
  return useQuery<BookRequestsResponse>({
    queryKey: ["dashboard-book-requests", page, limit, status],
    queryFn: async () => {
      const { data } = await instance.get("/dashboard-book-requests", {
        params: { page, limit, status },
      });
      return data;
    },
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.patch(`/dashboard-book-requests/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-book-requests"] });
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.patch(`/dashboard-book-requests/${id}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-book-requests"] });
    },
  });
};
