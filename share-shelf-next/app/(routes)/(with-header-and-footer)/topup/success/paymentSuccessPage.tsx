"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useVerifyPayment, useCompletePurchase } from "./action";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const verifyPayment = useVerifyPayment();
  const completePurchase = useCompletePurchase();
  const { push } = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Parse the full URL manually since eSewa appends ?data= (second ?)
    const fullUrl = window.location.href;
    console.log("Full URL:", fullUrl);

    // Extract purchaseId from first ? block
    const firstQuestionMark = fullUrl.indexOf("?");
    const secondQuestionMark = fullUrl.indexOf("?", firstQuestionMark + 1);

    const firstParamsStr = fullUrl.slice(
      firstQuestionMark + 1,
      secondQuestionMark === -1 ? undefined : secondQuestionMark,
    );
    const firstParams = new URLSearchParams(firstParamsStr);
    const purchaseId = firstParams.get("purchaseId");

    // Extract data= from second ? block
    let base64Response: string | null = null;
    if (secondQuestionMark !== -1) {
      const secondParamsStr = fullUrl.slice(secondQuestionMark + 1);
      const secondParams = new URLSearchParams(secondParamsStr);
      base64Response = secondParams.get("data");
    }

    console.log("purchaseId:", purchaseId);
    console.log("base64Response:", base64Response);

    if (!base64Response) {
      console.log("No base64 response found");
      return;
    }

    let decoded: any;
    try {
      decoded = JSON.parse(atob(base64Response));
      console.log("Decoded payment data:", decoded);
    } catch (error) {
      console.error("Failed to decode payment data:", error);
      return;
    }

    if (purchaseId) {
      console.log("Calling completePurchase, purchaseId:", purchaseId);
      completePurchase.mutate(
        { purchaseId, payload: decoded },
        {
          onSuccess: (data) => console.log("completePurchase success:", data),
          onError: (error) => console.error("completePurchase error:", error),
        },
      );
    } else {
      console.log("Calling verifyPayment");
      verifyPayment.mutate(decoded, {
        onSuccess: (data) => console.log("verifyPayment success:", data),
        onError: (error) => console.error("verifyPayment error:", error),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPending = completePurchase.isPending || verifyPayment.isPending;
  const isError = completePurchase.isError || verifyPayment.isError;
  const isSuccess = completePurchase.isSuccess || verifyPayment.isSuccess;
  const purchaseId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.href.split("?")[1]).get(
          "purchaseId",
        )
      : null;

  return (
    <div className="flex items-center flex-col gap-4 justify-center h-screen">
      <h1 className="text-2xl font-semibold">
        {purchaseId ? "Purchase Successful!" : "Payment Successful!"}
      </h1>

      {isPending && (
        <p className="text-gray-400 text-sm">Processing your payment...</p>
      )}
      {isError && (
        <p className="text-red-500 text-sm">
          Something went wrong. Please contact support.
        </p>
      )}
      {isSuccess && purchaseId && (
        <p className="text-gray-500">
          Your book has been purchased successfully.
        </p>
      )}

      <Button
        onClick={() => push("/")}
        className="bg-[#FF8D28] hover:bg-[#f1aa6c] h-[51px] w-[133px] rounded-2xl"
      >
        Return to home
      </Button>
    </div>
  );
}
