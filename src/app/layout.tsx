import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import Header from "@/components/Header"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Football Team Statistics",
  description: "Track your team's goals and assists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <hr className="border-rose-500" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
