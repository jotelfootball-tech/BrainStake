"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, PlayCircle, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Train", href: "/train", icon: Dumbbell },
  { name: "Play", href: "/bot", icon: PlayCircle },
  { name: "Leaders", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Bottom nav is now explicitly visible on all pages, including the game view.

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] z-50 bg-[#0b0b0f]/90 backdrop-blur-xl border-t border-slate-800/60 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-12"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-[#35D07F]/20 text-[#35D07F]"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "animate-pulse")} />
              </div>
              
              <span
                className={cn(
                  "text-[10px] mt-1 font-semibold transition-colors duration-300",
                  isActive ? "text-[#35D07F]" : "text-zinc-500"
                )}
              >
                {item.name}
              </span>

              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-3 w-8 h-1 bg-[#35D07F] rounded-full shadow-[0_0_8px_#35D07F]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
