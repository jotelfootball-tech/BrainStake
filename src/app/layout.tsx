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
  icons: {
    icon: "/brainstake-tech-logo.png",
    shortcut: "/brainstake-tech-logo.png",
    apple: "/brainstake-tech-logo.png",
  },
  other: {
    "talentapp:project_verification": "1be28e691a2074e725ba9ac9987b4e1b1a8a4495acb44314e68787508f69a137d95c082f6aced96c5b3563d42af664922cee158bdec0756d2fc0bed191856195",
  },
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
