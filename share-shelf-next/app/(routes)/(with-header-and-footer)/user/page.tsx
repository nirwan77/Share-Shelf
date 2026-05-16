"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchUsers } from "../profile/action";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

function UserSearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";
  const { data: users, isLoading } = useSearchUsers(query);

  return (
    <div className="container mx-auto pt-32 pb-20">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="tag">Reader search</span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
            {query ? `Search results` : "Search readers"}
          </h1>
          {query && (
            <p className="mt-3 text-zinc-400">
              Showing people matching <span className="font-semibold text-white">&quot;{query}&quot;</span>
            </p>
          )}
        </div>
        {users && users.length > 0 && (
          <span className="w-fit rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-zinc-300">
            {users.length} {users.length === 1 ? "reader" : "readers"} found
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : users && users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/user/${user.id}`}
              className="premium-panel group flex flex-col items-center p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9a3d]/45"
            >
              <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-full border border-white/15 bg-white/[0.06] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
                    <User className="h-14 w-14 text-zinc-700" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#ffb36d]">
                {user.name}
              </h3>
              <div className="flex gap-6 mt-1">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">{user._count.followers}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Followers</span>
                </div>
                <div className="h-8 w-px self-center bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">{user._count.following}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Following</span>
                </div>
              </div>
              <div className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-sm font-bold text-zinc-300 transition-colors group-hover:border-[#ff9a3d]/45 group-hover:bg-[#ff7a00] group-hover:text-black">
                View Profile
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="premium-empty">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.05]">
            <User className="h-10 w-10 text-zinc-700" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No users found</h2>
          <p className="text-zinc-400 max-w-sm mx-auto">
            We couldn&apos;t find any users matching <span className="font-semibold text-white">&quot;{query}&quot;</span>.
            Try checking for typos or searching for a different name.
          </p>
        </div>
      ) : (
        <div className="premium-empty">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.05]">
            <User className="h-10 w-10 text-zinc-700" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Find someone new</h2>
          <p className="text-zinc-400 max-w-sm mx-auto">
            Use the search bar in the header to find other readers and authors on Share Shelf.
          </p>
        </div>
      )}
    </div>
  );
}

export default function UserSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UserSearchContent />
    </Suspense>
  );
}
