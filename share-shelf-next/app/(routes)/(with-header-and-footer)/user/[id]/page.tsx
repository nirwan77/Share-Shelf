"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUserProfile, useFollowUser, useUnfollowUser } from "../../profile/action";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, FollowerListModal } from "../../profile/components";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";

export default function UserProfile() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const router = useRouter();
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  const { data, isLoading, error } = useGetUserProfile(id);
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();

  if (isLoading) {
    return (
      <div className="mt-34 container mx-auto flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto pt-36 pb-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
        <Button onClick={() => router.back()} variant="outline" className="rounded-full">Go Back</Button>
      </div>
    );
  }

  if (data.isBanned) {
    return (
      <div className="container mx-auto px-4 pt-36 pb-20">
        <div className="premium-panel mx-auto max-w-md p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Ban className="h-7 w-7" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">User banned</h2>
          <p className="mb-6 text-sm leading-6 text-gray-400">
            This account has been banned and the profile is not available.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("Please login to follow users");
      return;
    }
    try {
      if (data.isFollowing) {
        await unfollow.mutateAsync(id);
        toast.success(`Unfollowed ${data.name}`);
      } else {
        await follow.mutateAsync(id);
        toast.success(`Following ${data.name}`);
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="container mx-auto pt-36 pb-20">
      <div className="premium-panel group relative flex flex-col justify-between gap-8 overflow-hidden p-8 sm:flex-row sm:items-center">
        <div className="flex gap-8 items-center relative z-10">
          <figure className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
            {data.avatar ? (
              <Image
                alt={data.name}
                src={data.avatar}
                height={112}
                width={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-zinc-600">
                {data.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </figure>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{data.name}</h2>
            <div className="flex gap-6 text-sm text-zinc-400">
              <span
                className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
                onClick={() => setModalType("following")}
              >
                <strong className="text-white text-lg">{data._count.following}</strong> 
                <span className="uppercase text-[10px] tracking-widest font-bold">following</span>
              </span>
              <span
                className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
                onClick={() => setModalType("followers")}
              >
                <strong className="text-white text-lg">{data._count.followers}</strong>
                <span className="uppercase text-[10px] tracking-widest font-bold">followers</span>
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant={data.isFollowing ? "outline" : "default"}
                size="sm"
                className={`rounded-full h-10 px-8 font-bold uppercase text-[10px] tracking-widest transition-all ${
                  data.isFollowing 
                    ? "border-white/15 text-zinc-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400" 
                    : "bg-[#ff7a00] text-black hover:bg-[#ff922f] shadow-lg shadow-orange-500/20"
                }`}
                onClick={handleFollowToggle}
                disabled={follow.isPending || unfollow.isPending}
              >
                {data.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-full border-white/15 px-8 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                onClick={() => {
                  if (!token) {
                    toast.error("Please login to message users");
                    return;
                  }
                  router.push(`/chat?user=${id}`);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="Library" className="my-10">
        <TabsList className="h-auto w-full justify-start gap-10 rounded-none border-b border-white/10 bg-transparent p-0">
          <TabsTrigger
            value="Library"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="Review"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library" className="mt-6">
          <Library userProfile={data} />
        </TabsContent>
        <TabsContent value="Review" className="mt-6">
          {data.userBookReviews?.length === 0 ? (
            <div className="premium-empty">
              <p className="font-medium text-zinc-500">{data.name} hasn&apos;t reviewed any books yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data.userBookReviews?.map((review) => (
                <Link
                  key={review.id}
                  href={`/book-detail/${review.book.id}`}
                  className="premium-panel group flex gap-6 p-6 transition-all hover:-translate-y-1 hover:border-[#ff9a3d]/45"
                >
                  <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg transition-transform group-hover:scale-105">
                    <Image
                      src={review.book.image}
                      alt={review.book.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-lg leading-tight mb-1">{review.book.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-orange-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-xl">
                              {i < review.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-4 text-sm leading-relaxed line-clamp-3 italic">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {modalType && (
        <FollowerListModal
          userId={id}
          type={modalType}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
