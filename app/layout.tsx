import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "RecAI - Recruitment Intelligence Terminal",
  description: "AI-powered recruitment platform for consistent CV evaluation and candidate matching. Terminal-style interface for professional recruiters.",
  keywords: ["recruitment", "AI", "candidates", "hiring", "ATS", "talent acquisition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0a0d14" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-ui antialiased`}>
        {children}
      </body>
    </html>
  );
}
