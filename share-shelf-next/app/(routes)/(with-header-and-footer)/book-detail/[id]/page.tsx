"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetBookDetail,
  useCreateOffer,
  useToggleBookStatus,
  useCreateReview,
  useVoteReview,
  useInitiatePurchase,
} from "./action";
import type { BookOffer, BookReview } from "./action";
import { ReviewCard } from "./ReviewCard";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import { useAuth } from "@/contexts";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bookmark,
  Eye,
  Check,
  CircleX,
  Star,
  BookOpen,
  Lock,
  Pen,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { BookStatus } from "./action";

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;
  return typeof response?.data?.message === "string"
    ? response.data.message
    : fallback;
};

/* ─────────────────────────────── page ────────────────────────────────── */

const BookDetail = () => {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGetBookDetail(id);
  const createOffer = useCreateOffer();
  const toggleStatus = useToggleBookStatus();
  const createReview = useCreateReview();
  const voteReview = useVoteReview();
  const initiatePurchase = useInitiatePurchase();
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { token } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const handleRatingChange = (newRating: number) => setRating(newRating);

  const myStatusObj = (data?.userBookStatuses ?? []).find(
    (s) => s.userId === profile?.id,
  );
  const myStatus = myStatusObj?.status;

  const isBookmarkActive = myStatus === "PLAN_TO_READ";
  const isEyeActive = myStatus === "READING";
  const isCheckActive = myStatus === "READ";
  const isDroppedActive = myStatus === "DROPPED";

  const handleToggleStatus = (status: BookStatus) => {
    if (!profile) {
      toast.error("Please log in to track books.");
      return;
    }
    toggleStatus.mutate(
      { bookId: id, status },
      {
        onSuccess: (data) => {
          const statusLabels: Record<string, string> = {
            READING: "Currently Reading",
            PLAN_TO_READ: "Plan to Read / Wishlist",
            READ: "Read",
            DROPPED: "Dropped",
          };
          if (data?.message === "Status removed") {
            toast.success(`Removed from ${statusLabels[status]}`);
          } else {
            toast.success(`Added to ${statusLabels[status]}`);
          }
        },
        onError: () =>
          toast.error("Failed to update status. Please try again."),
      },
    );
  };

  const [showSellForm, setShowSellForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [sellerEsewaNumber, setSellerEsewaNumber] = useState("");
  const [offerCondition, setOfferCondition] = useState("Good");
  const [offerType, setOfferType] = useState<"SELL" | "TRADE">("SELL");
  const [sellerLocation, setSellerLocation] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const requireLogin = () => {
    if (!token?.accessToken) {
      toast.error("Please login first.");
      return false;
    }

    return true;
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;

    createOffer.mutate(
      {
        bookId: id,
        price: offerType === "TRADE" ? 0 : Number(offerPrice),
        condition: offerCondition,
        type: offerType,
        sellerLocation: sellerLocation.trim(),
        note: offerNote || undefined,
        sellerEsewaNumber:
          offerType === "SELL" ? sellerEsewaNumber.trim() : undefined,
      },
      {
        onSuccess: () => {
          setShowSellForm(false);
          setOfferPrice("");
          setSellerEsewaNumber("");
          setSellerLocation("");
          setOfferNote("");
        },
      },
    );
  };

  const sellOffers = (data?.bookOffers ?? []).filter((o) => o.type === "SELL");
  const tradeOffers = (data?.bookOffers ?? []).filter(
    (o) => o.type === "TRADE",
  );
  const hasActiveOffer = (data?.bookOffers ?? []).some(
    (o) => o.user.id === profile?.id,
  );

  const reviews: BookReview[] = data?.userBookReviews ?? [];
  const alreadyReviewed = profile
    ? reviews.some((r) => r.user.id === profile.id)
    : false;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <>
      {isLoading ? (
        <>loading...</>
      ) : (
        <div className="container mx-auto grid grid-cols-1 gap-8 pt-36 pb-20 lg:grid-cols-12">
          {/* Book image col */}
          <div className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111114] pt-[100%]">
              <figure className="absolute left-1/2 top-1/2 max-h-[420px] max-w-[82%] -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-[16px_22px_40px_rgba(0,0,0,0.5)]">
                <Image
                  alt={data?.name ?? ""}
                  src={data?.image ?? ""}
                  className="block max-w-full h-auto max-h-[420px]"
                  width={480}
                  height={520}
                />
              </figure>
            </div>
          </div>

          {/* Book info col */}
          <div className="lg:col-span-5">
            <h1 className="heading-3 mb-2">{data?.name}</h1>
            <p className="text-sm text-zinc-300">
              <span className="font-semibold">By </span>
              {data?.author}
            </p>
            <p className="my-[18px] text-sm text-zinc-500">
              {sellOffers.length > 0 && `${sellOffers.length} available to buy`}
              {sellOffers.length > 0 && tradeOffers.length > 0 && " · "}
              {tradeOffers.length > 0 && `${tradeOffers.length} open for trade`}
              {sellOffers.length === 0 &&
                tradeOffers.length === 0 &&
                "No offers yet"}
            </p>
            {!hasActiveOffer && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-[51px] w-full rounded-2xl sm:w-[150px]"
                  onClick={() => {
                    if (!requireLogin()) return;
                    setOfferType("SELL");
                    setShowSellForm(true);
                  }}
                >
                  Sell This Book
                </Button>
                <button
                  className="h-[51px] w-full rounded-2xl border border-[#ff7a00] text-[#ff7a00] transition-colors hover:bg-[#ff7a00] hover:text-black sm:w-[150px]"
                  onClick={() => {
                    if (!requireLogin()) return;
                    setOfferType("TRADE");
                    setShowSellForm(true);
                  }}
                >
                  List for Trade
                </button>
              </div>
            )}

            {showSellForm && (
              <form
                onSubmit={handleCreateOffer}
                className="app-card mt-6 space-y-3 p-4"
              >
                <h3 className="font-semibold text-sm">
                  {offerType === "SELL" ? "Sell" : "Trade"} This Book
                </h3>
                {offerType === "SELL" && (
                  <div>
                    <Label htmlFor="offer-price">Price (Rs.) *</Label>
                    <Input
                      id="offer-price"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="e.g. 500"
                      required
                      min={1}
                    />
                  </div>
                )}
                {offerType === "SELL" && (
                  <div>
                    <Label htmlFor="seller-esewa-number">eSewa Number *</Label>
                    <Input
                      id="seller-esewa-number"
                      type="tel"
                      value={sellerEsewaNumber}
                      onChange={(e) => setSellerEsewaNumber(e.target.value)}
                      placeholder="e.g. 98XXXXXXXX"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="seller-location">
                    Pickup / Selling Location *
                  </Label>
                  <Input
                    id="seller-location"
                    value={sellerLocation}
                    onChange={(e) => setSellerLocation(e.target.value)}
                    placeholder="e.g. Pulchowk Campus Gate, Kathmandu"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="offer-condition">Condition</Label>
                  <select
                    id="offer-condition"
                    value={offerCondition}
                    onChange={(e) => setOfferCondition(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="offer-note">Note (optional)</Label>
                  <Input
                    id="offer-note"
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                    placeholder="Any details about your copy..."
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSellForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#FF8D28] hover:bg-[#e67d1f]"
                    disabled={
                      createOffer.isPending ||
                      !sellerLocation.trim() ||
                      (offerType === "SELL" &&
                        (!offerPrice || !sellerEsewaNumber.trim()))
                    }
                  >
                    {createOffer.isPending ? "Posting..." : "Post Offer"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Status icons col */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-start gap-4 rounded-2xl backdrop-blur-sm lg:justify-center">
              {[
                {
                  status: "PLAN_TO_READ" as const,
                  icon: Bookmark,
                  active: isBookmarkActive,
                  title: "Want to Read",
                },
                {
                  status: "READING" as const,
                  icon: Eye,
                  active: isEyeActive,
                  title: "Currently Reading",
                },
                {
                  status: "READ" as const,
                  icon: Check,
                  active: isCheckActive,
                  title: "Read",
                },
                {
                  status: "DROPPED" as const,
                  icon: CircleX,
                  active: isDroppedActive,
                  title: "Dropped",
                },
              ].map(({ status, icon: Icon, active, title }) => (
                <button
                  key={status}
                  onClick={() => handleToggleStatus(status)}
                  disabled={
                    toggleStatus.isPending &&
                    toggleStatus.variables?.status === status
                  }
                  className={`group transition-transform duration-200 hover:scale-110 ${toggleStatus.isPending ? "opacity-50" : ""}`}
                  title={title}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${active ? "border-[#ff7a00] bg-[#ff7a00]" : "border-white/20 bg-white/[0.04]"}`}
                  >
                    <Icon
                      className={`h-6 w-6 transition-colors duration-300 ${active ? "text-black" : "text-white"}`}
                      strokeWidth={2}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="lg:col-span-12">
            <Tabs defaultValue="Description" className="my-10">
              <TabsList>
                <TabsTrigger value="Description" className="body-lg">
                  Description
                </TabsTrigger>
                <TabsTrigger value="Sellers" className="body-lg">
                  Sellers ({sellOffers.length})
                </TabsTrigger>
                <TabsTrigger value="Traders" className="body-lg">
                  Traders ({tradeOffers.length})
                </TabsTrigger>
                <TabsTrigger value="Review" className="body-lg">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Description" className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 leading-7 text-zinc-300">
                {data?.description}
              </TabsContent>

              <TabsContent value="Sellers">
                {sellOffers.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4">
                    No one is selling this book yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3 py-4">
                    {sellOffers.map((offer: BookOffer) => (
                      <div
                        key={offer.id}
                        className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                            {offer.user.avatar ? (
                              <Image
                                src={offer.user.avatar}
                                alt={offer.user.name}
                                width={36}
                                height={36}
                                className="rounded-full object-cover w-9 h-9"
                              />
                            ) : (
                              offer.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {offer.user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {offer.condition && `${offer.condition} · `}
                              Selling{offer.note && ` · ${offer.note}`}
                            </p>
                            {offer.sellerLocation && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3.5 w-3.5 text-[#FF8D28]" />
                                {offer.sellerLocation}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-[#FF8D28]">
                            Rs. {offer.price}
                          </span>
                          {offer.user.id !== profile?.id && (
                            <Button
                              size="sm"
                              className="bg-[#FF8D28] hover:bg-[#e67d1f] rounded-lg h-8 px-4"
                              onClick={() => {
                                if (!requireLogin()) return;
                                setSelectedOfferId(offer.id);
                                setLocationModalOpen(true);
                              }}
                              disabled={initiatePurchase.isPending}
                            >
                              {initiatePurchase.isPending &&
                                initiatePurchase.variables?.offerId === offer.id
                                ? "Processing..."
                                : "Buy"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="Traders">
                {tradeOffers.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4">
                    No one is trading this book yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3 py-4">
                    {tradeOffers.map((offer: BookOffer) => (
                      <div
                        key={offer.id}
                        className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                            {offer.user.avatar ? (
                              <Image
                                src={offer.user.avatar}
                                alt={offer.user.name}
                                width={36}
                                height={36}
                                className="rounded-full object-cover w-9 h-9"
                              />
                            ) : (
                              offer.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {offer.user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {offer.condition && `${offer.condition} · `}
                              Trading{offer.note && ` · ${offer.note}`}
                            </p>
                            {offer.sellerLocation && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3.5 w-3.5 text-[#FF8D28]" />
                                {offer.sellerLocation}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#FF8D28]">
                            Rs. 0
                          </span>
                          {offer.user.id !== profile?.id && (
                            <Button
                              size="sm"
                              className="h-8 rounded-lg bg-[#FF8D28] px-4 hover:bg-[#e67d1f]"
                              onClick={() => {
                                if (!requireLogin()) return;
                                router.push(`/chat?user=${offer.user.id}`);
                              }}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── REVIEW TAB ── */}
              <TabsContent value="Review">
                <div className="space-y-8 py-8">

                  {/* ── Rating summary hero ── */}
                  {reviews.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
                        {/* Left: big score */}
                        <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#ff7a00] via-[#ff8d28] to-[#ffb36d] px-10 py-9 text-black">
                          <span className="text-6xl font-black leading-none">
                            {avgRating.toFixed(1)}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-black text-black" : "fill-black/25 text-black/25"}`}
                              />
                            ))}
                          </div>
                          <span className="mt-0.5 text-xs font-bold uppercase tracking-[0.18em] text-black/70">
                            {reviews.length} review
                            {reviews.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Right: bar chart */}
                        <div className="flex flex-col justify-center gap-3 px-5 py-6 sm:px-8">
                          {[5, 4, 3, 2, 1].map((s) => {
                            const count = reviews.filter(
                              (r) => r.rating === s,
                            ).length;
                            const pct = reviews.length
                              ? Math.round((count / reviews.length) * 100)
                              : 0;
                            return (
                              <div key={s} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-8 shrink-0">
                                  <span className="text-xs font-medium text-zinc-400">
                                    {s}
                                  </span>
                                  <Star className="w-3 h-3 fill-[#FF8D28] text-[#FF8D28]" />
                                </div>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ffb36d] transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-5 shrink-0 text-right text-xs text-zinc-500">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Write a review / gated states ── */}
                  {!profile ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] shadow-sm">
                        <Lock className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Log in to leave a review
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          Share your thoughts with fellow readers.
                        </p>
                      </div>
                    </div>
                  ) : alreadyReviewed ? (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-4">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-300">
                        You&apos;ve already reviewed this book — thanks!
                      </p>
                    </div>
                  ) : !isCheckActive ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#ff7a00]/30 bg-[#ff7a00]/10 px-6 py-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff7a00]/15">
                        <BookOpen className="h-4 w-4 text-[#ffb36d]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Finish the book first
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          Mark as{" "}
                          <span className="font-semibold text-[#FF8D28]">
                            Read
                          </span>{" "}
                          using the ✓ button above to unlock reviews.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ── Actual review form ── */
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
                      {/* Header bar */}
                      <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-6 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff7a00]/10">
                          <Pen className="h-3.5 w-3.5 text-[#ff7a00]" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          Write a Review
                        </p>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Star picker */}
                        <div>
                          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
                            Your Rating
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleRatingChange(s)}
                                  onMouseEnter={() => setHoveredRating(s)}
                                  onMouseLeave={() => setHoveredRating(0)}
                                  className="focus:outline-none transition-transform hover:scale-110 duration-100"
                                >
                                  <Star
                                    className={`w-8 h-8 transition-all duration-150 ${s <= (hoveredRating || rating)
                                      ? "fill-[#FF8D28] text-[#FF8D28]"
                                      : "fill-zinc-800 text-zinc-700"
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                            {(hoveredRating || rating) > 0 && (
                              <span className="text-sm font-semibold text-[#FF8D28]">
                                {ratingLabels[hoveredRating || rating]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Textarea */}
                        <div>
                          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
                            Your Thoughts
                          </p>
                          <div className="relative">
                            <textarea
                              className="min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 pt-3.5 pb-9 text-sm leading-relaxed text-white placeholder:text-zinc-500 transition-colors focus:border-[#ff7a00]/50 focus:outline-none focus:ring-4 focus:ring-[#ff7a00]/15"
                              placeholder="What did you think? Would you recommend it?"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <span className="pointer-events-none absolute right-4 bottom-3 select-none text-[11px] text-zinc-600">
                              {reviewComment.length} chars
                            </span>
                          </div>
                        </div>

                        <Button
                          className="bg-[#FF8D28] hover:bg-[#e67d1f] h-10 px-7 rounded-xl text-sm font-semibold tracking-wide"
                          disabled={
                            createReview.isPending ||
                            rating === 0 ||
                            !reviewComment.trim()
                          }
                          onClick={() => {
                            createReview.mutate(
                              { bookId: id, rating, comment: reviewComment },
                              {
                                onSuccess: () => {
                                  toast.success(
                                    "Review submitted successfully!",
                                  );
                                  setRating(0);
                                  setReviewComment("");
                                },
                                onError: (error) => {
                                  toast.error(
                                    getApiErrorMessage(
                                      error,
                                      "Failed to submit review",
                                    ),
                                  );
                                },
                              },
                            );
                          }}
                        >
                          {createReview.isPending
                            ? "Submitting…"
                            : "Post Review"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── Reviews list ── */}
                  {reviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-white">
                          Reader Reviews
                        </h3>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid gap-4">
                        {reviews.map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            bookId={id}
                            canVote={!!profile}
                            voteReview={voteReview}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] py-14 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff7a00]/10 shadow-inner">
                        <Star className="h-6 w-6 text-[#ff7a00]" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        No reviews yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
      {/* Location Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="rounded-3xl border border-white/10 bg-[#111114] p-8 shadow-2xl sm:max-w-[425px]">
          <DialogHeader>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 self-center mx-auto">
              <MapPin className="h-6 w-6 text-[#ff7a00]" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold leading-tight text-white">
              Where should we meet?
            </DialogTitle>
            <DialogDescription className="pt-2 pb-4 text-center text-zinc-400">
              Please suggest a common meeting point or delivery location for the
              seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-zinc-300">
                Meeting Point / Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Pulchowk Campus Gate, Kathmandu"
                value={purchaseLocation}
                onChange={(e) => setPurchaseLocation(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocationModalOpen(false)}
              className="rounded-xl h-11 px-6 font-semibold hover:bg-gray-200 text-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!purchaseLocation.trim() || initiatePurchase.isPending}
              onClick={() => {
                if (!requireLogin()) return;
                if (!selectedOfferId) return;
                initiatePurchase.mutate(
                  { offerId: selectedOfferId, location: purchaseLocation },
                  {
                    onSuccess: (data) => {
                      setLocationModalOpen(false);
                      router.push(
                        `/topup?purchaseId=${data.purchaseId}&amount=${data.price}`,
                      );
                    },
                    onError: (error) => {
                      toast.error(
                        getApiErrorMessage(
                          error,
                          "Failed to initiate purchase",
                        ),
                      );
                    },
                  },
                );
              }}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl h-11 px-8 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              {initiatePurchase.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookDetail;
