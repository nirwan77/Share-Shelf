"use client";

import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  return (
    <div className="mt-32 container mx-auto">
      <h1>Profile page</h1>
    </div>
  );
}
