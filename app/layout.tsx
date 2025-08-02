import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Passion_One } from "next/font/google";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const passionOne = Passion_One({
  variable: "--font-passion-one",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

import "./globals.css";

export const metadata: Metadata = {
  title: "University Of Perpetual Help System DALTA - Las Piñas",
  description:
    "This system provides UPSHD Las Piñas staff and administrators with a streamlined platform to track the status of internal document requests, helping ensure faster processing and better coordination across departments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${passionOne.variable}`}
    >
      <body className="antialiased" 
      id="__next">
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
