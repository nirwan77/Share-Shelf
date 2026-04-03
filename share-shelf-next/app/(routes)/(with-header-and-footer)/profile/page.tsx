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
import { Library } from "./components";
import { toast } from "sonner";
import { Camera as CameraIcon } from "lucide-react";

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="heading-4 font-bold text-gray-900">{data?.name}</h2>
              <div className="mt-1 flex gap-4 text-sm text-gray-500">
                <span><strong className="text-gray-900">0</strong> following</span>
                <span><strong className="text-gray-900">0</strong> followers</span>
                <span><strong className="text-gray-900">0</strong> books exchanged</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-semibold">
                <span>Rs. {data?.money}</span>
              </div>
            </div>
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <figure
                className="rounded-full overflow-hidden w-24 h-24 bg-gray-100 flex items-center justify-center cursor-pointer border-4 border-white shadow-md group-hover:shadow-lg transition-all relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {data?.avatar ? (
                  <Image
                    alt={data.name}
                    src={data.avatar}
                    height={96}
                    width={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">
                    {data?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="text-white w-6 h-6" />
                </div>
              </figure>
              {(uploadImage.isPending || updateAvatar.isPending) && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Tabs defaultValue="Library" className="my-10">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger
            value="Library"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent rounded-none px-0 py-3 font-semibold transition-all h-auto"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="MyOffers"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent rounded-none px-0 py-3 font-semibold transition-all h-auto"
          >
            My Offers
          </TabsTrigger>
          <TabsTrigger
            value="MyRequests"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent rounded-none px-0 py-3 font-semibold transition-all h-auto"
          >
            My Book Requests
          </TabsTrigger>
          <TabsTrigger
            value="Review"
            className="data-[state=active]:bg-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 border-b-2 border-transparent rounded-none px-0 py-3 font-semibold transition-all h-auto"
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
            <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
              <p className="text-gray-500">You haven&apos;t posted any offers yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offersData?.map((offer: MyOffer) => (
                <div key={offer.id} className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="relative w-20 h-28 shrink-0">
                    <Image
                      src={offer.book.image}
                      alt={offer.book.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{offer.book.name}</h4>
                      <p className="text-sm text-gray-500">{offer.book.author}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-orange-600 font-bold">Rs. {offer.price}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 font-bold text-orange-500 rounded-full">{offer.type}</span>
                        {offer.condition && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 font-bold text-orange-500 rounded-full">{offer.condition}</span>
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
            <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
              <p className="text-gray-500">You haven&apos;t made any book requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requestsData?.map((req: MyBookRequest) => (
                <div key={req.id} className="bg-white border rounded-2xl p-6 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-bold text-gray-900">{req.title}</h4>
                    <p className="text-sm text-gray-500">by {req.author}</p>
                    {req.description && <p className="text-sm text-gray-600 mt-2 line-clamp-1">{req.description}</p>}
                    <p className="text-[11px] text-gray-400 mt-3 font-medium uppercase tracking-wider">
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
            <div className="py-12 text-center bg-gray-0 rounded-2xl border-2 border-dashed">
              <p className="text-gray-500">You haven&apos;t reviewed any books yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data?.userBookReviews?.map((review) => (
                <div key={review.id} className="bg-white border rounded-2xl p-6 flex gap-6 hover:shadow-md transition-shadow">
                  <div className="relative w-16 h-24 shrink-0">
                    <Image
                      src={review.book.image}
                      alt={review.book.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.book.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-orange-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-lg">
                              {i < review.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium tracking-tight">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed line-clamp-3">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
