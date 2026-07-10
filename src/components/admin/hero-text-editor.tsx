"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import {
    Bold,
    Italic,
    Undo,
    Redo,
    ChevronDown,
    Type,
    Save,
    Loader2,
    CheckCircle,
    Sun,
    Moon,
    Eye,
} from "lucide-react";
import {
    HERO_DEFAULTS,
    HERO_SIZE_KEYS,
    HERO_POSITION_KEYS,
    HERO_FONT_KEYS,
    asHeroFont,
    asHeroSize,
    asHeroPosition,
    type HeroFontKey,
    type HeroSizeKey,
    type HeroPositionKey,
} from "@/lib/hero-text";
import { HERO_FONTS } from "@/lib/hero-fonts";
import {
    HERO_POSITION_CLASSES,
    PREVIEW_TITLE_SIZE_CLASSES,
    PREVIEW_SUBTITLE_SIZE_CLASSES,
    HERO_SIZE_LABELS,
} from "@/components/hero-text-config";

// ========================================
// Önizleme tema renkleri — globals.css .public-v2 değişkenlerinin hero'da
// görünen karşılıkları (foreground / gradient-warm-bg). Admin panelinin
// temasından bağımsız çalışsın diye CSS var yerine sabit kullanılır;
// kaynak: globals.css "VERSION2 PUBLIC" bloğu.
// ========================================
const PREVIEW_THEME = {
    light: { fg: "#5C4A42", bg: "#FBF3EE" },
    dark: { fg: "#F5E9E2", bg: "#382B2B" },
};

// Alt metin public hero'da temadan bağımsız text-white/80 (görsel üstünde durur)
const SUBTITLE_COLOR = "rgba(255, 255, 255, 0.8)";

// ========================================
// Önizleme için client-side temizlik: izinli satır içi etiketler kalır,
// TÜM attribute'lar (style/color dahil) atılır — public render'daki
// server-side sanitize'ın aynadaki karşılığı.
// ========================================
const PREVIEW_ALLOWED_TAGS = new Set(["STRONG", "B", "EM", "I", "S", "SPAN"]);

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function stripForPreview(html: string): string {
    if (typeof window === "undefined" || !html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent ?? "");
        if (node.nodeType !== Node.ELEMENT_NODE) return "";
        const el = node as Element;
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return "";
        if (el.tagName === "BR") return "<br />";
        const inner = Array.from(el.childNodes).map(walk).join("");
        if (!PREVIEW_ALLOWED_TAGS.has(el.tagName)) return inner;
        const t = el.tagName.toLowerCase();
        return `<${t}>${inner}</${t}>`;
    };

    // Tiptap çıktısı <p> bloklarıdır; public'te satır sonuna çevrildiği
    // için önizlemede de bloklar <br /> ile birleştirilir.
    const parts: string[] = [];
    doc.body.childNodes.forEach((n) => {
        const s = walk(n);
        if (s.replace(/<br \/>/g, "").trim()) parts.push(s);
    });
    return parts.join("<br />");
}

function useDebounced<T>(value: T, ms = 200): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return debounced;
}

