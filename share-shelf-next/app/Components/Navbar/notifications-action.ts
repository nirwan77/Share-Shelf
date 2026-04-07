import { axios } from "@/app/lib";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export const useGetNotifications = () => {
  const { token } = useAuth();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/notifications");
      return data;
    },
    enabled: !!token,
  });
};

export const useGetUnreadCount = () => {
  const { token } = useAuth();
  return useQuery<{ count: number }>({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const { data } = await axios.get("/notifications/unread-count");
      return data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!token,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
};
