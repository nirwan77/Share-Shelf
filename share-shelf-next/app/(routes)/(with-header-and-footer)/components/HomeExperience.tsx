"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import { useGetFeatured, useGetPopular, type BookChoice } from "../action";

const fallbackBooks: BookChoice[] = [
  {
    id: "fallback-1",
    name: "The Reader's Exchange",
    author: "Share Shelf",
    image: "/share-shelf-home-image.png",
    bookGenres: [{ genre: { name: "Community" } }],
  },
  {
    id: "fallback-2",
    name: "Collected Pages",
    author: "Share Shelf",
    image: "/buy.jpg",
    bookGenres: [{ genre: { name: "Marketplace" } }],
  },
  {
    id: "fallback-3",
    name: "Book Circle",
    author: "Share Shelf",
    image: "/discuss.jpg",
    bookGenres: [{ genre: { name: "Discussion" } }],
  },
];

const pathways = [
  {
    title: "Find the copy that fits",
    description:
      "Browse community listings, compare condition, and move from discovery to ownership without leaving the shelf.",
    image: "/buy.jpg",
    href: "/explore",
  },
  {
    title: "Trade what you have read",
    description:
      "Turn finished books into new finds through simple exchanges with nearby readers.",
    image: "/exchange.jpg",
    href: "/explore",
  },
  {
    title: "Join the conversation",
    description:
      "Discuss chapters, ask for recommendations, and build a reading history around the books you care about.",
    image: "/discuss.jpg",
    href: "/discuss",
  },
];

export function HomeExperience() {
  const router = useRouter();
  const { token } = useAuth();
  const { data: featured } = useGetFeatured();
  const { data: popular } = useGetPopular();

  const heroBooks = (
    featured?.length ? featured : popular?.length ? popular : fallbackBooks
  ).slice(0, 3);
  const galleryBooks = (
    popular?.length ? popular : featured?.length ? featured : fallbackBooks
  ).slice(0, 6);

  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="relative min-h-[760px] pt-16 lg:min-h-dvh">
        <Image
          src="/heroImage.jpg"
          alt="Readers browsing books"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_42%,rgba(0,0,0,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="container relative z-10 mx-auto flex min-h-[720px] items-end pb-12 pt-28 lg:min-h-dvh lg:pb-20">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[#ff7a00]" />A living
                marketplace for readers
              </div>
              <h1 className="max-w-4xl text-[4rem] font-bold leading-[0.9] tracking-normal text-white sm:text-[5.4rem] lg:text-[7.4rem]">
                Share Shelf
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-200 sm:text-xl">
                Discover books through people, not algorithms. Buy, exchange,
                review, and discuss with a community built around what is
                actually being read.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 rounded-full px-7 text-base font-bold"
                  onClick={() => router.push(token ? "/explore" : "/sign-up")}
                >
                  {token ? "Explore books" : "Start your shelf"}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/30 px-7 text-base font-bold"
                  onClick={() => router.push("/discuss")}
                >
                  Browse discussions
                </Button>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-xl lg:block">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Featured shelves
                </p>
                <span className="text-xs text-zinc-400">Live picks</span>
              </div>
              <div className="space-y-3">
                {heroBooks.map((book) => (
                  <BookPreview key={book.id} book={book} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="container mx-auto grid gap-4 py-5 sm:grid-cols-3">
          <Stat value="3 ways" label="Buy, exchange, discuss" />
          <Stat value="Reader-led" label="Listings from the community" />
          <Stat value="Always moving" label="Fresh shelves and conversations" />
        </div>
      </section>

      <section className="container mx-auto py-20 lg:py-28">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div>
            <span className="tag">Explore the system</span>
            <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              A book network that feels human.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-zinc-400">
            Share Shelf brings the useful parts of a marketplace, reading log,
            and community forum into one focused experience.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pathways.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111114] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff7a00]/45"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7a00]/12 text-[#ff7a00]">
                  {item.href === "/discuss" ? (
                    <MessageCircle className="h-5 w-5" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f4f0e8] py-20 text-black lg:py-28">
        <div className="container mx-auto">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f3f00]">
                Popular now
              </span>
              <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                Books moving through the community.
              </h2>
            </div>
            <Button
              onClick={() => router.push("/explore")}
              className="w-fit rounded-full"
            >
              Browse all
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {galleryBooks.map((book, index) => (
              <Link
                key={book.id}
                href={
                  book.id.startsWith("fallback")
                    ? "/explore"
                    : `/book-detail/${book.id}`
                }
                className={`group block overflow-hidden rounded-2xl bg-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${
                  index === 0 ? "lg:col-span-2 lg:row-span-2" : "lg:col-span-1"
                }`}
              >
                <div
                  className={`relative ${index === 0 ? "aspect-[4/5]" : "aspect-[3/4]"}`}
                >
                  <Image
                    src={book.image}
                    alt={book.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 18vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ffb36d]">
                      {book.bookGenres[0]?.genre.name ?? "Book"}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-semibold">
                      {book.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function BookPreview({ book }: { book: BookChoice }) {
  return (
    <Link
      href={
        book.id.startsWith("fallback") ? "/explore" : `/book-detail/${book.id}`
      }
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 transition-colors hover:border-[#ff7a00]/45 hover:bg-white/[0.08]"
    >
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={book.image}
          alt={book.name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{book.name}</p>
        <p className="mt-1 truncate text-xs text-zinc-400">{book.author}</p>
      </div>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-zinc-500" />
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}
