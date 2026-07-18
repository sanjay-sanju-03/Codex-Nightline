import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Work History — Project Shram",
  description: "Speak a work note. Review it. Keep it. A voice-first work record for daily-wage workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
