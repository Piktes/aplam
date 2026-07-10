import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSystemLogs, type LogLevel } from "@/lib/audit-logger";
import { InfoBar } from "@/components/admin/info-bar";
import { ScrollText, ChevronLeft, ChevronRight, Search } from "lucide-react";

export const dynamic = "force-dynamic";

// Sistem Kayıtları — sidebar'daki /admin/logs linkinin sayfası.
// Audit trail SystemLog tablosunda zaten tutuluyordu; bu sayfa onu listeler
// (seviye/işlem/kullanıcı filtresi + sayfalama, GET parametreleriyle).

const LEVELS: LogLevel[] = ["INFO", "WARN", "ERROR"];

const LEVEL_STYLES: Record<string, string> = {
    INFO: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    WARN: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    ERROR: "bg-red-500/10 text-red-500 border-red-500/20",
};

function fmt(date: Date) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: "Europe/Istanbul",
    }).format(date);
}

function pageHref(params: { level?: string; action?: string; username?: string }, page: number) {
    const q = new URLSearchParams();
    if (params.level) q.set("level", params.level);
    if (params.action) q.set("action", params.action);
    if (params.username) q.set("username", params.username);
    if (page > 1) q.set("page", String(page));
    const s = q.toString();
    return `/admin/logs${s ? `?${s}` : ""}`;
}

export default async function SystemLogsPage({
    searchParams,
}: {
    searchParams: { page?: string; level?: string; action?: string; username?: string };
}) {
    const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
    const level = LEVELS.includes(searchParams.level as LogLevel)
        ? (searchParams.level as LogLevel)
        : undefined;
    const action = searchParams.action?.trim() || undefined;
    const username = searchParams.username?.trim() || undefined;

    const [{ logs, total, totalPages }, errorCount] = await Promise.all([
        getSystemLogs({ page, limit: 50, level, action, username }),
        prisma.systemLog.count({ where: { level: "ERROR" } }),
    ]);

    const filterParams = { level: searchParams.level, action, username };

    return (
        <div className="min-h-screen">
            <InfoBar counter={`${total} kayıt`} />

            <main className="max-w-6xl mx-auto px-4 pb-10">
                <div className="mb-6">
                    <h1 className="font-display text-display-md tracking-wider uppercase flex items-center gap-3">
                        <ScrollText className="text-accent-coral" size={32} />
                        Sistem Kayıtları
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Yönetici işlemlerinin denetim izi (giriş, içerik değişiklikleri, hatalar).
                        {errorCount > 0 && <> Toplam <span className="text-red-500 font-medium">{errorCount} hata</span> kaydı var.</>}
                    </p>
                </div>

                {/* Filtreler (GET formu — sayfa server'da süzülmüş gelir) */}
                <form method="get" className="glass-card p-4 mb-6 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">Seviye</label>
                        <select
                            name="level"
                            defaultValue={level || ""}
                            className="h-9 px-2 text-sm bg-transparent border border-border rounded-lg cursor-pointer"
                        >
                            <option value="">Tümü</option>
                            {LEVELS.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">İşlem</label>
                        <input
                            name="action"
                            defaultValue={action || ""}
                            placeholder="örn. LOGIN"
                            className="h-9 px-3 text-sm bg-transparent border border-border rounded-lg w-40"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">Kullanıcı</label>
                        <input
                            name="username"
                            defaultValue={username || ""}
                            placeholder="kullanıcı adı"
                            className="h-9 px-3 text-sm bg-transparent border border-border rounded-lg w-40"
                        />
                    </div>
                    <button type="submit" className="btn-secondary h-9 px-4 flex items-center gap-2 text-sm">
                        <Search size={14} /> Filtrele
                    </button>
                    {(level || action || username) && (
                        <Link href="/admin/logs" className="btn-ghost h-9 px-3 flex items-center text-sm text-muted-foreground">
                            Temizle
                        </Link>
                    )}
                </form>

                {/* Kayıt tablosu */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-4 py-3 whitespace-nowrap">Zaman</th>
                                    <th className="px-4 py-3">Seviye</th>
                                    <th className="px-4 py-3">İşlem</th>
                                    <th className="px-4 py-3">Kullanıcı</th>
                                    <th className="px-4 py-3">Detay</th>
                                    <th className="px-4 py-3">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            Filtreyle eşleşen kayıt yok.
                                        </td>
                                    </tr>
                                )}
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors align-top">
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmt(log.timestamp)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${LEVEL_STYLES[log.level] || "bg-muted text-muted-foreground border-border"}`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{log.action}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{log.username}</td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-md break-words">{log.details || "—"}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">{log.ipAddress || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Sayfalama */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
                            <span className="text-muted-foreground">
                                Sayfa {page} / {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                {page > 1 ? (
                                    <Link href={pageHref(filterParams, page - 1)} className="btn-ghost px-3 py-1.5 flex items-center gap-1">
                                        <ChevronLeft size={14} /> Önceki
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1.5 text-muted-foreground/40 flex items-center gap-1"><ChevronLeft size={14} /> Önceki</span>
                                )}
                                {page < totalPages ? (
                                    <Link href={pageHref(filterParams, page + 1)} className="btn-ghost px-3 py-1.5 flex items-center gap-1">
                                        Sonraki <ChevronRight size={14} />
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1.5 text-muted-foreground/40 flex items-center gap-1">Sonraki <ChevronRight size={14} /></span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
