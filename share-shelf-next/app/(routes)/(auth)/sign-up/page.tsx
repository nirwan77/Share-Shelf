"use client";

import Input from "@/app/Components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "./data";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    await mutateAsync(data, {
      onSuccess: () => {
        toast("Account created successfully");
        router.push(`/verify?email=${data.email}`);
      },
      onError: (err: any) => {
        toast(err.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-8">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Share Shelf
        </Link>
        <div className="text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]">
            Log In
          </Link>
        </div>
      </header>

      <main className="flex grow flex-col items-center justify-center px-4 py-10 text-center">
        <div className="app-card w-full max-w-sm p-7 sm:p-10">
          <h1 className="heading-3 mb-4 font-bold">Sign Up</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">
            Create an account to discover, share, and connect with the
            community.
          </p>

          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("name")}
              placeholder="Name"
              error={errors.name?.message}
            />
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
              {isPending ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-sm text-zinc-500">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
