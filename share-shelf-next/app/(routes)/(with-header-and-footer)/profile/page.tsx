"use client";

import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  useGetProfile,
  useGetMyOffers,
  useGetMyRequests,
  useDeleteOffer,
  useUploadImage,
  useUpdateAvatar,
} from "./action";
import type { MyOffer, MyBookRequest } from "./action";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, FollowerListModal } from "./components";
import { toast } from "sonner";
import { Camera as CameraIcon } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  const { data, isLoading } = useGetProfile();
  const { data: offersData, isLoading: offersLoading } = useGetMyOffers();
  const { data: requestsData, isLoading: requestsLoading } = useGetMyRequests();
  const deleteOffer = useDeleteOffer();
  const uploadImage = useUploadImage();
  const updateAvatar = useUpdateAvatar();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await uploadImage.mutateAsync(file);
      await updateAvatar.mutateAsync(uploadResult.url);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to update profile picture");
    }
  };

  return (
    <div className="mt-34 container mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">{data?.name}</h2>
              <div className="flex gap-6 text-sm text-gray-400">
                <span
                  className="cursor-pointer hover:text-white transition-colors flex flex-col sm:flex-row sm:gap-1.5"
                  onClick={() => setModalType("following")}
                >
                  <strong className="text-white">{data?._count.following || 0}</strong>
                  <span className="uppercase text-[10px] tracking-wider font-bold">following</span>
                </span>
                <span
                  className="cursor-pointer hover:text-white transition-colors flex flex-col sm:flex-row sm:gap-1.5"
                  onClick={() => setModalType("followers")}
                >
                  <strong className="text-white">{data?._count.followers || 0}</strong>
                  <span className="uppercase text-[10px] tracking-wider font-bold">followers</span>
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-600 bg-gray-800/50 px-3 py-1 rounded">
                  0 books exchanged
                </div>
              </div>
            </div>
            <div className="relative group z-10">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <figure
                className="rounded-full overflow-hidden w-28 h-28 bg-gray-800 flex items-center justify-center cursor-pointer border-4 border-gray-900 shadow-xl group-hover:scale-105 transition-all duration-300 relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {data?.avatar ? (
                  <Image
                    alt={data.name}
                    src={data.avatar}
                    height={112}
                    width={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-600 group-hover:text-orange-500 transition-colors">
                    {data?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <CameraIcon className="text-white w-7 h-7" />
                </div>
              </figure>
              {(uploadImage.isPending || updateAvatar.isPending) && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-full z-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                </div>
              )}
            </div>
            {/* Subtle background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </>
      )}

      <Tabs defaultValue="Library" className="my-10">
        <TabsList className="bg-transparent border-b border-gray-800 rounded-none w-full justify-start h-auto p-0 gap-10">
          <TabsTrigger
            value="Library"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="MyOffers"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            My Offers
          </TabsTrigger>
          <TabsTrigger
            value="MyRequests"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            My Requests
          </TabsTrigger>
          <TabsTrigger
            value="Review"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent text-gray-500 rounded-none px-0 py-4 font-bold transition-all h-auto uppercase text-xs tracking-widest"
          >
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library" className="mt-6">
          <Library />
        </TabsContent>
        <TabsContent value="MyOffers" className="mt-6">
          {offersLoading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : offersData?.length === 0 ? (
            <div className="py-20 text-center bg-gray-900 rounded-[32px] border-2 border-dashed border-gray-800">
              <p className="text-gray-500 font-medium">You haven&apos;t posted any offers yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offersData?.map((offer: MyOffer) => (
                <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-[32px] p-5 flex gap-5 hover:border-gray-700 transition-all group">
                  <div className="relative w-24 h-32 shrink-0 overflow-hidden rounded-2xl border border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
                    <Image
                      src={offer.book.image}
                      alt={offer.book.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight mb-1">{offer.book.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">{offer.book.author}</p>
                      <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                        <span className="text-orange-500 font-bold text-lg">Rs. {offer.price}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span className="text-[10px] px-2.5 py-1 bg-orange-500/10 font-bold text-orange-400 rounded-full border border-orange-500/20 uppercase tracking-tighter">{offer.type}</span>
                        {offer.condition && (
                          <>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className="text-[10px] px-2.5 py-1 bg-gray-800 font-bold text-gray-400 rounded-full border border-gray-700 uppercase tracking-tighter">{offer.condition}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this offer?")) {
                            deleteOffer.mutate(offer.id);
                          }
                        }}
                        disabled={deleteOffer.isPending}
                        className="text-red-500 hover:text-red-700 text-sm font-bold disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="MyRequests" className="mt-6">
          {requestsLoading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : requestsData?.length === 0 ? (
            <div className="py-20 text-center bg-gray-900 rounded-[32px] border-2 border-dashed border-gray-800">
              <p className="text-gray-500 font-medium">You haven&apos;t made any book requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requestsData?.map((req: MyBookRequest) => (
                <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-[32px] p-8 flex justify-between items-center hover:border-gray-700 transition-all group">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1">{req.title}</h4>
                    <p className="text-sm text-gray-500 font-medium italic">by {req.author}</p>
                    {req.description && <p className="text-sm text-gray-400 mt-4 line-clamp-2 leading-relaxed max-w-2xl">{req.description}</p>}
                    <p className="text-[10px] text-gray-600 mt-5 font-bold uppercase tracking-[0.2em]">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Review" className="mt-6">
          {data?.userBookReviews?.length === 0 ? (
            <div className="py-20 text-center bg-gray-900 rounded-[32px] border-2 border-dashed border-gray-800">
              <p className="text-gray-500 font-medium">You haven&apos;t reviewed any books yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data?.userBookReviews?.map((review) => (
                <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-[32px] p-6 flex gap-6 hover:border-gray-700 transition-all group">
                  <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-2xl border border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
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
          userId={data?.id || ""}
          type={modalType}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
