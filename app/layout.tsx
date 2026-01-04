import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarbonMarket - Offset Your Carbon Footprint",
  description:
    "Buy and sell verified carbon credits to offset your emissions and support sustainable projects worldwide.",
  keywords: ["carbon credits", "carbon offset", "sustainability", "climate action", "environmental"],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
