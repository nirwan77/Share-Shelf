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

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axios.patch("/notifications/read-all");
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notifications"] }),
        queryClient.cancelQueries({ queryKey: ["notifications-unread-count"] }),
      ]);

      const previousNotifications =
        queryClient.getQueryData<Notification[]>(["notifications"]);
      const previousUnreadCount =
        queryClient.getQueryData<{ count: number }>([
          "notifications-unread-count",
        ]);

      queryClient.setQueryData<Notification[]>(["notifications"], (current) =>
        current?.map((notification) => ({ ...notification, isRead: true })),
      );
      queryClient.setQueryData(["notifications-unread-count"], { count: 0 });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        );
      }

      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ["notifications-unread-count"],
          context.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
};
