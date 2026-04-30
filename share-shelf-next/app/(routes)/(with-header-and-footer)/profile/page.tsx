"use client";

import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  useGetProfile,
  useGetMyOffers,
  useGetMyRequests,
  useGetMyPurchases,
  useDeleteOffer,
  useConfirmPurchaseReceived,
  useThankSeller,
  useUploadImage,
  useUpdateAvatar,
} from "./action";
import type { MyOffer, MyBookRequest, MyPurchase } from "./action";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Library, FollowerListModal } from "./components";
import { toast } from "sonner";
import { Camera as CameraIcon, HeartHandshake, Star } from "lucide-react";
import { useState } from "react";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (
    error as { response?: { data?: { message?: unknown } } }
  )?.response?.data?.message;

  return typeof responseMessage === "string" ? responseMessage : fallback;
};

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null,
  );
  const [ratingPurchase, setRatingPurchase] = useState<MyPurchase | null>(null);
  const [selectedSellerRating, setSelectedSellerRating] = useState(5);

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  const { data } = useGetProfile();
  const { data: offersData } = useGetMyOffers();
  const { data: requestsData } = useGetMyRequests();
  const { data: purchasesData } = useGetMyPurchases();
  const deleteOffer = useDeleteOffer();
  const confirmPurchaseReceived = useConfirmPurchaseReceived();
  const thankSeller = useThankSeller();
  const uploadImage = useUploadImage();
  const updateAvatar = useUpdateAvatar();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await uploadImage.mutateAsync(file);
      await updateAvatar.mutateAsync(uploadResult.url);
      toast.success("Profile picture updated successfully");
    } catch {
      toast.error("Failed to update profile picture");
    }
  };

  const openRatingModal = (purchase: MyPurchase) => {
    setRatingPurchase(purchase);
    setSelectedSellerRating(purchase.sellerRating ?? 5);
  };

  const closeRatingModal = () => {
    if (!thankSeller.isPending) {
      setRatingPurchase(null);
    }
  };

  const saveSellerRating = () => {
    if (!ratingPurchase) return;

    thankSeller.mutate(
      {
        purchaseId: ratingPurchase.id,
        rating: selectedSellerRating,
      },
      {
        onSuccess: () => {
          toast.success(
            "Seller rating saved. This helps other readers decide who to trust.",
          );
          setRatingPurchase(null);
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error, "Could not rate seller"));
        },
      },
    );
  };

  return (
    <div className="container mx-auto pt-36 pb-20">
      <div className="app-card relative flex flex-col-reverse items-center justify-between gap-8 overflow-hidden p-6 text-center sm:p-8 md:flex-row md:text-left">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            {data?.name || "Profile"}
          </h2>
          <div className="flex justify-center gap-6 text-sm text-gray-400 md:justify-start">
            <span
              className="cursor-pointer hover:text-white transition-colors items-center flex flex-col sm:flex-row sm:gap-1.5"
              onClick={() => setModalType("following")}
            >
              <strong className="text-white">
                {data?._count.following || 0}
              </strong>
              <span className="uppercase text-[10px] tracking-wider font-bold">
                following
              </span>
            </span>
            <span
              className="cursor-pointer hover:text-white items-center transition-colors flex flex-col sm:flex-row sm:gap-1.5"
              onClick={() => setModalType("followers")}
            >
              <strong className="text-white">
                {data?._count.followers || 0}
              </strong>
              <span className="uppercase text-[10px] tracking-wider font-bold">
                followers
              </span>
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              0 books exchanged
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              <Star className="h-3.5 w-3.5 fill-orange-400" />
              {data?.credibility?.averageRating?.toFixed(1) || "0.0"} rating
              <span className="text-zinc-500">
                ({data?.credibility?.ratingCount || 0})
              </span>
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
            className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-105"
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
                {data?.name?.charAt(0).toUpperCase() || "?"}
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
      </div>

      <Tabs defaultValue="Library" className="my-10">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-white/10 bg-transparent p-0">
          <TabsTrigger
            value="Library"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="MyOffers"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            My Offers
          </TabsTrigger>
          <TabsTrigger
            value="MyRequests"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            My Requests
          </TabsTrigger>
          <TabsTrigger
            value="MyPurchases"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            My Purchases
          </TabsTrigger>
          <TabsTrigger
            value="Review"
            className="h-auto rounded-none border-b-2 border-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500"
          >
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library" className="mt-6">
          <Library />
        </TabsContent>
        <TabsContent value="MyOffers" className="mt-6">
          {!offersData ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : offersData?.length === 0 ? (
            <div className="premium-empty">
              <p className="text-gray-500 font-medium">
                You haven&apos;t posted any offers yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {offersData?.map((offer: MyOffer) => (
                <div
                  key={offer.id}
                  className="app-card app-card-hover group flex flex-col gap-5 p-5 sm:flex-row"
                >
                  <Link
                    href={`/book-detail/${offer.book.id}`}
                    className="relative w-24 h-32 shrink-0 overflow-hidden rounded-2xl border border-gray-800 shadow-lg transition-transform group-hover:scale-105"
                  >
                    <Image
                      src={offer.book.image}
                      alt={offer.book.name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <Link
                        href={`/book-detail/${offer.book.id}`}
                        className="mb-1 block font-bold text-white text-lg leading-tight transition-colors hover:text-orange-500"
                      >
                        {offer.book.name}
                      </Link>
                      <p className="text-sm text-gray-500 font-medium">
                        {offer.book.author}
                      </p>
                      <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                        <span className="text-orange-500 font-bold text-lg">
                          Rs. {offer.price}
                        </span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span className="text-[10px] px-2.5 py-1 bg-orange-500/10 font-bold text-orange-400 rounded-full border border-orange-500/20 uppercase tracking-tighter">
                          {offer.type}
                        </span>
                        {offer.condition && (
                          <>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className="text-[10px] px-2.5 py-1 bg-gray-800 font-bold text-gray-400 rounded-full border border-gray-700 uppercase tracking-tighter">
                              {offer.condition}
                            </span>
                          </>
                        )}
                      </div>
                      {offer.sellerLocation && (
                        <p className="mt-3 text-xs font-medium text-gray-500">
                          Location: {offer.sellerLocation}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-4">
                      <Link
                        href={`/book-detail/${offer.book.id}`}
                        className="text-sm font-bold text-orange-500 hover:text-orange-400"
                      >
                        View Book
                      </Link>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this offer?",
                            )
                          ) {
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
          {!requestsData ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : requestsData?.length === 0 ? (
            <div className="premium-empty">
              <p className="text-gray-500 font-medium">
                You haven&apos;t made any book requests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requestsData?.map((req: MyBookRequest) => (
                <div
                  key={req.id}
                  className="app-card app-card-hover group flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                >
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1">
                      {req.title}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium italic">
                      by {req.author}
                    </p>
                    {req.description && (
                      <p className="text-sm text-gray-400 mt-4 line-clamp-2 leading-relaxed max-w-2xl">
                        {req.description}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-600 mt-5 font-bold uppercase tracking-[0.2em]">
                      Requested on{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        req.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : req.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="MyPurchases" className="mt-6">
          {!purchasesData ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : purchasesData?.length === 0 ? (
            <div className="premium-empty">
              <p className="text-gray-500 font-medium">
                You haven&apos;t purchased any books yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {purchasesData?.map((purchase: MyPurchase) => (
                <div
                  key={purchase.id}
                  className="app-card app-card-hover group flex flex-col gap-5 p-5 sm:flex-row"
                >
                  <Link
                    href={`/book-detail/${purchase.book.id}`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-800 shadow-lg transition-transform group-hover:scale-105"
                  >
                    <Image
                      src={purchase.book.image}
                      alt={purchase.book.name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <Link
                        href={`/book-detail/${purchase.book.id}`}
                        className="mb-1 block text-lg font-bold leading-tight text-white transition-colors hover:text-orange-500"
                      >
                        {purchase.book.name}
                      </Link>
                      <p className="text-sm font-medium text-gray-500">
                        {purchase.book.author}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        <span className="text-lg font-bold text-orange-500">
                          Rs. {purchase.price}
                        </span>
                        <span className="rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                          {purchase.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-gray-500">
                        Seller: {purchase.seller.name}
                        {purchase.seller.phone
                          ? ` (${purchase.seller.phone})`
                          : ""}
                      </p>
                      {purchase.location && (
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Location: {purchase.location}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-4">
                      {purchase.status === "PAID" && (
                        <button
                          onClick={() => {
                            confirmPurchaseReceived.mutate(purchase.id, {
                              onSuccess: () => {
                                toast.success(
                                  "Admin has been notified that you received the book",
                                );
                              },
                              onError: (error: unknown) => {
                                toast.error(
                                  getApiErrorMessage(
                                    error,
                                    "Could not confirm receipt",
                                  ),
                                );
                              },
                            });
                          }}
                          disabled={
                            confirmPurchaseReceived.isPending &&
                            confirmPurchaseReceived.variables === purchase.id
                          }
                          className="rounded-xl bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black transition-all hover:bg-[#ff922f] disabled:opacity-50"
                        >
                          {confirmPurchaseReceived.isPending &&
                          confirmPurchaseReceived.variables === purchase.id
                            ? "Confirming..."
                            : "I received the book"}
                        </button>
                      )}
                      {purchase.status === "BUYER_CONFIRMED" && (
                        <span className="text-sm font-bold text-green-500">
                          Receipt confirmed
                        </span>
                      )}
                      {["BUYER_CONFIRMED", "COMPLETED"].includes(
                        purchase.status,
                      ) && (
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                              onClick={() => openRatingModal(purchase)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-400 transition hover:border-orange-500/50 hover:bg-orange-500/15 disabled:opacity-50"
                            >
                              <HeartHandshake className="h-4 w-4" />
                              {purchase.sellerThanked
                                ? `Rated ${purchase.sellerRating || 5}/5`
                                : "Rate seller"}
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Review" className="mt-6">
          {!data?.userBookReviews ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : data.userBookReviews.length === 0 ? (
            <div className="premium-empty">
              <p className="text-gray-500 font-medium">
                You haven&apos;t reviewed any books yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data?.userBookReviews?.map((review) => (
                <Link
                  key={review.id}
                  href={`/book-detail/${review.book.id}`}
                  className="app-card app-card-hover group flex flex-col gap-6 p-6 sm:flex-row"
                >
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
                        <h4 className="font-bold text-white text-lg leading-tight mb-1">
                          {review.book.name}
                        </h4>
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
          userId={data?.id || ""}
          type={modalType}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
        />
      )}

      <Dialog open={!!ratingPurchase} onOpenChange={closeRatingModal}>
        <DialogContent className="rounded-3xl border border-white/10 bg-[#111114] p-8 text-white shadow-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold leading-tight text-white">
              Rate seller
            </DialogTitle>
            <DialogDescription className="pt-2 text-center text-zinc-400">
              {ratingPurchase
                ? `How was your transaction with ${ratingPurchase.seller.name}?`
                : "Choose a rating for this seller."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 py-6">
            {Array.from({ length: 5 }).map((_, index) => {
              const ratingValue = index + 1;

              return (
                <button
                  key={ratingValue}
                  type="button"
                  onClick={() => setSelectedSellerRating(ratingValue)}
                  className="rounded-xl p-2 text-orange-400 transition hover:bg-orange-500/10"
                  aria-label={`Rate seller ${ratingValue} out of 5`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      ratingValue <= selectedSellerRating
                        ? "fill-orange-400"
                        : "fill-transparent text-zinc-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <DialogFooter className="gap-3 sm:justify-center">
            <button
              type="button"
              onClick={closeRatingModal}
              disabled={thankSeller.isPending}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveSellerRating}
              disabled={thankSeller.isPending}
              className="rounded-xl bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#ff922f] disabled:opacity-50"
            >
              {thankSeller.isPending ? "Saving..." : "Save rating"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
