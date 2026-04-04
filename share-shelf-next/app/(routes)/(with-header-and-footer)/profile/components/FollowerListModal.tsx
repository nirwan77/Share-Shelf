"use client";

import { useGetFollowers, useGetFollowing } from "../action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";

interface FollowerListModalProps {
  userId: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
}

export const FollowerListModal = ({
  userId,
  type,
  isOpen,
  onClose,
}: FollowerListModalProps) => {
  const { data: followers, isLoading: followersLoading } = useGetFollowers(userId);
  const { data: following, isLoading: followingLoading } = useGetFollowing(userId);

  const data = type === "followers" ? followers : following;
  const isLoading = type === "followers" ? followersLoading : followingLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="capitalize text-2xl font-bold tracking-tight">{type}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type} yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data?.map((item) => {
                const user = type === "followers" ? item.follower : item.following;
                if (!user) return null;
                return (
                  <Link
                    key={user.id}
                    href={`/user/${user.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-2xl transition-all group"
                  >
                    <figure className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 shrink-0 border-2 border-gray-800 group-hover:border-orange-500/50 transition-colors">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-800">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </figure>
                    <span className="font-bold text-gray-200 group-hover:text-orange-500 transition-colors">{user.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
