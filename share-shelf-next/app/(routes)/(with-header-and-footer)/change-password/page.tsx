"use client";

import Input from "@/app/Components/Input";
import { useAuth } from "@/contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useChangePassword } from "../profile/action";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { mutateAsync, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/login");
    }
  }, [token, router]);

  const onSubmit = async (data: ChangePasswordForm) => {
    await mutateAsync(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Password changed successfully");
          reset();
          router.push("/profile");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Could not change password");
        },
      },
    );
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-28">
      <div className="app-card w-full max-w-md p-7 text-center sm:p-10">
        <h1 className="heading-3 mb-2 font-semibold">Change Password</h1>
        <p className="mb-8 text-sm leading-6 text-zinc-400">
          Update the password for your Share Shelf account.
        </p>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("currentPassword")}
            type="password"
            placeholder="Current password"
            error={errors.currentPassword?.message}
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
            {isPending ? "Changing..." : "Change password"}
          </button>
        </form>

        <Link
          href="/profile"
          className="mt-5 inline-block text-sm font-semibold text-[#ff7a00] hover:text-[#ffb36d]"
        >
          Back to profile
        </Link>
      </div>
    </div>
  );
}
