import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WithToasts } from "../components/layout/with-toasts";

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
  authors: [{ name: "Podcast Manager Team" }],
  creator: "Podcast Manager",
  publisher: "Podcast Manager",
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
        url: "/podcast-manager-meta.png",
        width: 1200,
        height: 630,
        alt: "Podcast Manager - Plateforme de gestion automatisé de podcasts et génération de contenu Marketing",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Manager - Gestion et traitement automatisé de podcasts",
    description: "Transformez vos podcasts en contenu multi-plateforme avec l'intelligence artificielle.",
    images: ["/podcast-manager-meta.png"],
    creator: "@podcastmanager",
    site: "@podcastmanager",
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
  other: {
    "msapplication-config": "/browserconfig.xml",
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
        {/* Favicon standard */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Favicons PNG pour différents navigateurs */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-TileImage" content="/android-chrome-192x192.png" />
        
        {/* Preconnect pour améliorer les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <div className="relative flex min-h-screen flex-col">
          <WithToasts>
            {children}
          </WithToasts>
        </div>
      </body>
    </html>
  );
}
