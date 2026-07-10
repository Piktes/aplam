"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import {
    ShieldCheck,
    Loader2,
    AlertCircle,
    Copy,
    CheckCircle,
    KeyRound,
    Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Zorunlu 2FA kurulumu — middleware, TOTP'si etkin olmayan her admini buraya
// yönlendirir. Akış: QR'ı Microsoft/Google Authenticator ile tara → 6 haneli
// kodu doğrula → yedek kodları kaydet → yeniden giriş yap.

type Step = "loading" | "scan" | "backup" | "error";

export default function TwoFactorSetupPage() {
    const [step, setStep] = useState<Step>("loading");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const initCalled = useRef(false);

    useEffect(() => {
        // React StrictMode'da çift init'i (çift secret üretimini) engelle
        if (initCalled.current) return;
        initCalled.current = true;

        (async () => {
            try {
                const res = await fetch("/api/admin/2fa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "init" }),
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setQrDataUrl(data.qrDataUrl);
                setSecret(data.secret);
                setStep("scan");
            } catch {
                setError("Kurulum başlatılamadı. Sayfayı yenileyin.");
                setStep("error");
            }
        })();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsVerifying(true);
        try {
            const res = await fetch("/api/admin/2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "confirm", code }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Kod geçersiz");
                return;
            }
            setBackupCodes(data.backupCodes || []);
            setStep("backup");
        } catch {
            setError("Doğrulama başarısız. Tekrar deneyin.");
        } finally {
            setIsVerifying(false);
        }
    };

    const copyBackupCodes = async () => {
        try {
            await navigator.clipboard.writeText(backupCodes.join("\n"));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* pano erişimi yoksa sessiz geç */ }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background grain relative py-10">
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>
            <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent-coral/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent-peach/10 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="glass-card p-8 md:p-10 rounded-3xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-coral/10 flex items-center justify-center">
                            <ShieldCheck size={32} className="text-accent-coral" />
                        </div>
                        <h1 className="font-display text-2xl tracking-widest uppercase">
                            İki Aşamalı Doğrulama
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Yönetim paneli için 2FA kurulumu zorunludur.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {step === "loading" && (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <Loader2 size={28} className="animate-spin" />
                        </div>
                    )}

                    {step === "scan" && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                <Smartphone size={18} className="text-accent-coral shrink-0 mt-0.5" />
                                <p>
                                    Telefonunuzda <strong className="text-foreground">Microsoft Authenticator</strong>{" "}
                                    uygulamasını açın, <strong className="text-foreground">Hesap ekle → Diğer hesap</strong>{" "}
                                    deyip aşağıdaki kareyi taratın. (Google Authenticator ile de çalışır.)
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <div className="p-3 bg-white rounded-2xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrDataUrl} alt="2FA QR kodu" width={240} height={240} />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center break-all">
                                QR taranamazsa elle girin: <code className="text-foreground">{secret}</code>
                            </p>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Uygulamadaki 6 haneli kod
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent-coral focus:ring-2 focus:ring-accent-coral/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isVerifying || code.length !== 6}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600 text-white font-medium transition-all hover:brightness-110 shadow-lg shadow-amber-900/20 dark:shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Doğrulanıyor...
                                        </>
                                    ) : (
                                        "Doğrula ve Etkinleştir"
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === "backup" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle size={20} />
                                <span className="text-sm font-medium">2FA etkinleştirildi!</span>
                            </div>

                            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                <KeyRound size={18} className="text-accent-coral shrink-0 mt-0.5" />
                                <p>
                                    Telefonunuza erişemezseniz giriş için bu{" "}
                                    <strong className="text-foreground">tek kullanımlık yedek kodları</strong> kullanın.
                                    Bu kodlar <strong className="text-foreground">bir daha gösterilmeyecek</strong> —
                                    güvenli bir yere kaydedin.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-muted/50 border border-border font-mono text-sm">
                                {backupCodes.map((c) => (
                                    <div key={c} className="text-center py-1">{c}</div>
                                ))}
                            </div>

                            <button
                                onClick={copyBackupCodes}
                                className="w-full py-3 rounded-xl border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                {copied ? "Kopyalandı!" : "Kodları Kopyala"}
                            </button>

                            <button
                                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600 text-white font-medium transition-all hover:brightness-110 shadow-lg shadow-amber-900/20 dark:shadow-amber-500/20"
                            >
                                Kodları Kaydettim — Yeniden Giriş Yap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
