import { axios } from "@/app/lib";
import { useAuth } from "@/contexts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ChatUser = {
  id: string;
  name: string;
  avatar: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ChatUser;
  text: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  participant: ChatUser;
  lastMessage: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
};

export const useGetChatConversations = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const { data } = await axios.get<ChatConversation[]>(
        "/chat/conversations",
      );
      return data;
    },
    enabled: !!token,
  });
};

export const useGetChatMessages = (conversationId?: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      const { data } = await axios.get<ChatMessage[]>(
        `/chat/conversations/${conversationId}/messages`,
      );
      return data;
    },
    enabled: !!token && !!conversationId,
  });
};

export const useCreateChatConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await axios.post<ChatConversation>(
        "/chat/conversations",
        { participantId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
    }: {
      conversationId: string;
      text: string;
    }) => {
      const { data } = await axios.post<ChatMessage>(
        `/chat/conversations/${conversationId}/messages`,
        { text },
      );
      return data;
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.setQueryData<ChatMessage[]>(
        ["chat-messages", message.conversationId],
        (current = []) => {
          if (current.some((item) => item.id === message.id)) return current;
          return [...current, message];
        },
      );
    },
  });
};
