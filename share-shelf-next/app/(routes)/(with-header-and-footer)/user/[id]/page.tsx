"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUserProfile, useFollowUser, useUnfollowUser, type ProfileData } from "../../profile/action";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, FollowerListModal } from "../../profile/components";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
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
      <div className="mt-34 container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
        <Button onClick={() => router.back()} className="rounded-full bg-gray-900 border-gray-800 hover:bg-gray-800 text-white">Go Back</Button>
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
    } catch (err) {
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="mt-34 container mx-auto">
      <div className="flex justify-between items-center bg-gray-900 p-8 rounded-[32px] border border-gray-800 shadow-sm relative overflow-hidden group">
        <div className="flex gap-8 items-center relative z-10">
          <figure className="rounded-full overflow-hidden w-28 h-28 bg-gray-800 flex items-center justify-center border-4 border-gray-900 shadow-xl group-hover:scale-105 transition-transform duration-300">
            {data.avatar ? (
              <Image
                alt={data.name}
                src={data.avatar}
                height={112}
                width={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-600">
                {data.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </figure>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{data.name}</h2>
            <div className="flex gap-6 text-sm text-gray-400">
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
            <div className="mt-6">
              <Button
                variant={data.isFollowing ? "outline" : "default"}
                size="sm"
                className={`rounded-full h-10 px-8 font-bold uppercase text-[10px] tracking-widest transition-all ${
                  data.isFollowing 
                    ? "border-gray-700 text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20" 
                    : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20"
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
            </div>
          </div>
        </div>
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <Tabs defaultValue="Library" className="my-10">
        <TabsList className="bg-transparent border-b border-gray-800 rounded-none w-full justify-start h-auto p-0 gap-10">
          <TabsTrigger
            value="Library"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="Review"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library" className="mt-6">
          <Library userProfile={data} />
        </TabsContent>
        <TabsContent value="Review" className="mt-6">
          {data.userBookReviews?.length === 0 ? (
            <div className="py-20 text-center bg-gray-900 rounded-[32px] border-2 border-dashed border-gray-800">
              <p className="text-gray-500 font-medium">{data.name} hasn&apos;t reviewed any books yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data.userBookReviews?.map((review) => (
                <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-[32px] p-6 flex gap-6 hover:border-gray-700 transition-all group">
                  <div className="relative w-16 h-24 shrink-0 overflow-hidden rounded-xl border border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
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
                </div>
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
