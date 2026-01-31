"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useVerifyOTP } from "./data";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { mutateAsync, isPending } = useVerifyOTP();

  const [otpValue, setOtpValue] = useState("");

  const onChange = (value: string) => {
    setOtpValue(value);
  };

  const onComplete = async (value: string) => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    mutateAsync(
      {
        email,
        value,
      },
      {
        onSuccess: () => {
          toast("Account verified successfully");
          router.push("/login");
        },
        onError: (err) => {
          toast(err.response.data.message ?? "error");
        },
      },
    );
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-4">Verify Email</h1>
      <p className="text-gray-500 mb-6">Enter the code sent to {email}</p>

      <InputOTP
        maxLength={6}
        value={otpValue}
        onChange={onChange}
        // onComplete={onComplete}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={4} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {/* <Button
        onClick={resendOtp}
        variant="link"
        className="mt-6 text-orange-300 hover:underline"
      >
        Resend OTP
      </Button> */}

      <Button
        onClick={() => onComplete(otpValue)}
        disabled={isPending || otpValue.length < 6}
        className="mt-4 bg-orange-300 hover:bg-orange-400"
      >
        {isPending ? "Verifying…" : "Verify"}
      </Button>
    </div>
  );
}
