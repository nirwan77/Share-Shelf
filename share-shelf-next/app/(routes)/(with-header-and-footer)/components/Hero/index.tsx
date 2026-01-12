"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const router = useRouter();
  const { token } = useAuth();

  return (
    <div className="h-dvh relative bg-cover flex justify-center items-center">
      <Image
        src={"/heroImage.jpg"}
        alt="a"
        className="absolute top-0 left-0 h-dvh w-full z-0"
        height={1800}
        width={1800}
      />
      <div className="realtive z-10">
        <h1 className="heading-1 text-center text-white">SHARE SHELF</h1>
        <p className="max-w-[649px] text-white text-center">
          Discover a world where books connect readers. Exchange, buy, and
          explore new literary landscapes with passionate book lovers.
        </p>
        <div className="flex gap-6 mt-12 justify-center">
          {token ? (
            <Button onClick={() => router.push("/")} className="bg-gray-500">
              Explore
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push("/sign-up")}
                className="bg-gray-500"
              >
                Join for free
              </Button>
              <Button
                onClick={() => router.push("/login")}
                className="hover:bg-gray-800"
              >
                login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
