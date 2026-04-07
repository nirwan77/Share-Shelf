"use client";

import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Info, User } from "lucide-react";
import { useAuth } from "@/contexts";
// import { useGetProfile } from "../../profile/action";
import Image from "next/image";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    status: "online" | "offline";
  };
  lastMessage: string;
  unreadCount?: number;
  updatedAt: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    user: { id: "u1", name: "Alice Johnson", avatar: null, status: "online" },
    lastMessage: "I really enjoyed that book you recommended!",
    // unreadCount: 2,
    updatedAt: "10:30 AM",
  },
  {
    id: "2",
    user: { id: "u2", name: "Bob Smith", avatar: null, status: "offline" },
    lastMessage: "Is the book still available for exchange?",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    user: { id: "u3", name: "Charlie Davis", avatar: null, status: "online" },
    lastMessage: "Let's meet at the library tomorrow.",
    updatedAt: "2 days ago",
  },
];

const mockMessages: Message[] = [
  { id: "m1", senderId: "u1", text: "Hey! How are you doing?", timestamp: "10:00 AM" },
  { id: "m2", senderId: "me", text: "I'm great, thanks! How about you?", timestamp: "10:01 AM" },
  { id: "m3", senderId: "u1", text: "I really enjoyed that book you recommended! The plot twist at the end was insane.", timestamp: "10:05 AM" },
  { id: "m4", senderId: "me", text: "I know, right? I didn't see it coming either.", timestamp: "10:07 AM" },
];

export default function ChatPage() {
  // const { data: profile } = useGetProfile();
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="pt-16 h-screen flex overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-800 flex flex-col bg-gray-950 shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-900 text-sm text-white rounded-xl py-2 pl-10 pr-4 outline-none border border-transparent focus:border-orange-500/50 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockConversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors relative border-l-4 ${selectedChat?.id === chat.id
                ? "bg-gray-900 border-orange-500"
                : "hover:bg-gray-900/50 border-transparent"
                }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                  {chat.user.avatar ? (
                    <Image src={chat.user.avatar} alt={chat.user.name} fill className="object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-gray-500 uppercase">{chat.user.name.charAt(0)}</span>
                  )}
                </div>
                {chat.user.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="font-bold text-sm text-white truncate">{chat.user.name}</span>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{chat.updatedAt}</span>
                </div>
                <p className={`text-xs truncate ${chat.unreadCount ? "text-gray-200 font-semibold" : "text-gray-500"}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount && chat.unreadCount > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 right-4 h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-gray-950">
        {selectedChat ? (
          <>
            {/* Header */}
            <header className="h-16 px-6 border-b border-gray-800 flex items-center justify-between bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                    {selectedChat.user.avatar ? (
                      <Image src={selectedChat.user.avatar} alt={selectedChat.user.name} fill className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-500 uppercase">{selectedChat.user.name.charAt(0)}</span>
                    )}
                  </div>
                  {selectedChat.user.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-950"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">{selectedChat.user.name}</h2>
                  <p className="text-[10px] text-green-500 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"><Phone size={20} /></button>
                <button className="hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"><Video size={20} /></button>
                <button className="hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"><Info size={20} /></button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/chat-pattern.png')] bg-repeat bg-fixed opacity-95">
              {mockMessages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] group ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed ${isMe
                        ? "bg-orange-600 text-white rounded-tr-none shadow-lg shadow-orange-950/20"
                        : "bg-gray-900 text-gray-200 rounded-tl-none border border-gray-800"
                        }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-600 mt-1.5 font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-950">
              <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                <button className="p-2.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-all">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-900 border border-gray-800 text-sm text-white rounded-[24px] py-3 px-5 pr-12 outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600"
                  />
                  <button className={`absolute right-2 top-1.5 p-2 rounded-full transition-all ${messageInput.trim() ? "bg-orange-600 text-white hover:bg-orange-500" : "text-gray-600 cursor-not-allowed"
                    }`}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
              <User className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Choose a chat from the sidebar to start exchanging books and sharing stories.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
