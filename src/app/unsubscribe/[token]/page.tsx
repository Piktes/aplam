import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Music2, AlertTriangle, CheckCircle, HeartCrack } from "lucide-react";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = {
    title: "Abonelikten Çık | Begüm Atak",
    description: "E-posta listemizden abonelikten çıkın",
};

async function getSubscriber(token: string) {
    return prisma.subscriber.findFirst({
        where: {
            unsubscribeToken: token,
        },
    });
}

// Server action for unsubscribe
async function processUnsubscribe(formData: FormData) {
    "use server";
    const token = formData.get("token") as string;
    const reason = formData.get("reason") as string;

    const subscriber = await prisma.subscriber.findFirst({
        where: { unsubscribeToken: token },
    });

    if (!subscriber) {
        return { success: false, error: "Geçersiz veya süresi dolmuş abonelikten çıkma bağlantısı" };
    }

    if (!subscriber.isActive) {
        return { success: false, error: "Zaten abonelikten çıkmışsınız" };
    }

    await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
            isActive: false,
            unsubscribeReason: reason || null,
            unsubscribedAt: new Date(),
        },
    });

    revalidatePath(`/unsubscribe/${token}`);
    return { success: true };
}

export default async function UnsubscribePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const subscriber = await getSubscriber(token);

    // If no valid subscriber found with this token
    if (!subscriber) {
        return (
            <div className="min-h-screen gradient-warm-bg grain flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
                    <h1 className="font-display text-2xl mb-2">Geçersiz Bağlantı</h1>
                    <p className="text-muted-foreground">
                        Bu abonelikten çıkma bağlantısı geçersiz veya süresi dolmuş.
                    </p>
                    <a
                        href="/"
                        className="inline-block mt-6 text-accent-coral hover:underline font-medium"
                    >
                        Ana sayfaya git
                    </a>
                </div>
            </div>
        );
    }

    // Check if already unsubscribed
    if (!subscriber.isActive) {
        return (
            <div className="min-h-screen gradient-warm-bg grain flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                    <h1 className="font-display text-2xl mb-2">Zaten Abonelikten Çıkmışsınız</h1>
                    <p className="text-muted-foreground mb-2">
                        E-posta listemizden zaten abonelikten çıkmışsınız.
                    </p>
                    {subscriber.unsubscribedAt && (
                        <p className="text-xs text-muted-foreground">
                            Çıkış tarihi: {new Date(subscriber.unsubscribedAt).toLocaleDateString("tr-TR")}
                        </p>
                    )}
                    <div className="mt-6 p-4 rounded-xl bg-accent-coral/5 border border-accent-coral/10">
                        <p className="text-sm text-muted-foreground">
                            Fikriniz mi değişti? İstediğiniz zaman{" "}
                            <a href="/" className="text-accent-coral hover:underline font-medium">
                                ana sayfadan
                            </a>
                            {" "}tekrar abone olabilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-warm-bg grain flex items-center justify-center p-4">
            <div className="glass-card p-6 sm:p-8 max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-accent-coral/20 blur-2xl rounded-full" />
                        <Music2 className="relative mx-auto text-accent-coral" size={48} />
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl mb-2">
                        Sizi Özleyeceğiz
                    </h1>
                    <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">{subscriber.email}</span>
                    </p>
                </div>

                {/* Unsubscribe Form */}
                <UnsubscribeForm
                    token={token}
                    processUnsubscribeAction={processUnsubscribe}
                />
            </div>
        </div>
    );
}
