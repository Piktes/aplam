"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { SocialLinksRow } from "@/components/social-icons";

// Hero'daki sosyal ikon satırı için akordeon sarmalayıcı.
// - İlk ziyarette ikonlar AÇIK başlar, ~3.5 sn sonra "Social Media" hapına
//   toplanır (localStorage ile hatırlanır; sonraki ziyaretlerde kapalı başlar).
// - PC: hover ile sağdan sola açılır, mouse çekilince toplanır.
// - Mobil: hapa dokununca açılır/kapanır.
// İkonların kendisi SocialLinksRow — görünümleri aynen korunur.

const INTRO_KEY = "ba_social_intro_seen";
const INTRO_MS = 3500;

interface SocialAccordionProps {
    links: any[];
    size?: number;
}

export function SocialAccordion({ links, size = 18 }: SocialAccordionProps) {
    const [open, setOpen] = useState(true); // ilk ziyaretçi açık görsün
    const introDone = useRef(false);

    useEffect(() => {
        try {
            if (localStorage.getItem(INTRO_KEY)) {
                // Tekrar gelen ziyaretçi: kapalı başla
                introDone.current = true;
                setOpen(false);
                return;
            }
            localStorage.setItem(INTRO_KEY, "1");
            const t = setTimeout(() => {
                introDone.current = true;
                setOpen(false);
            }, INTRO_MS);
            return () => clearTimeout(t);
        } catch {
            // localStorage yoksa (gizli mod vb.) hep açık kalsın
            introDone.current = true;
        }
    }, []);

    return (
        <div
            className="flex items-center justify-center"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => {
                if (introDone.current) setOpen(false);
            }}
        >
            {/* İkonlar hapın SOLUNDA: açılış sağdan sola okunur */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-out ${open ? "max-w-[480px] opacity-100 mr-3" : "max-w-0 opacity-0 mr-0"
                    }`}
            >
                <div className="w-max">
                    <SocialLinksRow links={links} size={size} />
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    introDone.current = true;
                    setOpen(!open);
                }}
                aria-expanded={open}
                aria-label="Sosyal medya bağlantılarını göster/gizle"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase border border-foreground/15 bg-foreground/5 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors whitespace-nowrap"
            >
                <Sparkles size={13} className="text-accent-coral" />
                Social Media
            </button>
        </div>
    );
}
