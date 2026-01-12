"use client";

import Input from "@/app/Components/Input";
import Link from "next/link";
import { useLogin } from "./data/queries";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "@/contexts";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLogin();
  const { setAuthData } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
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
        onError: (err: any) => {
          toast(err.response?.data?.message || "Something went wrong");
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-center items-center py-6">
        <div className="text-2xl font-semibold italic">Logo</div>
      </header>

      <main className="grow flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm lg:max-w-md border rounded-lg border-gray-300 p-12 text-center">
          <h1 className="heading-3 font-semibold mb-2">Log In</h1>
          <p className="text-gray-400 mb-6">
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
              className="bg-orange-300 text-white py-2 rounded-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {isPending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-orange-300 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
