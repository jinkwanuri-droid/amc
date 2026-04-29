import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMC 회의실 예약",
  description: "AMC Meeting Room Reservation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
