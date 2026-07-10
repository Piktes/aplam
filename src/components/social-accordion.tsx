"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { SocialLinksRow } from "@/components/social-icons";

// Hero'daki sosyal ikon satırı için akordeon.
// - Her sayfa açılışında KAPALI başlar ("Sosyal Medya" hapı görünür).
// - Açılınca hap kaybolur, ikonlar ekrana ortalanmış olarak belirir
//   (sağdan sola süzülerek); görünümleri aynen korunur.
// - PC: hover ile açılır, mouse ayrılınca kapanır.
// - Mobil: hapa dokununca açılır; DIŞARI dokununca kapanır.

interface SocialAccordionProps {
    links: any[];
    size?: number;
}

export function SocialAccordion({ links, size = 18 }: SocialAccordionProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Dışarı dokunma/tıklama → kapan (mobil için şart, PC'de de zararsız)
    useEffect(() => {
        if (!open) return;
        const closeOutside = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", closeOutside);
        return () => document.removeEventListener("pointerdown", closeOutside);
    }, [open]);

    return (
        <div
            ref={ref}
            className="grid place-items-center"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* Açık hal: ikonlar tam ortada; kapalıyken sağa toplanmış ve görünmez */}
            <div
                className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${open
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-8 scale-95 pointer-events-none"
                    }`}
            >
                <SocialLinksRow links={links} size={size} />
            </div>

            {/* Kapalı hal: yalnız hap görünür; açılınca tamamen kaybolur */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-label="Sosyal medya bağlantılarını göster"
                className={`col-start-1 row-start-1 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase border border-foreground/15 bg-foreground/5 backdrop-blur-md text-muted-foreground whitespace-nowrap transition-all duration-300 ${open
                    ? "opacity-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100 hover:text-foreground hover:bg-foreground/10"
                    }`}
            >
                <Sparkles size={13} className="text-accent-coral" />
                Sosyal Medya
            </button>
        </div>
    );
}
