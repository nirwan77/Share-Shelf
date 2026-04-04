"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { useEffect, useState } from "react";

export const Hero = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-dvh relative flex justify-center items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/heroImage.jpg"
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 z-[1]" />
      </div>

      <div className="relative z-10 px-4">
        <h1 className="heading-1 text-center text-white drop-shadow-lg mb-4">
          SHARE SHELF
        </h1>
        <p className="max-w-[649px] text-white text-center text-lg md:text-xl drop-shadow-md mx-auto">
          Discover a world where books connect readers. Exchange, buy, and
          explore new literary landscapes with passionate book lovers.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 mt-12 justify-center items-center">
          {!mounted ? null : token ? (
            <Button
              onClick={() => router.push("/explore")}
              className="bg-orange-400 hover:bg-orange-500 text-white min-w-[160px] h-12 text-lg font-semibold rounded-full transition-all"
            >
              Explore
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push("/sign-up")}
                className="bg-orange-400 hover:bg-orange-500 text-white min-w-[160px] h-12 text-lg font-semibold rounded-full transition-all"
              >
                Join for free
              </Button>
              <Button
                onClick={() => router.push("/login")}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white min-w-[160px] h-12 text-lg font-semibold rounded-full transition-all"
              >
                Log in
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
