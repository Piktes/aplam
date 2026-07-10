import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";
import { generateTotpSecret, totpUri, verifyTotp, generateBackupCodes } from "@/lib/totp";
import { logAdminAction } from "@/lib/audit-logger";

// Admin 2FA kurulum uçları.
// init    → yeni secret üretir, QR döner (totpEnabled=false'a çeker; kurulum
//           yarım kalırsa middleware kullanıcıyı yine kuruluma zorlar)
// confirm → authenticator kodunu doğrular, 2FA'yı etkinleştirir ve tek
//           kullanımlık yedek kodları BİR KEZ döndürür.

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id, 10);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action, code } = await request.json();

        const user = await prisma.adminUser.findUnique({ where: { id: userId } });
        if (!user || !user.isActive) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (action === "init") {
            const secret = generateTotpSecret();
            await prisma.adminUser.update({
                where: { id: user.id },
                data: { totpSecret: secret, totpEnabled: false, backupCodes: null },
            });

            const uri = totpUri(user.username, secret);
            const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240 });

            return NextResponse.json({ qrDataUrl, secret, uri });
        }

        if (action === "confirm") {
            if (!user.totpSecret) {
                return NextResponse.json({ error: "Önce kurulum başlatılmalı" }, { status: 400 });
            }
            if (!verifyTotp(user.totpSecret, code || "")) {
                return NextResponse.json({ error: "Kod geçersiz" }, { status: 400 });
            }

            const backup = generateBackupCodes();
            await prisma.adminUser.update({
                where: { id: user.id },
                data: { totpEnabled: true, backupCodes: backup.hashedJson },
            });

            await logAdminAction(
                user.username,
                "2FA_ENABLED",
                "Two-factor authentication enabled (TOTP)",
                { userId: user.id, level: "INFO" }
            );

            // Yedek kodlar yalnız bu cevapta düz metin döner
            return NextResponse.json({ success: true, backupCodes: backup.plain });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("2FA setup error:", error);
        return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
    }
}
