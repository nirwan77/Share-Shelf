import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib";

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type ReportTargetType = "POST" | "COMMENT";

export interface ReportUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isBanned?: boolean;
}

export interface ReportItem {
  id: string;
  targetType: ReportTargetType;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: ReportUser;
  reportedUser: ReportUser;
  post: {
    id: string;
    title: string;
    content: string | null;
    image: string | null;
    createdAt: string;
  } | null;
  comment: {
    id: string;
    comment: string;
    postId: string;
    createdAt: string;
  } | null;
}

export interface ReportsResponse {
  data: ReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeletedCommentItem {
  id: string;
  commentId: string;
  comment: string;
  postId: string;
  postTitle: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  deletedByDashboardUserId: string | null;
  deletedAt: string;
}

export interface DeletedCommentsResponse {
  data: DeletedCommentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useGetReports = (status: string, page: number, limit = 20) => {
  return useQuery<ReportsResponse>({
    queryKey: ["dashboard-reports", status, page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/dashboard-reports", {
        params: { status, page, limit },
      });
      return data;
    },
  });
};

export const useGetDeletedComments = (page: number, limit = 10) => {
  return useQuery<DeletedCommentsResponse>({
    queryKey: ["dashboard-deleted-comments", page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/dashboard-reports/deleted-comments", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useReportModerationActions = () => {
  const queryClient = useQueryClient();
  const invalidateReports = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-deleted-comments"] });
  };

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await axios.delete(`/dashboard-reports/post/${postId}`);
      return data;
    },
    onSuccess: invalidateReports,
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await axios.delete(`/dashboard-reports/comment/${commentId}`);
      return data;
    },
    onSuccess: invalidateReports,
  });

  const banUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axios.patch(`/dashboard-reports/user/${userId}/ban`);
      return data;
    },
    onSuccess: invalidateReports,
  });

  const resolveReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { data } = await axios.patch(`/dashboard-reports/${reportId}/resolve`);
      return data;
    },
    onSuccess: invalidateReports,
  });

  const dismissReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { data } = await axios.patch(`/dashboard-reports/${reportId}/dismiss`);
      return data;
    },
    onSuccess: invalidateReports,
  });

  return {
    deletePost,
    deleteComment,
    banUser,
    resolveReport,
    dismissReport,
  };
};
