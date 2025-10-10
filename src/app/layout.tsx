import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import Header from "@/components/Header"
const inter = Inter({ subsets: ["latin"] });

// Change image shown in browser tab to logo.jpeg
export const metadata: Metadata = {
  title: "Quick 1888 Zaterdag 2 teampagina",
  description: "Bevat features voor teamstatistieken, boetes, corvee planning en meer",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <Header/>
          <main className="pt-20 ">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
