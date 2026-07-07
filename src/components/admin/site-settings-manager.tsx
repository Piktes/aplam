"use client";

import { useTransition } from "react";
import {
    Settings, Music2, ShoppingBag, Share2, Youtube,
    ImageIcon, Sparkles, Loader2
} from "lucide-react";

interface SiteSettings {
    id: number;
    isAudioPlayerVisible: boolean;
    isShopVisible: boolean;
    isSocialLinksVisible: boolean;
    isYoutubeVisible: boolean;
    youtubeAutoScroll: boolean;
    youtubeScrollInterval: number;
    heroSliderEnabled: boolean;
    heroSliderInterval: number;
    heroKenBurnsEffect: boolean;
}

interface SiteSettingsManagerProps {
    settings: SiteSettings;
    onToggle: (formData: FormData) => Promise<any>;
}

export function SiteSettingsManager({ settings, onToggle }: SiteSettingsManagerProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (settingName: string, currentValue: boolean) => {
        const formData = new FormData();
        formData.set("settingName", settingName);
        formData.set("currentValue", currentValue.toString());
        startTransition(() => {
            onToggle(formData);
        });
    };

    const settingItems = [
        {
            name: "isAudioPlayerVisible",
            label: "Ses Oynatıcı",
            description: "Ana sayfadaki hero ses oynatıcıyı göster/gizle",
            icon: Music2,
            value: settings.isAudioPlayerVisible,
        },
        {
            name: "isShopVisible",
            label: "Mağaza Bölümü",
            description: "Ana sayfadaki mağaza/ürün bölümünü göster/gizle",
            icon: ShoppingBag,
            value: settings.isShopVisible,
        },
        {
            name: "isSocialLinksVisible",
            label: "Sosyal Bağlantılar",
            description: "Sitedeki sosyal medya ikonlarını göster/gizle",
            icon: Share2,
            value: settings.isSocialLinksVisible,
        },
        {
            name: "isYoutubeVisible",
            label: "YouTube Videoları",
            description: "YouTube video karusel bölümünü göster/gizle",
            icon: Youtube,
            value: settings.isYoutubeVisible,
        },
        {
            name: "youtubeAutoScroll",
            label: "Otomatik Kaydırma",
            description: "Karuseldeki videoları otomatik olarak kaydır",
            icon: Youtube,
            value: settings.youtubeAutoScroll,
        },
        {
            name: "heroSliderEnabled",
            label: "Hero Slider",
            description: "Hero bölümünde birden fazla kayan görsel etkinleştir",
            icon: ImageIcon,
            value: settings.heroSliderEnabled,
        },
        {
            name: "heroKenBurnsEffect",
            label: "Ken Burns Efekti",
            description: "Hero arka plan görsellerinde hafif yakınlaştırma animasyonu",
            icon: Sparkles,
            value: settings.heroKenBurnsEffect,
        },
    ];

    return (
        <div className="p-6">

            {isPending && (
                <div className="mb-4 p-3 rounded-lg bg-accent-coral/10 border border-accent-coral/20 flex items-center gap-2 text-accent-coral">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Ayarlar güncelleniyor...</span>
                </div>
            )}

            <div className="space-y-4">
                {settingItems.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.value ? "bg-accent-coral/10 text-accent-coral" : "bg-muted text-muted-foreground"
                                }`}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => handleToggle(item.name, item.value)}
                            disabled={isPending}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${item.value
                                ? "bg-accent-coral"
                                : "bg-muted"
                                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                            aria-label={`Toggle ${item.label}`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${item.value ? "translate-x-6" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Nasıl çalışır:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Değişiklikler site genelinde anında etkili olur</li>
                    <li>Gizlenen bölümler navigasyonda ve içerikte görünmez</li>
                    <li>Bölümler gizlendiğinde veriler korunur (silinmez)</li>
                </ul>
            </div>
        </div>
    );
}
