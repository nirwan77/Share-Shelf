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
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-semibold italic">Logo</div>
        <div className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-300 hover:underline">
            Log In
          </Link>
        </div>
      </header>

      <main className="grow flex flex-col items-center justify-center text-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="heading-2 font-bold mb-6">Sign Up</h1>
          <p className="text-gray-400 mb-12">
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
              className="bg-orange-300 text-white py-2 rounded-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {isPending ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