// ========================================
// Mini Tiptap editörü (kalın / italik / satır sonu — renk bilinçli olarak YOK)
// ========================================
function ToolbarButton({
    onClick,
    isActive,
    disabled,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md transition-colors ${isActive
                ? "bg-accent-coral text-white"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );
}

function MiniToolbar({ editor }: { editor: Editor }) {
    return (
        <div className="flex items-center gap-1 p-1.5 border-b border-border bg-muted/30">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Kalın"
            >
                <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="İtalik"
            >
                <Italic size={14} />
            </ToolbarButton>
            <span className="text-[10px] text-muted-foreground ml-2">
                Satır sonu: Enter
            </span>
            <div className="flex-1" />
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Geri Al"
            >
                <Undo size={14} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Yinele"
            >
                <Redo size={14} />
            </ToolbarButton>
        </div>
    );
}

function HeroMiniEditor({
    value,
    onChange,
    placeholder,
    fontFamily,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder: string;
    fontFamily: string;
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                blockquote: false,
                codeBlock: false,
                code: false,
                horizontalRule: false,
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none p-3 min-h-[72px] focus:outline-none",
            },
        },
    });

    if (!editor) {
        return (
            <div className="border border-border rounded-xl bg-card animate-pulse">
                <div className="h-9 bg-muted/30 rounded-t-xl" />
                <div className="p-3 min-h-[72px]" />
            </div>
        );
    }

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden focus-within:ring-2 focus-within:ring-accent-coral/50 transition-all">
            <MiniToolbar editor={editor} />
            {/* Seçilen font editörde de uygulanır — yazarken görülür */}
            <div style={{ fontFamily }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

// ========================================
// Font seçici — seçenekler KENDİ fontlarıyla önizlenir
// ========================================
function FontSelect({
    value,
    onChange,
}: {
    value: HeroFontKey;
    onChange: (key: HeroFontKey) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between gap-2 w-52 h-9 px-3 text-sm bg-transparent border border-border rounded-lg hover:bg-muted transition-colors"
                title="Yazı Tipi"
            >
                <span style={{ fontFamily: HERO_FONTS[value].fontFamily }} className="truncate">
                    {HERO_FONTS[value].label}
                </span>
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-30 overflow-hidden">
                    {HERO_FONT_KEYS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                onChange(key);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-base transition-colors hover:bg-muted ${key === value ? "bg-muted text-accent-coral" : ""
                                }`}
                            style={{ fontFamily: HERO_FONTS[key].fontFamily }}
                        >
                            {HERO_FONTS[key].label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ========================================
// Boyut seçici (küçük / orta / büyük)
// ========================================
function SizeSelect({
    value,
    onChange,
}: {
    value: HeroSizeKey;
    onChange: (size: HeroSizeKey) => void;
}) {
    return (
        <div className="flex items-center bg-muted/30 rounded-lg p-0.5 border border-border/50">
            {HERO_SIZE_KEYS.map((size) => (
                <button
                    key={size}
                    type="button"
                    onClick={() => onChange(size)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${size === value
                        ? "bg-accent-coral text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    {HERO_SIZE_LABELS[size]}
                </button>
            ))}
        </div>
    );
}

// ========================================
// 3x3 konum seçici
// ========================================
function PositionGrid({
    value,
    onChange,
}: {
    value: HeroPositionKey;
    onChange: (pos: HeroPositionKey) => void;
}) {
    return (
        <div className="grid grid-cols-3 gap-1.5 w-36">
            {HERO_POSITION_KEYS.map((pos) => (
                <button
                    key={pos}
                    type="button"
                    onClick={() => onChange(pos)}
                    title={HERO_POSITION_CLASSES[pos].label}
                    aria-label={HERO_POSITION_CLASSES[pos].label}
                    aria-pressed={pos === value}
                    className={`aspect-square rounded-md border flex items-center justify-center transition-colors ${pos === value
                        ? "bg-accent-coral border-accent-coral"
                        : "bg-muted/30 border-border hover:bg-muted"
                        }`}
                >
                    <span
                        className={`w-2 h-2 rounded-full ${pos === value ? "bg-white" : "bg-muted-foreground/40"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ========================================
// Ana bileşen
// ========================================
interface HeroTextEditorProps {
    coverImageUrl: string | null;
    initial: {
        title: string | null;
        subtitle: string | null;
        titleFont: string | null;
        subtitleFont: string | null;
        titleSize: string | null;
        subtitleSize: string | null;
        position: string | null;
    };
}

export function HeroTextEditor({ coverImageUrl, initial }: HeroTextEditorProps) {
    const router = useRouter();

    const [titleHtml, setTitleHtml] = useState(
        initial.title || `<p>${HERO_DEFAULTS.title}</p>`
    );
    const [subtitleHtml, setSubtitleHtml] = useState(
        initial.subtitle || `<p>${HERO_DEFAULTS.subtitle}</p>`
    );
    const [titleFont, setTitleFont] = useState<HeroFontKey>(
        asHeroFont(initial.titleFont) ?? HERO_DEFAULTS.titleFont
    );
    const [subtitleFont, setSubtitleFont] = useState<HeroFontKey>(
        asHeroFont(initial.subtitleFont) ?? HERO_DEFAULTS.subtitleFont
    );
    const [titleSize, setTitleSize] = useState<HeroSizeKey>(
        asHeroSize(initial.titleSize) ?? HERO_DEFAULTS.titleSize
    );
    const [subtitleSize, setSubtitleSize] = useState<HeroSizeKey>(
        asHeroSize(initial.subtitleSize) ?? HERO_DEFAULTS.subtitleSize
    );
    const [position, setPosition] = useState<HeroPositionKey>(
        asHeroPosition(initial.position)
    );

    const [previewDark, setPreviewDark] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Önizleme debounce ile güncellenir
    const debTitle = useDebounced(titleHtml);
    const debSubtitle = useDebounced(subtitleHtml);

    const previewTitle = useMemo(() => {
        const s = stripForPreview(debTitle);
        return s || escapeHtml(HERO_DEFAULTS.title);
    }, [debTitle]);
    const previewSubtitle = useMemo(() => {
        const s = stripForPreview(debSubtitle);
        return s || escapeHtml(HERO_DEFAULTS.subtitle);
    }, [debSubtitle]);

    const theme = previewDark ? PREVIEW_THEME.dark : PREVIEW_THEME.light;
    const pos = HERO_POSITION_CLASSES[position];

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/hero", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateHeroText",
                    title: titleHtml,
                    subtitle: subtitleHtml,
                    titleFont,
                    subtitleFont,
                    titleSize,
                    subtitleSize,
                    position,
                }),
            });
            if (!res.ok) throw new Error("Kaydetme başarısız");
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError("Kapak metni kaydedilemedi. Lütfen tekrar deneyin.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="glass-card p-8 mt-10">
            <div className="flex items-center gap-3 mb-2">
                <Type className="text-accent-coral" size={24} />
                <h2 className="font-display text-xl tracking-wide">Kapak Metni</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
                Ana sayfa hero bölümündeki başlık ve alt metni düzenleyin. Metin rengi
                site temasından otomatik gelir. Alan boş bırakılırsa varsayılan metin gösterilir.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sağ üst: canlı önizleme (mobilde en üstte) */}
                <div className="order-first lg:order-last">
                    <div className="lg:sticky lg:top-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Eye size={16} className="text-accent-coral" /> Canlı Önizleme
                            </span>
                            {/* Yalnız önizlemeyi etkileyen tema anahtarı */}
                            <div className="flex items-center bg-muted/30 rounded-lg p-0.5 border border-border/50">
                                <button
                                    type="button"
                                    onClick={() => setPreviewDark(false)}
                                    title="Açık tema önizlemesi"
                                    className={`p-1.5 rounded-md transition-colors ${!previewDark ? "bg-accent-coral text-white" : "text-muted-foreground hover:bg-muted"}`}
                                >
                                    <Sun size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDark(true)}
                                    title="Koyu tema önizlemesi"
                                    className={`p-1.5 rounded-md transition-colors ${previewDark ? "bg-accent-coral text-white" : "text-muted-foreground hover:bg-muted"}`}
                                >
                                    <Moon size={14} />
                                </button>
                            </div>
                        </div>

                        <div
                            className="relative rounded-xl overflow-hidden border border-border aspect-[16/10]"
                            style={{ backgroundColor: theme.bg }}
                        >
                            {coverImageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={coverImageUrl}
                                    alt="Kapak önizlemesi"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div className={`absolute inset-0 flex p-5 ${pos.flex}`}>
                                <div className={`flex flex-col max-w-[85%] ${pos.block}`}>
                                    <div
                                        className={`tracking-widest leading-tight ${PREVIEW_TITLE_SIZE_CLASSES[titleSize]}`}
                                        style={{
                                            fontFamily: HERO_FONTS[titleFont].fontFamily,
                                            color: theme.fg,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: previewTitle }}
                                    />
                                    <div
                                        className={`mt-2 leading-relaxed ${PREVIEW_SUBTITLE_SIZE_CLASSES[subtitleSize]}`}
                                        style={{
                                            fontFamily: HERO_FONTS[subtitleFont].fontFamily,
                                            color: SUBTITLE_COLOR,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: previewSubtitle }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Konum seçici */}
                        <div className="flex items-start gap-4">
                            <PositionGrid value={position} onChange={setPosition} />
                            <div className="text-sm text-muted-foreground pt-1">
                                <p className="font-medium text-foreground">Metin Konumu</p>
                                <p className="mt-1">
                                    Seçili: <span className="text-accent-coral">{pos.label}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sol: editörler */}
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <label className="text-sm font-medium">Başlık</label>
                            <div className="flex items-center gap-2">
                                <FontSelect value={titleFont} onChange={setTitleFont} />
                                <SizeSelect value={titleSize} onChange={setTitleSize} />
                            </div>
                        </div>
                        <HeroMiniEditor
                            value={titleHtml}
                            onChange={setTitleHtml}
                            placeholder={HERO_DEFAULTS.title}
                            fontFamily={HERO_FONTS[titleFont].fontFamily}
                        />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <label className="text-sm font-medium">Alt Metin</label>
                            <div className="flex items-center gap-2">
                                <FontSelect value={subtitleFont} onChange={setSubtitleFont} />
                                <SizeSelect value={subtitleSize} onChange={setSubtitleSize} />
                            </div>
                        </div>
                        <HeroMiniEditor
                            value={subtitleHtml}
                            onChange={setSubtitleHtml}
                            placeholder={HERO_DEFAULTS.subtitle}
                            fontFamily={HERO_FONTS[subtitleFont].fontFamily}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary flex items-center gap-2 px-8"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle size={18} />
                                Kaydedildi!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Kapak Metnini Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}
