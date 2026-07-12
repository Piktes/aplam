import type { Metadata } from "next";
import Script from "next/script";
import { Cinzel, Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { VersionCheck } from "@/components/version-check";
import { Toaster } from "sonner";
import "./globals.css";

// Sharp/Runic font for brand name and headings
// preload: false — public sayfalar (version2) bu fontları kullanmıyor;
// preload edilince konsolda "kullanılmadı" uyarısı üretiyorlardı.
// Kullanıldıkları yerde (admin) talep anında yüklenirler.
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

// Elegant serif for secondary headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

// Clean sans-serif for body
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

import { headers } from "next/headers";

const baseMetadata: Metadata = {
  title: "Begüm Atak | Resmi Web Sitesi",
  description: "Tiyatro ve dizi oyuncusu Begüm Atak'ın resmi web sitesi. Biyografi, oyunlar, diziler, etkinlikler ve iletişim.",
  keywords: ["Begüm Atak", "Oyuncu", "Tiyatro", "Dizi", "İnci Taneleri", "Bizim Evin Halleri", "Adı Mutluluk", "Etkinlikler", "Oyunlar"],
  authors: [{ name: "Begüm Atak" }],
  creator: "Begüm Atak",
  publisher: "Begüm Atak",
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
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
};

export async function generateMetadata(): Promise<Metadata> {
  // HARDCODED fallback - LiteSpeed sends duplicate headers causing URL parse errors
  const FALLBACK_URL = "https://begumatak.com";

  let metadataBase: URL;

  try {
    const headersList = headers();
    // Safe header parsing for reverse proxies (handles "host1, host1" duplicates)
    const rawHost = headersList.get("host") || "";
    const rawProto = headersList.get("x-forwarded-proto") || "";

    const host = rawHost.split(',')[0].trim() || "begumatak.com";
    const proto = rawProto.split(',')[0].trim() || "https";
    const baseUrl = `${proto}://${host}`;

    metadataBase = new URL(baseUrl);
  } catch (e) {
    // If anything fails, use hardcoded fallback
    console.error("[Metadata] URL construction failed, using fallback:", e);
    metadataBase = new URL(FALLBACK_URL);
  }

  return {
    ...baseMetadata,
    metadataBase,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Begüm Atak | Resmi Web Sitesi",
      description: "Tiyatro ve dizi oyuncusu Begüm Atak'ın resmi web sitesi. Biyografi, oyunlar, diziler, etkinlikler ve iletişim.",
      url: "/",
      siteName: "Begüm Atak",
      type: "website",
      locale: "tr_TR",
      images: [
        {
          // v3: yeni BA monogram logolu paylaşım görseli
          // (yeni dosya adı = WhatsApp/FB önbelleği taze görseli çeksin diye)
          url: "/og-image-v3.png",
          width: 1200,
          height: 630,
          alt: "Begüm Atak - Resmi Web Sitesi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Begüm Atak | Resmi Web Sitesi",
      description: "Tiyatro ve dizi oyuncusu Begüm Atak'ın resmi web sitesi. Biyografi, oyunlar, diziler, etkinlikler ve iletişim.",
      images: ["/og-image-v3.png"],
    },
  };
}

// Google Analytics 4 ölçüm kimliği (analytics.google.com'daki mülk)
const GA_MEASUREMENT_ID = "G-NERHNRDWMT";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${cinzel.variable} ${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <VersionCheck />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthProvider>
        {/* Google Analytics — yalnız production'da yüklenir (lokal geliştirme
            trafiği istatistikleri kirletmesin) */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
