import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntelStack RecAI - Recruitment Intelligence Platform",
  description: "AI-powered recruitment platform for consistent CV evaluation and candidate matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
