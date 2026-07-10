import sanitizeHtml from "sanitize-html";

// Hero kapak metni sanitize'ı (yalnız server'da kullan: API + RSC render).
// Yalnız satır içi biçimlendirme etiketleri kalır; style/class/renk dahil
// TÜM attribute'lar atılır — metin rengi temadan gelir, editörden dayatılamaz.
// Kayıtta VE public render'da çağrılır (çifte emniyet).
export function sanitizeHeroHtml(html: string | null | undefined): string | null {
    if (!html) return null;

    const clean = sanitizeHtml(html, {
        allowedTags: ["p", "br", "strong", "b", "em", "i", "s", "span"],
        allowedAttributes: {},
        disallowedTagsMode: "discard",
    });

    // İçerik h1/p elemanlarının İÇİNDE render edildiği için blok <p>'ler
    // geçerli HTML olacak şekilde satır sonlarına çevrilir.
    const inline = clean
        .replace(/<\/p>\s*<p[^>]*>/g, "<br />")
        .replace(/<\/?p[^>]*>/g, "")
        .trim();

    // Etiketlerden arınınca görünür metin kalmıyorsa null → fallback devreye girer.
    const textOnly = inline
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, " ")
        .trim();

    return textOnly ? inline : null;
}
