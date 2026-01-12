"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import "../globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  return <>{children}</>;
}
