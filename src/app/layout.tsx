import type { Metadata } from "next";
import { Roboto, Syne } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const syne = Syne({
  weight: ["700", "800"],
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://collab.plynk.in"),
  title: "Collab | Realtime Collaborative Whiteboard",
  description: "Collaborate visually. Create together. Work in real time. Collab is a premium, real-time visual collaboration workspace for teams.",
  keywords: ["Whiteboard", "Collaboration", "Visual Workspace", "Realtime", "SaaS", "Design Tool"],
  authors: [{ name: "Collab Team" }],
  openGraph: {
    title: "Collab | Realtime Collaborative Whiteboard",
    description: "Collaborate visually. Create together. Work in real time. Collab is a premium, real-time visual collaboration workspace for teams.",
    url: "https://collab.plynk.in",
    siteName: "Collab",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Collab Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Collab | Realtime Collaborative Whiteboard",
    description: "Collaborate visually. Create together. Work in real time. Collab is a premium, real-time visual collaboration workspace for teams.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${syne.variable}`}>
      <body className="antialiased bg-white text-black min-h-screen selection:bg-black selection:text-white">
        <Toaster richColors position="bottom-right" theme="light" />
        {children}
      </body>
    </html>
  );
}
