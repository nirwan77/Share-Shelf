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
import { LogOut, User } from "lucide-react";
import { useContext } from "react";

export const Navbar = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { setAuthData } = useContext(AuthContext);

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

          <div className="flex gap-6 justify-center">
            {token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-700"
                  >
                    <User className="h-5 w-5 text-white" />
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
