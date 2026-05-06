"use client";

import Input from "@/app/Components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useForgotPassword } from "./data";

const forgotPasswordSchema = z.object({
  email: z.email(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    await mutateAsync(data, {
      onSuccess: (response) => {
        toast.success(response.message);
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Could not send reset code");
      },
    });
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
          <h1 className="heading-3 mb-2 font-semibold">Forgot Password</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">
            Enter your account email and we will send a reset code.
          </p>

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("email")}
              placeholder="Email"
              error={errors.email?.message}
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#ff7a00] py-3 font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-[#ff922f] hover:shadow-[0_14px_36px_rgba(255,122,0,0.25)] disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <div className="mt-5 text-sm text-zinc-500">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
