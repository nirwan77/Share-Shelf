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
    <div className="relative flex min-h-[720px] items-center justify-center overflow-hidden pt-28 sm:min-h-dvh">
      <div className="absolute inset-0 z-0">
        <Image
          src="/heroImage.jpg"
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/55 to-black" />
      </div>

      <div className="relative z-10 px-4 pb-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="tag mb-4 inline-block">Trade, buy, discuss</span>
        <h1 className="heading-1 mb-5 text-center text-white drop-shadow-lg">
          SHARE SHELF
        </h1>
        <p className="mx-auto max-w-[680px] text-center text-base leading-8 text-zinc-200 drop-shadow-md md:text-xl">
          Discover a world where books connect readers. Exchange, buy, and
          explore new literary landscapes with passionate book lovers.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!mounted ? null : token ? (
            <Button
              onClick={() => router.push("/explore")}
              className="h-12 min-w-[170px] rounded-full text-base font-bold"
            >
              Explore
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push("/sign-up")}
                className="h-12 min-w-[170px] rounded-full text-base font-bold"
              >
                Join for free
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="h-12 min-w-[170px] rounded-full border-white/40 text-base font-bold"
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
