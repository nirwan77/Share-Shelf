"use client";

import { useSearchParams } from "next/navigation";
import { useSearchUsers } from "../profile/action";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

export default function UserSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";
  const { data: users, isLoading } = useSearchUsers(query);

  return (
    <div className="pt-[100px] pb-20 container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">
          {query ? `Search Results for "${query}"` : "Search Users"}
        </h1>
        {users && users.length > 0 && (
          <span className="text-gray-400 bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full text-sm font-medium">
            {users.length} {users.length === 1 ? "user" : "users"} found
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
              className="bg-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border border-gray-800 flex flex-col items-center text-center group"
            >
              <div className="relative w-28 h-28 mb-6 rounded-full overflow-hidden bg-gray-800 border-4 border-gray-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <User className="w-14 h-14 text-gray-700" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors mb-2">
                {user.name}
              </h3>
              <div className="flex gap-6 mt-1">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">{user._count.followers}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Followers</span>
                </div>
                <div className="w-px h-8 bg-gray-800 self-center"></div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">{user._count.following}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Following</span>
                </div>
              </div>
              <div className="mt-6 w-full py-2 bg-gray-800 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors text-sm font-bold text-gray-400 group-hover:text-white">
                View Profile
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-24 bg-gray-900 rounded-[40px] border border-gray-800 shadow-sm">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No users found</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            We couldn't find any users matching <span className="font-semibold text-white">"{query}"</span>.
            Try checking for typos or searching for a different name.
          </p>
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-900 rounded-[40px] border border-gray-800 shadow-sm">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Find someone new</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Use the search bar in the header to find other readers and authors on Share Shelf.
          </p>
        </div>
      )}
    </div>
  );
}
