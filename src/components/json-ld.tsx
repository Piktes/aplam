// Ana sayfa için schema.org yapılandırılmış verisi (JSON-LD).
// Google'ın Begüm Atak'ı "kişi/oyuncu" olarak tanıması ve arama
// sonuçlarında resmi siteyi öne çıkarması için Person + WebSite şeması.

interface JsonLdProps {
    name: string;
    description: string;
    /** Sosyal medya profil URL'leri (sameAs) — DB'deki görünür linklerden */
    sameAs: string[];
    image?: string | null;
}

export function JsonLd({ name, description, sameAs, image }: JsonLdProps) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://begumatak.com";

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        description,
        url: baseUrl,
        image: image || `${baseUrl}/og-image-v3.png`,
        jobTitle: "Oyuncu",
        nationality: { "@type": "Country", name: "Türkiye" },
        sameAs,
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: `${name} - Resmi Web Sitesi`,
        url: baseUrl,
        inLanguage: "tr-TR",
        description,
        publisher: {
            "@type": "Person",
            name,
        },
    };

    return (
        <>
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
