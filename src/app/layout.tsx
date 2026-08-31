import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
const inter = Inter({ subsets: ["latin"] });

// Change image shown in browser tab to logo.jpeg
export const metadata: Metadata = {
  title: "Quick 1888 Zaterdag 2 teampagina",
  description: "Bevat features voor teamstatistieken, boetes, corvee planning en meer",
  icons: {
    icon: "/logo.jpeg",
  },
};

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <Sidebar />
          <div className="md:ml-64 min-h-screen flex flex-col min-w-0">
            <Header />
            <main className="flex-1 pt-14 md:pt-0 min-w-0">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
