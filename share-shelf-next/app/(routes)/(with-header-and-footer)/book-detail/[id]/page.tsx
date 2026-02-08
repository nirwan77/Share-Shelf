"use client";

import { useParams } from "next/navigation";
import { useGetBookDetail } from "./action";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Eye, Check } from "lucide-react";

const BookDetail = () => {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGetBookDetail(id);
  console.log(data);
  const [rating, setRating] = useState(0);
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    console.log("New rating:", newRating);
  };

  const [isBookmarkActive, setIsBookmarkActive] = useState(false);
  const [isEyeActive, setIsEyeActive] = useState(false);
  const [isCheckActive, setIsCheckActive] = useState(false);

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
            <p className="my-[18px]">5 available for swap</p>
            <div className="flex gap-2">
              <Button className="bg-[#FF8D28] h-[51px] w-[133px] rounded-2xl">
                Buy
              </Button>
              <button className="border border-[#F7F8EE] text-[#F7F8EE] h-[51px] w-[133px] rounded-2xl">
                List for swap
              </button>
              <button className="border border-[#FF8D28] text-[#FF8D28] h-[51px] w-[133px] rounded-2xl">
                Swap
              </button>
            </div>
          </div>
          <div className="col-start-11 col-span-2">
            <div className="flex items-center justify-center gap-4 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => setIsBookmarkActive(!isBookmarkActive)}
                className="group transition-transform duration-200 hover:scale-110"
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
                onClick={() => setIsEyeActive(!isEyeActive)}
                className="group transition-transform duration-200 hover:scale-110"
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
                onClick={() => setIsCheckActive(!isCheckActive)}
                className="group transition-transform duration-200 hover:scale-110"
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
                <TabsTrigger value="Review" className="body-lg">
                  Review
                </TabsTrigger>
              </TabsList>
              <TabsContent value="Description">{data?.description}</TabsContent>
              <TabsContent value="Review">Change your Review here.</TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDetail;
