"use client";

import Input from "@/app/Components/Input";
import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "./data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const { mutateAsync, isPending, isError, error } = useSignUp();

  const handleClick = () => {
    mutateAsync(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          toast("Account created successfully");
          router.push("/login");
        },
        onError: (err) => {
          toast(err.response.data.message);
        },
      }
    );
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
          <p className="text-gray-600 mb-12">
            Create an account to discover, share, and connect with the
            community.
          </p>

          <div className="flex flex-col space-y-4">
            <Input
              name="Name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              name="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              name="Email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleClick}
              className="bg-orange-300 text-white py-2 rounded-sm hover:opacity-90 transition"
            >
              Sign up
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        © 2025 Share Shelf
      </footer>
    </div>
  );
}
