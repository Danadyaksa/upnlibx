import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UpnLibX — UPN \"Veteran\" Yogyakarta Digital Library Fulltext Extractor",
  description:
    "Ekstrak dan satukan skripsi, tesis, dan tugas akhir dari repositori digital UPN 'Veteran' Yogyakarta menjadi satu dokumen PDF A4 lengkap berkualitas tinggi.",
  keywords: [
    "UpnLibX",
    "UPN Veteran Yogyakarta",
    "OPAC Digital Library",
    "Skripsi UPN",
    "PDF Extractor",
    "UPN PDF Generator",
  ],
  authors: [{ name: "UpnLibX Team" }],
  openGraph: {
    title: "UpnLibX — UPN Digital Library Fulltext Extractor",
    description:
      "Unduh skripsi utuh dari OPAC Digital Library UPN Veteran Yogyakarta dalam format PDF A4 secara instan.",
    type: "website",
  },
  icons: {
    icon: "/logo-mark.png",
    shortcut: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#090d0e] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
