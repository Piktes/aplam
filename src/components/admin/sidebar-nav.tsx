"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Music2, Youtube, Calendar, Package, ImageIcon,
    Bell, Share2, MessageSquare, Mail, ImagePlus, Settings, PenTool, FileText, Users, ScrollText, Shield, Eye, Newspaper,
} from "lucide-react";
import { openSection } from "./dashboard-section";

interface SidebarNavProps {
    unreadCount: number;
    onLinkClick?: () => void;
}

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
    sectionId?: string;
    badge?: number;
    dividerBefore?: boolean;
}

export function SidebarNav({ unreadCount, onLinkClick }: SidebarNavProps) {
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { href: "/admin", icon: Home, label: "Panel" },
        { href: "/admin", icon: Music2, label: "Ses Parçaları", sectionId: "tracks" },
        { href: "/admin", icon: Youtube, label: "Videolar", sectionId: "videos" },
        { href: "/admin", icon: ImagePlus, label: "Galeri", sectionId: "gallery" },
        { href: "/admin", icon: Settings, label: "Ayarlar", sectionId: "settings" },
        { href: "/admin/events", icon: Calendar, label: "Etkinlikler" },
        { href: "/admin/products/new", icon: Package, label: "Ürün Ekle" },
        { href: "/admin/hero", icon: ImageIcon, label: "Kapak Düzenleyici" },
        { href: "/admin/bio-editor", icon: FileText, label: "Biyografi Düzenleyici" },
        { href: "/admin/popups", icon: Bell, label: "Açılır Pencereler" },
        { href: "/admin/social-media", icon: Share2, label: "Sosyal Medya" },
        { href: "/admin/auto-reply", icon: MessageSquare, label: "Otomatik Yanıt" },
        { href: "/admin/user-notifications", icon: Mail, label: "Kullanıcı Bildirimleri" },
        { href: "/admin/email-signature", icon: PenTool, label: "E-posta İmzası" },
        { href: "/admin/visitors", icon: Eye, label: "Ziyaretçiler" },
        { href: "/admin/subscribers", icon: Users, label: "Aboneler" },
        { href: "/admin/messages", icon: MessageSquare, label: "Mesajlar", badge: unreadCount > 0 ? unreadCount : undefined },
        { href: "/admin/press-kit", icon: Newspaper, label: "Basın Kiti" },
        // System section with divider
        { href: "/admin/users", icon: Shield, label: "Sistem Kullanıcıları", dividerBefore: true },
        { href: "/admin/logs", icon: ScrollText, label: "Sistem Kayıtları" },
    ];

    const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
        if (item.sectionId && pathname === "/admin") {
            e.preventDefault();
            openSection(item.sectionId);
        } else if (item.sectionId) {
            sessionStorage.setItem("openSection", item.sectionId);
        }
        // Close mobile sidebar when any link is clicked
        onLinkClick?.();
    };

    const isActive = (item: NavItem) => {
        if (item.sectionId) {
            return pathname === "/admin";
        }
        return pathname === item.href || pathname.startsWith(item.href + "/");
    };

    return (
        <nav className="space-y-1">
            {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = index === 0 && pathname === "/admin" ? true :
                    (pathname === item.href && !item.sectionId);

                return (
                    <div key={`${item.label}-${index}`}>
                        {/* Divider before system section */}
                        {item.dividerBefore && (
                            <div className="my-4 border-t border-border pt-4">
                                <p className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Sistem
                                </p>
                            </div>
                        )}
                        <Link
                            href={item.sectionId ? `/admin#${item.sectionId}` : item.href}
                            onClick={(e) => handleNavClick(item, e)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${active
                                ? "bg-accent-coral/10 text-accent-coral font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </span>
                            {item.badge !== undefined && (
                                <span className="bg-accent-coral text-white text-xs px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}
