"use client";

import { useParams } from "next/navigation";
import { useGetBookDetail, useCreateOffer, useToggleBookStatus } from "./action";
import { useGetProfile } from "@/app/(routes)/(with-header-and-footer)/profile/action";
import type { BookOffer } from "./action";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Eye, Check } from "lucide-react";

const BookDetail = () => {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGetBookDetail(id);
  const createOffer = useCreateOffer();
  const toggleStatus = useToggleBookStatus();
  const { data: profile } = useGetProfile();

  const [rating, setRating] = useState(0);
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const myStatusObj = (data?.userBookStatuses ?? []).find((s) => s.userId === profile?.id);
  const myStatus = myStatusObj?.status;

  const isBookmarkActive = myStatus === "PLAN_TO_READ";
  const isEyeActive = myStatus === "READING";
  const isCheckActive = myStatus === "READ";

  const handleToggleStatus = (status: "READING" | "PLAN_TO_READ" | "READ") => {
    if (!profile) {
      alert("Please log in to track books.");
      return;
    }
    toggleStatus.mutate({ bookId: id, status });
  };

  // Sell form state
  const [showSellForm, setShowSellForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCondition, setOfferCondition] = useState("Good");
  const [offerType, setOfferType] = useState<"SELL" | "TRADE">("SELL");
  const [offerNote, setOfferNote] = useState("");

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

  const hasActiveOffer = (data?.bookOffers ?? []).some((o) => o.user.id === profile?.id);

  return (
    <>
      {isLoading ? (
        <>loading...</>
      ) : (
        <div className="pt-[138px] container mx-auto grid grid-cols-12 gap-4">
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
          <div className="col-start-5 col-span-4">
            <h1 className="heading-3 mb-2">{data?.name}</h1>
            <p className="text-sm">
              <span className="font-semibold">By </span>
              {data?.author}
            </p>
            <p className="my-[18px] text-sm text-gray-400">
              {sellOffers.length > 0 &&
                `${sellOffers.length} available to buy`}
              {sellOffers.length > 0 && tradeOffers.length > 0 && " · "}
              {tradeOffers.length > 0 &&
                `${tradeOffers.length} open for trade`}
              {sellOffers.length === 0 &&
                tradeOffers.length === 0 &&
                "No offers yet"}
            </p>
            {hasActiveOffer ? (
              <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-200 mt-2">
                You already have an active offer for this book. Check your profile to manage it!
              </div>
            ) : (
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

            {/* Sell / Trade Form */}
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
                    <Label htmlFor="offer-price">
                      Price (Rs.) *
                    </Label>
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
                    disabled={createOffer.isPending || (offerType === "SELL" && !offerPrice)}
                  >
                    {createOffer.isPending ? "Posting..." : "Post Offer"}
                  </Button>
                </div>
              </form>
            )}
          </div>
          <div className="col-start-11 col-span-2">
            <div className="flex items-center justify-center gap-4 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => handleToggleStatus("PLAN_TO_READ")}
                disabled={toggleStatus.isPending && toggleStatus.variables?.status === "PLAN_TO_READ"}
                className={`group transition-transform duration-200 hover:scale-110 ${toggleStatus.isPending ? 'opacity-50' : ''}`}
                title="Want to Read"
              >
                <div
                  className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                ${
                  isBookmarkActive
                    ? "bg-white border-white"
                    : "bg-transparent border-white/80"
                }
              `}
                >
                  <Bookmark
                    className={`
                  w-6 h-6 transition-colors duration-300
                  ${isBookmarkActive ? "text-slate-700" : "text-white"}
                `}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Eye Button */}
              <button
                onClick={() => handleToggleStatus("READING")}
                disabled={toggleStatus.isPending && toggleStatus.variables?.status === "READING"}
                className={`group transition-transform duration-200 hover:scale-110 ${toggleStatus.isPending ? 'opacity-50' : ''}`}
                title="Currently Reading"
              >
                <div
                  className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                ${
                  isEyeActive
                    ? "bg-white border-white"
                    : "bg-transparent border-white/80"
                }
              `}
                >
                  <Eye
                    className={`
                  w-6 h-6 transition-colors duration-300
                  ${isEyeActive ? "text-slate-700" : "text-white"}
                `}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Check Button */}
              <button
                onClick={() => handleToggleStatus("READ")}
                disabled={toggleStatus.isPending && toggleStatus.variables?.status === "READ"}
                className={`group transition-transform duration-200 hover:scale-110 ${toggleStatus.isPending ? 'opacity-50' : ''}`}
                title="Read"
              >
                <div
                  className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                ${
                  isCheckActive
                    ? "bg-white border-white"
                    : "bg-transparent border-white/80"
                }
              `}
                >
                  <Check
                    className={`
                  w-6 h-6 transition-colors duration-300
                  ${isCheckActive ? "text-slate-700" : "text-white"}
                `}
                    strokeWidth={2}
                  />
                </div>
              </button>
            </div>
          </div>

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
                  Review
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
                              Selling
                              {offer.note && ` · ${offer.note}`}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#FF8D28]">
                          Rs. {offer.price}
                        </span>
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
                              Trading
                              {offer.note && ` · ${offer.note}`}
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
              <TabsContent value="Review">No review for now.</TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDetail;
