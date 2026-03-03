import "./globals.css";
import type { ReactNode } from "react";
import { Kalam, Patrick_Hand } from "next/font/google";

const heading = Kalam({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Kanban Web",
  description: "Hand-drawn kanban with Firestore realtime sync",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
