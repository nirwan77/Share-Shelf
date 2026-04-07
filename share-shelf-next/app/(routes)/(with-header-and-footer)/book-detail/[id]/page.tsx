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
  Star,
  BookOpen,
  Lock,
  Pen,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

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

  const handleToggleStatus = (status: "READING" | "PLAN_TO_READ" | "READ") => {
    if (!profile) {
      toast.error("Please log in to track books.");
      return;
    }
    toggleStatus.mutate(
      { bookId: id, status },
      {
        onSuccess: (data: any) => {
          const statusLabels: Record<string, string> = {
            READING: "Currently Reading",
            PLAN_TO_READ: "Plan to Read",
            READ: "Read",
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
  const [offerCondition, setOfferCondition] = useState("Good");
  const [offerType, setOfferType] = useState<"SELL" | "TRADE">("SELL");
  const [offerNote, setOfferNote] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer.mutate(
      {
        bookId: id,
        price: offerType === "TRADE" ? 0 : Number(offerPrice),
        condition: offerCondition,
        type: offerType,
        note: offerNote || undefined,
      },
      {
        onSuccess: () => {
          setShowSellForm(false);
          setOfferPrice("");
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
        <div className="pt-[138px] container mx-auto grid grid-cols-12 gap-4">
          {/* Book image col */}
          <div className="col-span-4">
            <div className="pt-[100%] relative bg-[#F7F8EE] hover:bg-gray-200">
              <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer max-h-[420px] max-w-[90%] shadow-[10px_10px_20px_5px_rgba(0,0,0,0.12)]">
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
          <div className="col-start-5 col-span-4">
            <h1 className="heading-3 mb-2">{data?.name}</h1>
            <p className="text-sm">
              <span className="font-semibold">By </span>
              {data?.author}
            </p>
            <p className="my-[18px] text-sm text-gray-400">
              {sellOffers.length > 0 && `${sellOffers.length} available to buy`}
              {sellOffers.length > 0 && tradeOffers.length > 0 && " · "}
              {tradeOffers.length > 0 && `${tradeOffers.length} open for trade`}
              {sellOffers.length === 0 &&
                tradeOffers.length === 0 &&
                "No offers yet"}
            </p>
            {!hasActiveOffer && (
              <div className="flex gap-2">
                <Button
                  className="bg-[#FF8D28] hover:bg-[#e67d1f] h-[51px] w-[133px] rounded-2xl"
                  onClick={() => {
                    setOfferType("SELL");
                    setShowSellForm(true);
                  }}
                >
                  Sell This Book
                </Button>
                <button
                  className="border border-[#FF8D28] text-[#FF8D28] h-[51px] w-[133px] rounded-2xl hover:bg-[#FF8D28] hover:text-white transition-colors"
                  onClick={() => {
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
                className="mt-6 p-4 border border-[#dbdcd2] rounded-xl space-y-3"
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
                      (offerType === "SELL" && !offerPrice)
                    }
                  >
                    {createOffer.isPending ? "Posting..." : "Post Offer"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Status icons col */}
          <div className="col-start-11 col-span-2">
            <div className="flex items-center justify-center gap-4 rounded-2xl backdrop-blur-sm">
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-white border-white" : "bg-transparent border-white/80"}`}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-300 ${active ? "text-slate-700" : "text-white"}`}
                      strokeWidth={2}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="col-span-12">
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

              <TabsContent value="Description">{data?.description}</TabsContent>

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
                        className="flex items-center justify-between border border-[#dbdcd2] rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F7F8EE] flex items-center justify-center text-sm font-semibold">
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
                                if (!profile) {
                                  toast.error("Please log in to buy books.");
                                  return;
                                }
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
                        className="flex items-center justify-between border border-[#dbdcd2] rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F7F8EE] flex items-center justify-center text-sm font-semibold">
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
                          </div>
                        </div>
                        <span className="font-semibold text-[#FF8D28]">
                          Rs. 0
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── REVIEW TAB ── */}
              <TabsContent value="Review">
                <div className="py-8 space-y-8">

                  {/* ── Rating summary hero ── */}
                  {reviews.length > 0 && (
                    <div className="rounded-2xl border border-[#ebebdf] overflow-hidden">
                      <div className="grid grid-cols-[auto_1fr]">
                        {/* Left: big score */}
                        <div className="flex flex-col items-center justify-center gap-2 px-10 py-8 bg-gradient-to-br from-[#FF8D28] to-[#e67d1f] text-white">
                          <span className="text-6xl font-black leading-none tracking-tighter">
                            {avgRating.toFixed(1)}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "fill-white text-white" : "fill-white/30 text-white/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-white/80 mt-0.5">
                            {reviews.length} review
                            {reviews.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Right: bar chart */}
                        <div className="flex flex-col justify-center gap-2.5 px-8 py-6 bg-[#fafaf7]">
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
                                  <span className="text-xs text-gray-500 font-medium">
                                    {s}
                                  </span>
                                  <Star className="w-3 h-3 fill-[#FF8D28] text-[#FF8D28]" />
                                </div>
                                <div className="flex-1 h-2 bg-[#ebebdf] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#FF8D28] to-[#e67d1f] rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-5 text-right shrink-0">
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
                    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Log in to leave a review
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Share your thoughts with fellow readers.
                        </p>
                      </div>
                    </div>
                  ) : alreadyReviewed ? (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-700">
                        You&apos;ve already reviewed this book — thanks!
                      </p>
                    </div>
                  ) : !isCheckActive ? (
                    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-dashed border-[#FF8D28]/25 bg-[#fff9f4]">
                      <div className="w-10 h-10 rounded-full bg-[#FF8D28]/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-[#FF8D28]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Finish the book first
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
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
                    <div className="rounded-2xl border border-[#ebebdf] overflow-hidden shadow-sm">
                      {/* Header bar */}
                      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#ebebdf] bg-[#fafaf7]">
                        <div className="w-8 h-8 rounded-full bg-[#FF8D28]/10 flex items-center justify-center">
                          <Pen className="w-3.5 h-3.5 text-[#FF8D28]" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          Write a Review
                        </p>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Star picker */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
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
                                      : "text-gray-200 fill-gray-100"
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
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                            Your Thoughts
                          </p>
                          <div className="relative">
                            <textarea
                              className="w-full bg-[#fafaf7] border border-[#ebebdf] rounded-xl px-4 pt-3.5 pb-9 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF8D28]/20 focus:border-[#FF8D28]/40 min-h-[120px] resize-none leading-relaxed placeholder:text-gray-300 transition-colors"
                              placeholder="What did you think? Would you recommend it?"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <span className="absolute bottom-3 right-4 text-[11px] text-gray-300 pointer-events-none select-none">
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
                                onError: (error: any) => {
                                  toast.error(
                                    error?.response?.data?.message ||
                                    "Failed to submit review",
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
                        <h3 className="text-base font-bold text-gray-900">
                          Reader Reviews
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
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
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#F7F8EE] flex items-center justify-center mb-4 shadow-inner">
                        <Star className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        No reviews yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
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
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl bg-[#fafaf7] p-8">
          <DialogHeader>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 self-center mx-auto">
              <MapPin className="text-orange-600 w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 leading-tight">
              Where should we meet?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 pt-2 pb-4">
              Please suggest a common meeting point or delivery location for the
              seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                Meeting Point / Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Pulchowk Campus Gate, Kathmandu"
                value={purchaseLocation}
                onChange={(e) => setPurchaseLocation(e.target.value)}
                className="rounded-xl border-gray-200 h-12 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-black shadow-sm bg-white"
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
                    onError: (error: any) => {
                      toast.error(
                        error?.response?.data?.message ||
                        "Failed to initiate purchase",
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
