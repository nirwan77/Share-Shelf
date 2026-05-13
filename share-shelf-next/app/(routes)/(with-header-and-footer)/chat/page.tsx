"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Search,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useGetProfile, useSearchUsers } from "../profile/action";
import {
  ChatConversation,
  ChatMessage,
  useCreateChatConversation,
  useGetChatConversations,
  useGetChatMessages,
  useSendChatMessage,
} from "./action";

const getChatSocketUrl = (token: string) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SHARE_SHELF_WS_URL;
  const apiUrl =
    configuredUrl ||
    process.env.NEXT_PUBLIC_SHARE_SHELF_URL ||
    "http://localhost:3000";
  const normalizedUrl = /^(https?|wss?):\/\//.test(apiUrl)
    ? apiUrl
    : `http://${apiUrl}`;
  const url = new URL(normalizedUrl);

  url.protocol =
    url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";

  if (!configuredUrl || url.pathname === "/") {
    url.pathname = "/chat/socket";
  }

  url.searchParams.set("token", token);
  return url.toString();
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const formatConversationTime = (date: string) => {
  const value = new Date(date);
  const now = new Date();
  const isToday = value.toDateString() === now.toDateString();

  if (isToday) return formatTime(date);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(value);
};

const Avatar = ({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar: string | null;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  }[size];

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06]`}
    >
      {avatar ? (
        <Image src={avatar} alt={name} fill className="object-cover" />
      ) : (
        <span className="text-base font-bold uppercase text-zinc-500">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
};

function ChatPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { data: profile } = useGetProfile();
  const { data: conversations = [], isLoading } = useGetChatConversations();
  const createConversation = useCreateChatConversation();
  const sendMessage = useSendChatMessage();
  const targetUserId = searchParams.get("user");

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const startedFromParam = useRef<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const { data: messages = [], isLoading: messagesLoading } =
    useGetChatMessages(selectedConversationId ?? undefined);
  const { data: searchedUsers = [], isLoading: searchLoading } =
    useSearchUsers(searchQuery.trim());

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!token?.accessToken) return;

    const socket = new WebSocket(getChatSocketUrl(token.accessToken));
    socketRef.current = socket;

    socket.onopen = () => setSocketReady(true);
    socket.onclose = () => setSocketReady(false);
    socket.onerror = () => setSocketReady(false);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type !== "message_created") return;

      const message = payload.message as ChatMessage;

      queryClient.setQueryData<ChatMessage[]>(
        ["chat-messages", message.conversationId],
        (current = []) => {
          if (current.some((item) => item.id === message.id)) return current;
          return [...current, message];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [queryClient, token?.accessToken]);

  useEffect(() => {
    if (!selectedConversationId || !socketReady) return;

    socketRef.current?.send(
      JSON.stringify({
        type: "join_conversation",
        conversationId: selectedConversationId,
      }),
    );
  }, [selectedConversationId, socketReady]);

  useEffect(() => {
    if (
      !targetUserId ||
      !token?.accessToken ||
      startedFromParam.current === targetUserId
    ) {
      return;
    }

    startedFromParam.current = targetUserId;
    createConversation.mutate(targetUserId, {
      onSuccess: (conversation) => {
        setSelectedConversationId(conversation.id);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Unable to start chat");
      },
    });
  }, [createConversation, targetUserId, token?.accessToken]);

  const startConversation = (participantId: string) => {
    createConversation.mutate(participantId, {
      onSuccess: (conversation) => {
        setSearchQuery("");
        setSelectedConversationId(conversation.id);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Unable to start chat");
      },
    });
  };

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!selectedConversationId || !text) return;

    setMessageInput("");

    if (socketReady && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "send_message",
          conversationId: selectedConversationId,
          text,
        }),
      );
      return;
    }

    sendMessage.mutate(
      { conversationId: selectedConversationId, text },
      {
        onError: (error: any) => {
          setMessageInput(text);
          toast.error(error?.response?.data?.message || "Unable to send");
        },
      },
    );
  };

  const usersForSearch = searchedUsers.filter((user) => user.id !== profile?.id);

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="container mx-auto h-[calc(100dvh-4rem)] py-4 sm:py-6">
        <div className="flex h-full overflow-hidden rounded-2xl border border-white/10 bg-[#08080a] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <aside
            className={`w-full shrink-0 flex-col border-white/10 bg-[#0d0d10] lg:flex lg:w-[350px] lg:border-r ${
              selectedConversation ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="tag">Inbox</p>
                  <h1 className="mt-1 text-2xl font-bold text-white">
                    Messages
                  </h1>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff7a00]/25 bg-[#ff7a00]/10 text-[#ff7a00]">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search users to start chat..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-[#ff7a00]/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#ff7a00]/15"
                />
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-[#ff7a00]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {searchQuery.trim() ? (
                <SearchResults
                  isLoading={searchLoading}
                  users={usersForSearch}
                  onStartConversation={startConversation}
                  isCreating={createConversation.isPending}
                />
              ) : (
                <ConversationList
                  conversations={conversations}
                  isLoading={isLoading}
                  selectedConversationId={selectedConversationId}
                  onSelect={setSelectedConversationId}
                />
              )}
            </div>
          </aside>

          <main
            className={`min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.08),transparent_22rem)] ${
              selectedConversation ? "flex" : "hidden lg:flex"
            }`}
          >
            {selectedConversation ? (
              <>
                <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/25 px-3 backdrop-blur-md sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
                      onClick={() => setSelectedConversationId(null)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Avatar
                      name={selectedConversation.participant.name}
                      avatar={selectedConversation.participant.avatar}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-white">
                        {selectedConversation.participant.name}
                      </h2>
                      <p
                        className={`text-[11px] font-medium ${
                          socketReady ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {socketReady ? "Realtime connected" : "Connecting..."}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading messages
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4 sm:space-y-5">
                      {messages.map((message) => {
                        const isMe = message.senderId === profile?.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`group flex max-w-[88%] flex-col sm:max-w-[72%] ${
                                isMe ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                                  isMe
                                    ? "rounded-br-md bg-[#ff7a00] text-black shadow-orange-950/25"
                                    : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-200"
                                }`}
                              >
                                {message.text}
                              </div>
                              <span className="mt-1.5 px-2 text-[10px] font-medium text-zinc-600">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                        <MessageSquare className="h-8 w-8 text-zinc-600" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        No messages yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Send the first message to start the conversation.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 bg-[#0d0d10]/95 p-3 sm:p-4">
                  <div className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(event) =>
                          setMessageInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSendMessage();
                        }}
                        placeholder="Type a message..."
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3 pl-4 pr-13 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#ff7a00]/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#ff7a00]/15"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessage.isPending}
                        className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-all ${
                          messageInput.trim()
                            ? "bg-[#ff7a00] text-black hover:bg-[#ff922f]"
                            : "cursor-not-allowed text-zinc-600"
                        }`}
                        aria-label="Send message"
                      >
                        <Send size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <User className="h-10 w-10 text-zinc-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Select a conversation
                </h2>
                <p className="mx-auto max-w-xs text-sm leading-6 text-zinc-500">
                  Choose a chat or search for a reader to start messaging.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ChatPageContent />
    </Suspense>
  );
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
}: {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading inbox
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-white">No conversations</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Search for a reader above to start a chat.
        </p>
      </div>
    );
  }

  return conversations.map((chat) => {
    const isSelected = selectedConversationId === chat.id;

    return (
      <button
        key={chat.id}
        type="button"
        onClick={() => onSelect(chat.id)}
        className={`relative flex w-full gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
          isSelected
            ? "border border-[#ff7a00]/40 bg-[#ff7a00]/10"
            : "border border-transparent hover:bg-white/[0.04]"
        }`}
      >
        <Avatar
          name={chat.participant.name}
          avatar={chat.participant.avatar}
          size="md"
        />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1 flex items-start justify-between gap-3">
            <span className="truncate text-sm font-bold text-white">
              {chat.participant.name}
            </span>
            <span className="shrink-0 text-[10px] font-medium text-zinc-500">
              {formatConversationTime(chat.updatedAt)}
            </span>
          </div>
          <p className="truncate text-xs text-zinc-500">
            {chat.lastMessage?.text ?? "No messages yet"}
          </p>
        </div>
      </button>
    );
  });
};

const SearchResults = ({
  users,
  isLoading,
  isCreating,
  onStartConversation,
}: {
  users: Array<{ id: string; name: string; avatar: string | null }>;
  isLoading: boolean;
  isCreating: boolean;
  onStartConversation: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Searching
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-white">No users found</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Try a different name.
        </p>
      </div>
    );
  }

  return users.map((user) => (
    <button
      key={user.id}
      type="button"
      onClick={() => onStartConversation(user.id)}
      disabled={isCreating}
      className="flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition-all hover:bg-white/[0.04] disabled:opacity-60"
    >
      <Avatar name={user.name} avatar={user.avatar} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{user.name}</p>
        <p className="text-xs text-zinc-500">Start conversation</p>
      </div>
    </button>
  ));
};
