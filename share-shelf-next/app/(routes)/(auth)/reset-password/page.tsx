"use client";

import Input from "@/app/Components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useResetPassword } from "./data";

const resetPasswordSchema = z
  .object({
    email: z.email(),
    code: z.string().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    await mutateAsync(
      {
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          router.push("/login");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Could not reset password");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-center px-4 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Share Shelf
        </Link>
      </header>

      <main className="flex grow flex-col items-center justify-center px-4 py-10">
        <div className="app-card w-full max-w-sm p-7 text-center sm:p-10 lg:max-w-md">
          <h1 className="heading-3 mb-2 font-semibold">Reset Password</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">
            Enter the code from your email and choose a new password.
          </p>

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("email")}
              placeholder="Email"
              error={errors.email?.message}
            />
            <Input
              {...register("code")}
              placeholder="Reset code"
              error={errors.code?.message}
            />
            <Input
              {...register("newPassword")}
              type="password"
              placeholder="New password"
              error={errors.newPassword?.message}
            />
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#ff7a00] py-3 font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-[#ff922f] hover:shadow-[0_14px_36px_rgba(255,122,0,0.25)] disabled:opacity-50"
            >
              {isPending ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
