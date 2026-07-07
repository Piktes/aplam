"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X, CheckCircle, Loader2, Mail, Bell } from "lucide-react";

interface NewsletterFormProps {
    successImage?: string | null;
    successTitle?: string | null;
    successMessage?: string | null;
}

export function NewsletterForm({
    successImage,
    successTitle = "Aramıza Hoş Geldiniz!",
    successMessage = "Abone olduğunuz için teşekkürler! Yeni projelerden ve etkinliklerden ilk siz haberdar olacaksınız.",
}: NewsletterFormProps) {
    const [isPending, startTransition] = useTransition();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [editableEmail, setEditableEmail] = useState("");
    const [receiveEventAlerts, setReceiveEventAlerts] = useState(false);
    const [customSuccessMessage, setCustomSuccessMessage] = useState<string | null>(null);

    // Step 1: Open verification modal
    const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email || !email.includes("@")) {
            setError("Lütfen geçerli bir e-posta adresi girin.");
            return;
        }

        setEditableEmail(email);
        setShowVerification(true);
    };

    // Step 2: Confirm subscription
    const handleConfirmSubscription = async () => {
        setError(null);

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.set("email", editableEmail);
                formData.set("receiveEventAlerts", receiveEventAlerts ? "true" : "false");

                // Honeypot fields
                formData.set("_honey", "");
                formData.set("website", "");

                const response = await fetch("/api/subscribe", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success) {
                    setShowVerification(false);
                    setShowSuccess(true);
                    setEmail("");
                    setEditableEmail("");
                    setReceiveEventAlerts(false);

                    // Store custom message for updated/reactivated users
                    if (data.updated && data.message) {
                        setCustomSuccessMessage(data.message);
                    } else {
                        setCustomSuccessMessage(null);
                    }
                } else {
                    if (data.error === "invalid_email") {
                        setError("Lütfen geçerli bir e-posta adresi girin.");
                    } else if (data.error === "too_many_requests") {
                        setError("Çok fazla istek gönderildi. Lütfen biraz bekleyin.");
                    } else {
                        setError(data.message || "Abonelik başarısız oldu. Lütfen tekrar deneyin.");
                    }
                }
            } catch {
                setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
            }
        });
    };

    return (
        <>
            {/* Newsletter Form */}
            <form onSubmit={handleInitialSubmit} className="mt-10 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative">
                {/* Honeypot fields */}
                <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                    <input type="text" name="_honey" tabIndex={-1} autoComplete="off" />
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    className="input-field flex-1"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary whitespace-nowrap flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            İşleniyor...
                        </>
                    ) : (
                        "Abone Ol"
                    )}
                </button>
            </form>

            {/* Error Message */}
            {error && !showVerification && (
                <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Verification Modal */}
            {showVerification && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowVerification(false)}
                >
                    <div
                        className="glass-card max-w-md w-full rounded-2xl overflow-hidden relative animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowVerification(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
                            aria-label="Kapat"
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="p-8 pb-0 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-coral/10 flex items-center justify-center">
                                <Mail size={32} className="text-accent-coral" />
                            </div>
                            <h3 className="font-display text-2xl tracking-wide mb-2">
                                Aboneliği Onayla
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                E-postanızı doğrulayın ve tercihlerinizi seçin
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            {/* Editable Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">E-posta Adresiniz</label>
                                <input
                                    type="email"
                                    value={editableEmail}
                                    onChange={(e) => setEditableEmail(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            {/* Event Alerts Checkbox */}
                            <label className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-accent-coral/30 hover:bg-accent-coral/5 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={receiveEventAlerts}
                                    onChange={(e) => setReceiveEventAlerts(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-border accent-accent-coral"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Bell size={16} className="text-accent-coral" />
                                        Etkinlik Bildirimleri
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Etkinlik hatırlatmaları, güncellemeler ve tükendi uyarıları alın
                                    </p>
                                </div>
                            </label>

                            {/* Error in modal */}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirmSubscription}
                                disabled={isPending}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Abone olunuyor...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Aboneliği Onayla
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero-Style Success Popup Modal */}
            {showSuccess && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowSuccess(false)}
                >
                    <div
                        className="glass-card max-w-lg w-full rounded-2xl overflow-hidden relative animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                            aria-label="Kapat"
                        >
                            <X size={20} className="text-white" />
                        </button>

                        {/* Hero Banner Image - Full Width */}
                        {successImage ? (
                            <div className="w-full aspect-[16/9] relative bg-neutral-900 rounded-t-2xl overflow-hidden">
                                <Image
                                    src={successImage}
                                    alt="Başarılı"
                                    fill
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[16/9] bg-gradient-to-br from-accent-coral/20 to-accent-peach/20 flex items-center justify-center">
                                <CheckCircle size={64} className="text-accent-coral/50" />
                            </div>
                        )}

                        {/* Body Content */}
                        <div className="p-8 text-center">
                            <h3 className="font-display text-2xl md:text-3xl tracking-wide mb-4">
                                {customSuccessMessage ? "Tekrar Hoş Geldiniz!" : successTitle}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {customSuccessMessage || successMessage}
                            </p>

                            <button
                                onClick={() => setShowSuccess(false)}
                                className="mt-8 btn-primary w-full"
                            >
                                Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
