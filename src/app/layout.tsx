import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BrainStake | Trivia-to-Earn",
  description: "Play trivia, stake cUSD, win the pot!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} bg-black text-slate-50 min-h-[100dvh] flex justify-center overflow-hidden`}>
        <Providers>
          <div className="w-full max-w-[375px] h-[100dvh] bg-[#0b0b0f] ring-1 ring-white/5 shadow-2xl relative overflow-x-hidden overflow-y-auto flex flex-col pt-safe">
            {children}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
