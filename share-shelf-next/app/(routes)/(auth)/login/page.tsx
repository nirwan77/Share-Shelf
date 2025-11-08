"use client";

import Input from "@/app/Components/Input";
import Link from "next/link";
import { useState } from "react";
import { useLogin } from "./data/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const { mutateAsync, isPending, isError, error } = useLogin();

  const handleClick = () => {
    mutateAsync(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          toast("Successfully logged in. Enjoy your session!");
          router.push("/");
        },
        onError: (err) => {
          toast(err.response.data.message);
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-center items-center py-6">
        <div className="text-2xl font-semibold italic">Logo</div>
      </header>

      <main className="grow flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm lg:max-w-md border rounded-lg border-gray-300 p-12 text-center">
          <h1 className="heading-3 font-semibold mb-2">Log In</h1>
          <p className="text-gray-600 mb-6">
            Access your account to continue sharing and discovering.
          </p>

          <div className="flex flex-col space-y-4">
            <Input
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleClick}
              className="bg-orange-300 text-white py-2 rounded-sm hover:opacity-90 transition"
            >
              Log in
            </button>
          </div>

          {/* <div className="mt-6 text-sm">
            <Link
              href="/forgot-password"
              className="text-orange-300 hover:underline block"
            >
              Forgot your password?
            </Link>
          </div> */}

          <div className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-orange-300 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
