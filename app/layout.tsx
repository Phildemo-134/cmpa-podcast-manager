import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Podcast Manager - Gestion et traitement automatisé de podcasts",
    template: "%s | Podcast Manager",
  },
  description: "Transformez vos podcasts en contenu multi-plateforme avec l'intelligence artificielle. Transcription automatique, génération de descriptions et publication sur les réseaux sociaux.",
  keywords: [
    "podcast",
    "transcription",
    "intelligence artificielle",
    "gestion de contenu",
    "réseaux sociaux",
    "blog",
    "YouTube",
    "Spotify",
    "LinkedIn",
    "Twitter",
  ],
  authors: [{ name: "CMPA Team" }],
  creator: "Podcast Manager",
  publisher: "CMPA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cmpa-podcast-manager.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://cmpa-podcast-manager.com",
    title: "Podcast Manager - Gestion et traitement automatisé de podcasts",
    description: "Transformez vos podcasts en contenu multi-plateforme avec l'intelligence artificielle.",
    siteName: "Podcast Manager",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Podcast Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Manager - Gestion et traitement automatisé de podcasts",
    description: "Transformez vos podcasts en contenu multi-plateforme avec l'intelligence artificielle.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
