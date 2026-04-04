"use client";

import { Button } from "@/components/ui/button";
import { AuthContext, useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell } from "lucide-react";
import { useGetNotifications, useMarkNotificationRead, useGetUnreadCount } from "./notifications-action";
import { useContext, useEffect, useState } from "react";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import Image from "next/image";

export const Navbar = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { setAuthData } = useContext(AuthContext);

  const { data: notifications } = useGetNotifications();
  const { data: unreadCount } = useGetUnreadCount();
  const markRead = useMarkNotificationRead();
  const { data: profile } = useGetProfile();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setAuthData(null);
    router.push("/");
  };

  return (
    <nav className="bg-gray-950 fixed top-0 w-full z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div
            className="shrink-0 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="text-2xl font-bold italic text-white">Logo</div>
          </div>

          <div className="flex items-center space-x-8">
            <a
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="/explore"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Explore
            </a>
            <a
              href="/discuss"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Discuss
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Leaderboard
            </a>
          </div>

          <div className="flex gap-4 items-center justify-center">
            {!mounted ? null : token ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full hover:bg-gray-700"
                    >
                      <Bell className="h-5 w-5 text-white" />
                      {unreadCount && unreadCount.count > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                          {unreadCount.count}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 max-h-96 overflow-y-auto"
                  >
                    <div className="p-2 font-bold border-b text-sm">
                      Notifications
                    </div>
                    {notifications?.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications?.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`cursor-pointer p-3 border-b flex flex-col items-start gap-1 ${
                            !n.isRead ? "bg-blue-50" : ""
                          }`}
                          onClick={() => !n.isRead && markRead.mutate(n.id)}
                        >
                          <p className="text-xs">{n.message}</p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-gray-700 w-8 h-8 flex items-center justify-center bg-gray-800 overflow-hidden p-0"
                    >
                      {profile?.avatar ? (
                        <Image
                          src={profile.avatar}
                          alt={profile.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-400 capitalize">
                          {profile?.name?.charAt(0) || (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/sign-up")}
                  className="bg-gray-500"
                >
                  Join for free
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="hover:bg-gray-800"
                >
                  login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
