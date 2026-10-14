import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "தமிழ் அரசு கடிதம்",
  description: "Tamil Government Letter Tool"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body>{children}</body>
    </html>
  );
}
