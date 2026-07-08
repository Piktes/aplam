"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    /** Görünür olduktan sonra animasyon başlangıcına eklenecek gecikme (ms) */
    delay?: number;
}

/**
 * version2 public sayfaları için scroll reveal (fade-in-up, bir kez).
 *
 * JS'siz güvenlik: SSR çıktısı data-reveal="idle" ile gelir ve CSS'te
 * "idle" için gizleme YOKTUR — JavaScript hiç yüklenmezse içerik görünür
 * kalır. Gizleme yalnızca bileşen mount olup IntersectionObserver
 * kurulduktan sonra ("hidden") uygulanır; eleman viewport'a girince
 * "shown" olur ve observer kapatılır (tek sefer oynar).
 *
 * prefers-reduced-motion: reduce ise hiç gizlenmez (CSS tarafında da
 * ayrıca kapatılır).
 */
export function ScrollReveal({ children, className, delay }: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setState("shown");
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        setState("hidden");
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            data-reveal={state}
            className={className}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}
