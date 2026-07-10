import { TOTP, Secret } from "otpauth";
import bcrypt from "bcryptjs";

// Admin 2FA (TOTP) yardımcıları — yalnız server'da kullan.
// otpauth:// URI standarttır; Microsoft Authenticator, Google Authenticator
// ve benzeri tüm TOTP uygulamalarıyla çalışır.

const ISSUER = "Begum Atak Yonetim"; // bazı uygulamalar Türkçe karakterde sorun çıkarır

function buildTotp(secretBase32: string) {
    return new TOTP({
        issuer: ISSUER,
        secret: Secret.fromBase32(secretBase32),
        algorithm: "SHA1", // authenticator uygulamalarının ortak varsayılanı
        digits: 6,
        period: 30,
    });
}

export function generateTotpSecret(): string {
    return new Secret({ size: 20 }).base32;
}

export function totpUri(username: string, secretBase32: string): string {
    const totp = buildTotp(secretBase32);
    totp.label = username;
    return totp.toString();
}

export function verifyTotp(secretBase32: string, code: string): boolean {
    const token = (code || "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(token)) return false;
    // window:1 → saat kayması için ±30 sn tolerans
    return buildTotp(secretBase32).validate({ token, window: 1 }) !== null;
}

// ---- Tek kullanımlık yedek kodlar ----

const BACKUP_CODE_COUNT = 8;
// Karışması kolay karakterler (0/O, 1/I/L) bilerek yok
const BACKUP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomBackupCode(): string {
    let raw = "";
    for (let i = 0; i < 8; i++) {
        raw += BACKUP_ALPHABET[Math.floor(Math.random() * BACKUP_ALPHABET.length)];
    }
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export function generateBackupCodes(): { plain: string[]; hashedJson: string } {
    const plain = Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
    const hashed = plain.map((c) => bcrypt.hashSync(normalizeBackupCode(c), 10));
    return { plain, hashedJson: JSON.stringify(hashed) };
}

function normalizeBackupCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Eşleşirse kullanılan kod listeden düşülmüş yeni JSON döner; eşleşmezse null.
export function consumeBackupCode(hashedJson: string | null | undefined, code: string): string | null {
    if (!hashedJson) return null;
    let hashes: string[];
    try {
        hashes = JSON.parse(hashedJson);
    } catch {
        return null;
    }
    const normalized = normalizeBackupCode(code);
    if (normalized.length !== 8) return null;
    const idx = hashes.findIndex((h) => bcrypt.compareSync(normalized, h));
    if (idx === -1) return null;
    hashes.splice(idx, 1);
    return JSON.stringify(hashes);
}
