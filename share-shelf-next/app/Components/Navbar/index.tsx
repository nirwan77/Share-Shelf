"use client";

import { Button } from "@/components/ui/button";
import { AuthContext, useAuth } from "@/contexts";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  KeyRound,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User,
  X,
} from "lucide-react";
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useGetUnreadCount,
} from "./notifications-action";
import { useContext, useEffect, useState } from "react";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();
  const { setAuthData } = useContext(AuthContext);

  const { data: notifications } = useGetNotifications();
  const { data: unreadCount } = useGetUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data: profile } = useGetProfile();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleLogout = () => {
    setAuthData(null);
    router.push("/");
  };

  const handleSearch = (value: string) => {
    const searchValue = value.trim();
    if (!searchValue) return;
    router.push(`/user?search=${encodeURIComponent(searchValue)}`);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/discuss", label: "Discuss" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between gap-3">
          <div
            className="shrink-0 cursor-pointer"
            onClick={() => {
              router.push("/");
              setMobileMenuOpen(false);
            }}
          >
            <Image
              src="/logo.png"
              alt="Share Shelf"
              width={160}
              height={40}
              unoptimized
              className="h-8 w-auto object-contain bg-transparent sm:h-9"
            />
          </div>

          <div className="hidden flex-1 items-center px-4 lg:flex xl:px-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search users..."
                className="h-10 w-full rounded-full border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-[#ff7a00]/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#ff7a00]/15"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e.currentTarget.value);
                  }
                }}
              />
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-[#ff7a00]" />
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] lg:flex">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-4 ${
                    isActive
                      ? "bg-[#ff7a00] text-black shadow-[0_10px_28px_rgba(255,122,0,0.26)]"
                      : "text-zinc-300 hover:bg-white/8 hover:text-[#ffb36d]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1.5 sm:gap-2">
            {!mounted ? null : token ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden rounded-full hover:bg-white/10 sm:inline-flex"
                  onClick={() => router.push("/chat")}
                >
                  <MessageSquare className="h-5 w-5 text-white" />
                </Button>

                <DropdownMenu
                  onOpenChange={(open) => {
                    if (open && unreadCount && unreadCount.count > 0) {
                      markAllRead.mutate();
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full hover:bg-white/10"
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
                    className="max-h-96 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto"
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
                          className={`cursor-pointer p-3 border-b border-white/10 flex flex-col items-start gap-1 ${!n.isRead ? "bg-[#ff7a00]/10" : ""
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
                      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 p-0 hover:bg-white/15"
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
                      onClick={() => router.push("/change-password")}
                      className="cursor-pointer"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change password</span>
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
                  className="hidden bg-[#ff7a00] text-black md:inline-flex"
                >
                  Join for free
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  className="h-9 px-3 sm:h-10 sm:px-5"
                >
                  Log in
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>

        <div
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 lg:hidden ${
            mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="border-t border-white/10 py-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-[#ff7a00]/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#ff7a00]/15"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e.currentTarget.value);
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-[#ff7a00]/60 bg-[#ff7a00] text-black"
                          : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-[#ff7a00]/45 hover:bg-[#ff7a00]/10 hover:text-[#ffb36d]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {mounted && token && (
                <Button
                  variant="outline"
                  className="mt-3 w-full justify-center"
                  onClick={() => {
                    router.push("/chat");
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Open chat
                </Button>
              )}

              {mounted && !token && (
                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    router.push("/sign-up");
                    setMobileMenuOpen(false);
                  }}
                >
                  Join for free
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
