"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Heart, HeartCrack } from "lucide-react";

interface UnsubscribeFormProps {
    token: string;
    processUnsubscribeAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

const UNSUBSCRIBE_REASONS = [
    { id: "no-longer-interested", label: "Artık bu e-postaları almak istemiyorum", emoji: "📧" },
    { id: "too-frequent", label: "E-postalar çok sık geliyor", emoji: "📬" },
    { id: "not-relevant", label: "İçerik benimle ilgili değil", emoji: "🎵" },
    { id: "mistake", label: "Yanlışlıkla kaydolmuşum", emoji: "🤔" },
    { id: "other", label: "Başka bir neden", emoji: "✍️" },
];

export function UnsubscribeForm({
    token,
    processUnsubscribeAction,
}: UnsubscribeFormProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const reasonToSend = selectedReason === "other"
            ? `Diğer: ${customReason}`
            : UNSUBSCRIBE_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;

        const formData = new FormData();
        formData.set("token", token);
        formData.set("reason", reasonToSend);

        try {
            const result = await processUnsubscribeAction(formData);
            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.error || "Abonelikten çıkılamadı");
            }
        } catch {
            setError("Beklenmedik bir hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-10">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                    <CheckCircle className="relative mx-auto text-green-500" size={80} />
                </div>
                <h2 className="font-display text-2xl mb-3">Abonelikten Çıktınız</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Gitmenize üzüldük ama kararınıza saygı duyuyoruz.
                    Artık bizden e-posta almayacaksınız.
                </p>
                <div className="mt-8 p-4 rounded-xl bg-accent-coral/5 border border-accent-coral/10">
                    <p className="text-sm text-muted-foreground">
                        Fikriniz mi değişti? İstediğiniz zaman{" "}
                        <a href="/" className="text-accent-coral hover:underline font-medium">
                            ana sayfadan
                        </a>
                        {" "}tekrar abone olabilirsiniz.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sad Message */}
            <div className="text-center py-4 px-6 rounded-2xl bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/10">
                <HeartCrack className="mx-auto mb-3 text-orange-400" size={36} />
                <p className="text-muted-foreground">
                    Gitmenize üzüldük! Ayrılmadan önce nedenini paylaşır mısınız?
                    Geri bildiriminiz gelişmemize yardımcı oluyor.
                </p>
            </div>

            {/* Feedback Question */}
            <div>
                <label className="block font-medium mb-4 text-center">
                    Neden abonelikten çıkıyorsunuz?
                </label>
                <div className="space-y-2">
                    {UNSUBSCRIBE_REASONS.map((reason) => (
                        <label
                            key={reason.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedReason === reason.id
                                    ? "border-accent-coral bg-accent-coral/5 shadow-lg shadow-accent-coral/10"
                                    : "border-border hover:border-accent-coral/30 hover:bg-muted/50"
                                }`}
                        >
                            <input
                                type="radio"
                                name="reason"
                                value={reason.id}
                                checked={selectedReason === reason.id}
                                onChange={() => setSelectedReason(reason.id)}
                                className="sr-only"
                            />
                            <span className="text-2xl">{reason.emoji}</span>
                            <span className="flex-1">{reason.label}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedReason === reason.id
                                    ? "border-accent-coral bg-accent-coral"
                                    : "border-muted-foreground/30"
                                }`}>
                                {selectedReason === reason.id && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Custom Reason Input */}
            {selectedReason === "other" && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="block font-medium mb-2">Lütfen biraz daha anlatın:</label>
                    <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Geri bildiriminiz iletişimimizi geliştirmemize yardımcı olur..."
                        className="input-field w-full min-h-[120px] resize-none"
                        required={selectedReason === "other"}
                    />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !selectedReason || (selectedReason === "other" && !customReason.trim())}
                className="w-full py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 
                    text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        İşleniyor...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <HeartCrack size={18} />
                        Abonelikten Çıkmayı Onayla
                    </span>
                )}
            </button>

            {/* Stay Subscribed Option */}
            <div className="text-center pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <Heart size={16} className="text-pink-500" />
                    <span className="text-sm">Fikriniz mi değişti?</span>
                </div>
                <a
                    href="/"
                    className="text-accent-coral hover:underline font-medium"
                >
                    Beni siteye geri götür
                </a>
            </div>
        </form>
    );
}
