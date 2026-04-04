"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyPayment, useCompletePurchase } from "./action";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const verifyPayment = useVerifyPayment();
  const purchaseId = searchParams.get("purchaseId");
  const completePurchase = useCompletePurchase();
  const { push } = useRouter();

  useEffect(() => {
    const base64Response = searchParams.get("data");
    if (!base64Response) return;

    const decoded = JSON.parse(atob(base64Response));

    const timer = setTimeout(() => {
      if (purchaseId) {
        completePurchase.mutate({ purchaseId, payload: decoded });
      } else {
        verifyPayment.mutate(decoded);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [purchaseId]);

  return (
    <div className="flex items-center flex-col gap-4 justify-center h-screen">
      <h1 className="text-2xl font-semibold">
        {purchaseId ? "Purchase Successful!" : "Payment Successful!"}
      </h1>
      {purchaseId && (
        <p className="text-gray-500">
          Your book has been purchased successfully.
        </p>
      )}
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
