"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyPayment } from "./action";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const verifyPayment = useVerifyPayment();
  const { push } = useRouter();

  useEffect(() => {
    const base64Response = searchParams.get("data");
    if (!base64Response) return;

    const decoded = JSON.parse(atob(base64Response));

    const timer = setTimeout(() => {
      verifyPayment.mutate(decoded);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center flex-col gap-4 justify-center h-screen">
      <h1 className="text-2xl font-semibold">Payment Successful</h1>
      <div>
        <Button
          onClick={() => push("/")}
          className="bg-[#FF8D28] hover:bg-[#f1aa6c] h-[51px] w-[133px] rounded-2xl"
        >
          Return to home
        </Button>
      </div>
    </div>
  );
}
