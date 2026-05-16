"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Github, Instagram, MessageCircle, Twitter } from "lucide-react";

const platformLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/discuss", label: "Discuss" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-black">
      <div className="container mx-auto py-12 sm:py-16">
        <div className="premium-panel overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-10">
              <Image
                src="/logo.png"
                alt="Share Shelf"
                width={190}
                height={48}
                unoptimized
                className="h-10 w-auto object-contain"
              />
              <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400">
                A community shelf for buying, trading, reviewing, and discussing books with people who care about what they read.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <FooterFeature icon={BookOpen} title="Marketplace" text="Find copies from real readers." />
                <FooterFeature icon={MessageCircle} title="Community" text="Discuss books beyond the listing." />
              </div>
            </div>

            <div className="relative min-h-[320px] border-t border-white/10 lg:border-l lg:border-t-0">
              <Image
                src="/share-shelf-home-image.png"
                alt="Share Shelf community"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-[#ff9a3d]/50 hover:text-[#ffb36d]"
                >
                  Start browsing
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-white/10 p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {platformLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-[#ff9a3d]/45 hover:text-[#ffb36d]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <SocialLink label="Twitter" icon={Twitter} />
              <SocialLink label="GitHub" icon={Github} />
              <SocialLink label="Instagram" icon={Instagram} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Share Shelf</p>
          <p>Built for book lovers</p>
        </div>
      </div>
    </footer>
  );
};

function FooterFeature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="mb-3 h-5 w-5 text-[#ff9a3d]" />
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}

function SocialLink({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Twitter;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition-all hover:-translate-y-0.5 hover:border-[#ff9a3d]/45 hover:text-[#ffb36d]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
