"use client";

import Input from "@/app/Components/Input";
import Link from "next/link";
import { CustomAxiosError, useLogin, useSubmitBanAppeal } from "./data/queries";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const appealSchema = z.object({
  message: z.string().min(10, "Appeal must be at least 10 characters").max(1000),
});

type LoginForm = z.infer<typeof loginSchema>;
type AppealForm = z.infer<typeof appealSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLogin();
  const submitBanAppeal = useSubmitBanAppeal();
  const { setAuthData } = useContext(AuthContext);
  const [bannedEmail, setBannedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerAppeal,
    handleSubmit: handleAppealSubmit,
    formState: { errors: appealErrors },
    reset: resetAppeal,
  } = useForm<AppealForm>({
    resolver: zodResolver(appealSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await mutateAsync(data, {
        onSuccess: (response) => {
          setAuthData({
            accessToken: response.access_token,
          });
          toast("Successfully logged in. Enjoy your session!");
          router.push("/");
        },
        onError: (err: CustomAxiosError) => {
          const message = err.response?.data?.message || "Something went wrong";
          if (message === "Account has been banned") {
            setBannedEmail(data.email);
          }
          toast(message);
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onAppealSubmit = async (data: AppealForm) => {
    if (!bannedEmail) return;

    try {
      await submitBanAppeal.mutateAsync({
        email: bannedEmail,
        message: data.message,
      });
      toast.success("Appeal submitted for review");
      resetAppeal();
    } catch (err) {
      const error = err as CustomAxiosError;
      toast.error(error.response?.data?.message || "Failed to submit appeal");
    }
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
          <h1 className="heading-3 font-semibold mb-2">Log In</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">
            Access your account to continue sharing and discovering.
          </p>

          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("email")}
              placeholder="Email"
              error={errors.email?.message}
            />
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              error={errors.password?.message}
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#ff7a00] py-3 font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-[#ff922f] hover:shadow-[0_14px_36px_rgba(255,122,0,0.25)] disabled:opacity-50"
            >
              {isPending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-5 text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]">
              Sign Up
            </Link>
          </div>
        </div>

        {bannedEmail && (
          <div className="app-card mt-5 w-full max-w-sm p-7 text-left sm:p-8 lg:max-w-md">
            <h2 className="mb-2 text-xl font-semibold">Appeal ban</h2>
            <p className="mb-5 text-sm leading-6 text-zinc-400">
              Your account is banned. Submit an appeal and an admin can review it.
            </p>
            <form className="space-y-4" onSubmit={handleAppealSubmit(onAppealSubmit)}>
              <div>
                <textarea
                  {...registerAppeal("message")}
                  rows={5}
                  placeholder="Explain why your account should be unbanned"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-[#ff7a00]/70 focus:bg-white/[0.06] focus:ring-3 focus:ring-[#ff7a00]/20"
                />
                {appealErrors.message && (
                  <p className="mt-2 text-left text-xs text-red-400">
                    {appealErrors.message.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitBanAppeal.isPending}
                className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:border-[#ff7a00]/60 hover:bg-[#ff7a00]/10 hover:text-[#ffb36d] disabled:opacity-50"
              >
                {submitBanAppeal.isPending ? "Submitting..." : "Submit appeal"}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-sm text-zinc-500">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
