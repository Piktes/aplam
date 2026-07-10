import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-logger";
import { verifyTotp, consumeBackupCode } from "@/lib/totp";
import type { AuthOptions } from "next-auth";

// Helper to get first value from potentially comma-separated header (LiteSpeed/proxy fix)
function first(v: string | null | undefined) {
    return v ? String(v).split(",")[0].trim() : "";
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                otp: { label: "Doğrulama Kodu", type: "text" },
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    // Find user in database
                    const user = await prisma.adminUser.findUnique({
                        where: { username: credentials.username },
                    });

                    if (!user || !user.isActive) {
                        // Log failed login attempt
                        await logAdminAction(
                            credentials.username,
                            "LOGIN_FAILED",
                            `Failed login attempt - User not found or inactive`,
                            { level: "WARN" }
                        );
                        return null;
                    }

                    // Verify password with bcrypt
                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        user.passwordHash
                    );

                    if (!isValidPassword) {
                        // Log failed login attempt
                        await logAdminAction(
                            credentials.username,
                            "LOGIN_FAILED",
                            `Failed login attempt - Invalid password`,
                            { level: "WARN" }
                        );
                        return null;
                    }

                    // 2FA (TOTP) — etkinse şifreden SONRA kod zorunlu.
                    // Hata mesajları login sayfasında adım/uyarı olarak yakalanır.
                    if (user.totpEnabled && user.totpSecret) {
                        const otp = (credentials.otp || "").trim();
                        if (!otp) {
                            throw new Error("2FA_REQUIRED");
                        }
                        if (!verifyTotp(user.totpSecret, otp)) {
                            // TOTP tutmadı → tek kullanımlık yedek kod dene
                            const remaining = consumeBackupCode(user.backupCodes, otp);
                            if (remaining === null) {
                                await logAdminAction(
                                    credentials.username,
                                    "LOGIN_FAILED",
                                    `Failed login attempt - Invalid 2FA code`,
                                    { level: "WARN" }
                                );
                                throw new Error("2FA_INVALID");
                            }
                            // Yedek kod kullanıldı → listeden düş
                            await prisma.adminUser.update({
                                where: { id: user.id },
                                data: { backupCodes: remaining },
                            });
                            await logAdminAction(
                                user.username,
                                "LOGIN_2FA_BACKUP",
                                `Login with backup code (${JSON.parse(remaining).length} left)`,
                                { userId: user.id, level: "WARN" }
                            );
                        }
                    }

                    // Update last login time
                    await prisma.adminUser.update({
                        where: { id: user.id },
                        data: { lastLoginAt: new Date() },
                    });

                    // Log successful login
                    await logAdminAction(
                        user.username,
                        "LOGIN_SUCCESS",
                        `User logged in successfully`,
                        { userId: user.id, level: "INFO" }
                    );

                    // Return user object for session
                    return {
                        id: user.id.toString(),
                        name: user.username,
                        email: user.email || `${user.username}@admin.local`,
                        role: user.role,
                        totpEnabled: user.totpEnabled,
                    } as any;
                } catch (error) {
                    // 2FA akış hataları login sayfasına ulaşmalı — yutma
                    if (
                        error instanceof Error &&
                        (error.message === "2FA_REQUIRED" || error.message === "2FA_INVALID")
                    ) {
                        throw error;
                    }
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 60 minutes (1 hour)
    },
    callbacks: {
        // Redirect callback fix for reverse proxy / LiteSpeed header duplication
        async redirect({ url, baseUrl }) {
            // baseUrl can sometimes come as "https://a, https://a" -> take first
            const safeBase = first(baseUrl) || process.env.NEXTAUTH_URL || "https://begumatak.com";

            // Relative redirect
            if (url.startsWith("/")) return `${safeBase}${url}`;

            // Absolute redirect: only allow same origin
            try {
                const u = new URL(url);
                const b = new URL(safeBase);
                return u.origin === b.origin ? url : safeBase;
            } catch {
                return safeBase;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.username = user.name;
                // middleware bu claim ile 2FA kurulumuna zorlar; kurulum
                // tamamlanınca kullanıcı yeniden giriş yapar (claim tazelenir)
                token.totpEnabled = (user as any).totpEnabled === true;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).username = token.username;
            }
            return session;
        },
    },
    events: {
        async signOut({ token }) {
            // Log logout
            if (token?.username) {
                await logAdminAction(
                    token.username as string,
                    "LOGOUT",
                    `User logged out`,
                    { userId: parseInt(token.id as string), level: "INFO" }
                );
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
