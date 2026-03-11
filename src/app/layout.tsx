import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SeatFlow Studio | Professional Seat Map Editor",
  description:
    "Next-generation SVG Seat Map Editor for professional venues and events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased text-slate-900 bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
