import prisma from "@/lib/prisma";

interface JsonLdProps {
    artist?: {
        name: string;
        bio: string;
        heroImage?: string | null;
        facebookUrl?: string | null;
        instagramUrl?: string | null;
        youtubeUrl?: string | null;
        spotifyUrl?: string | null;
        twitterUrl?: string | null;
    } | null;
}

export async function JsonLd({ artist }: JsonLdProps) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://begumatak.com";

    // MusicGroup Schema
    const musicGroupSchema = {
        "@context": "https://schema.org",
        "@type": "PerformingGroup",
        name: artist?.name || "Begüm Atak",
        description: artist?.bio || "Tiyatro sahnesinden ekrana uzanan bir yolculuk.",
        url: baseUrl,
        image: artist?.heroImage || `${baseUrl}/og-image.jpg`,
        genre: ["Tiyatro", "Dizi", "Sinema"],
        sameAs: [
            artist?.facebookUrl,
            artist?.instagramUrl,
            artist?.youtubeUrl,
            artist?.spotifyUrl,
            artist?.twitterUrl,
        ].filter(Boolean),
    };

    // Person Schema
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: artist?.name || "Begüm Atak",
        description: artist?.bio || "Tiyatro ve dizi oyuncusu",
        url: baseUrl,
        image: artist?.heroImage || `${baseUrl}/og-image.jpg`,
        jobTitle: "Oyuncu",
        sameAs: [
            artist?.facebookUrl,
            artist?.instagramUrl,
            artist?.youtubeUrl,
            artist?.spotifyUrl,
            artist?.twitterUrl,
        ].filter(Boolean),
    };

    // Website Schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Begüm Atak - Resmi Web Sitesi",
        url: baseUrl,
        description: "Begüm Atak'ın resmi web sitesi - Oyunlar, diziler ve etkinlikler",
        publisher: {
            "@type": "Person",
            name: artist?.name || "Begüm Atak",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    );
}
