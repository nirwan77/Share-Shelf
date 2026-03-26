"use client";

import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetProfile, useGetMyOffers, useGetMyRequests, useDeleteOffer } from "./action";
import type { MyOffer, MyBookRequest } from "./action";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library } from "./components";

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  const { data, isLoading } = useGetProfile();
  const { data: offersData, isLoading: offersLoading } = useGetMyOffers();
  const { data: requestsData, isLoading: requestsLoading } = useGetMyRequests();
  const deleteOffer = useDeleteOffer();

  return (
    <div className="mt-34 container mx-auto">
      {isLoading ? (
        <>loading</>
      ) : (
        <>
          <div className="flex justify-between">
            <div>
              <h2 className="heading-4">{data?.name}</h2>
              <div className="mt-1 flex gap-2.5">
                <span>0 following</span>
                <span>0 followers</span>
                <span>0 books exchanged</span>
              </div>
              <h3 className="text-2xl mt-3">Rs. {data?.money}</h3>
            </div>
            <figure className="rounded-full overflow-hidden">
              <Image
                alt=""
                src={data?.avatar ? data.avatar : "/avatar.jpeg"}
                height={80}
                width={80}
              />
            </figure>
          </div>
        </>
      )}
      <Tabs defaultValue="Library" className="my-10">
        <TabsList>
          <TabsTrigger value="Library" className="body-lg">
            Library
          </TabsTrigger>
          <TabsTrigger value="MyOffers" className="body-lg">
            My Offers
          </TabsTrigger>
          <TabsTrigger value="MyRequests" className="body-lg">
            My Book Requests
          </TabsTrigger>
          <TabsTrigger value="Review" className="body-lg">
            Review
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library">
          <Library />
        </TabsContent>
        <TabsContent value="MyOffers">
          {offersLoading ? (
            <div className="py-4">Loading offers...</div>
          ) : offersData?.length === 0 ? (
            <div className="py-4 text-gray-500">You haven&apos;t posted any offers yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {offersData?.map((offer: MyOffer) => (
                <div key={offer.id} className="border border-[#dbdcd2] rounded-xl p-4 flex gap-4">
                  <Image 
                    src={offer.book.image} 
                    alt={offer.book.name} 
                    width={80} 
                    height={100} 
                    className="object-cover rounded-md"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold">{offer.book.name}</h4>
                      <p className="text-sm text-gray-500">{offer.book.author}</p>
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-[#FF8D28]">Rs. {offer.price}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span>{offer.type === "SELL" ? "Selling" : "Trading"}</span>
                        {offer.condition && (
                          <>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>{offer.condition}</span>
                          </>
                        )}
                      </div>
                      {offer.note && <p className="text-xs text-gray-500 mt-1 italic">&quot;{offer.note}&quot;</p>}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this offer?")) {
                            deleteOffer.mutate(offer.id);
                          }
                        }}
                        disabled={deleteOffer.isPending}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
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
        <TabsContent value="MyRequests">
          {requestsLoading ? (
            <div className="py-4">Loading requests...</div>
          ) : requestsData?.length === 0 ? (
            <div className="py-4 text-gray-500">You haven&apos;t made any book requests.</div>
          ) : (
            <div className="space-y-4 py-4">
              {requestsData?.map((req: MyBookRequest) => (
                <div key={req.id} className="border border-[#dbdcd2] rounded-xl p-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{req.title}</h4>
                    <p className="text-sm text-gray-500">by {req.author}</p>
                    {req.description && <p className="text-xs text-gray-600 mt-2">{req.description}</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
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
        <TabsContent value="Review">Change your Review here.</TabsContent>
      </Tabs>
    </div>
  );
}
