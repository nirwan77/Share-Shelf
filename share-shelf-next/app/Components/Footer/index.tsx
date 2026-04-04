"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Twitter,
  Instagram,
  Mail,
  Heart,
  ExternalLink
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-zinc-800 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 px-4">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Share Shelf"
                width={180}
                height={45}
                unoptimized
                className="h-10 w-auto object-contain bg-transparent"
              />
            </div>
            <p className="text-zinc-400 text-base leading-relaxed max-w-md">
              Empowering readers to share, discover, and discuss their favorite books in a vibrant global community. Join us in building the largest shelf of shared stories.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-zinc-500 hover:text-[#e8630a] hover:scale-110 transition-all p-2.5 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white hover:scale-110 transition-all p-2.5 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                <Github size={20} />
              </a>
              <a href="#" className="text-zinc-500 hover:text-pink-500 hover:scale-110 transition-all p-2.5 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em]">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-[#e8630a] text-sm transition-colors font-medium flex items-center gap-2">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-zinc-400 hover:text-[#e8630a] text-sm transition-colors font-medium flex items-center gap-2">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/discuss" className="text-zinc-400 hover:text-[#e8630a] text-sm transition-colors font-medium flex items-center gap-2">
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-zinc-400 hover:text-[#e8630a] text-sm transition-colors font-medium flex items-center gap-2">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
              © {currentYear} Share Shelf
            </p>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full"></span>
            <Link href="/terms" className="text-zinc-600 hover:text-[#e8630a] text-xs font-bold uppercase tracking-wider transition-colors">
              Terms
            </Link>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full"></span>
            <Link href="/privacy" className="text-zinc-600 hover:text-[#e8630a] text-xs font-bold uppercase tracking-wider transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-zinc-500 text-xs font-medium flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/30">
            Made with <Heart size={12} className="text-[#e8630a] fill-[#e8630a]" /> for book lovers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
