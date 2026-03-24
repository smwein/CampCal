import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampCalendar — Plan Your Kids' Summer",
  description:
    "Plan your kids' entire summer in one place. Add camps, spot gaps, and see where every kid is supposed to be — week by week.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${geist.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
