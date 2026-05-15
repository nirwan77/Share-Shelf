"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Github,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Twitter,
} from "lucide-react";

const platformLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/discuss", label: "Discuss" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-[#050505]">
      <div className="border-b border-white/10">
        <div className="container mx-auto grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
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

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <FooterFeature icon={BookOpen} title="Marketplace" text="Find copies from real readers." />
              <FooterFeature icon={MessageCircle} title="Community" text="Discuss books beyond the listing." />
            </div>
          </div>

          <nav className="grid gap-8 sm:grid-cols-2 lg:col-span-4" aria-label="Footer navigation">
            <FooterLinkGroup title="Platform" links={platformLinks} />
            <FooterLinkGroup title="Legal" links={legalLinks} />
          </nav>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-white">
              <ShieldCheck className="h-5 w-5 text-[#ff9a3d]" />
              Reader-first exchanges
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Review listings, message carefully, and use Share Shelf to keep book exchanges clear and accountable.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <SocialLink label="Twitter" icon={Twitter} />
              <SocialLink label="GitHub" icon={Github} />
              <SocialLink label="Instagram" icon={Instagram} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative min-h-[260px] overflow-hidden border-b border-white/10 sm:min-h-[320px]">
        <Image
          src="/share-shelf-home-image.png"
          alt="Share Shelf community"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/15" />
        <div className="container relative mx-auto flex min-h-[260px] items-end py-8 sm:min-h-[320px] sm:py-10">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-[#ff9a3d]/50 hover:text-[#ffb36d]"
          >
            Start browsing
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto flex flex-col gap-4 py-6 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {currentYear} Share Shelf</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#ffb36d]">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-[#ffb36d]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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
    <div className="border-l border-white/10 pl-4">
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
