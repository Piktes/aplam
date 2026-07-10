"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Loader2, Drama, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 2FA ikinci adımı: şifre doğruysa ve hesapta TOTP etkinse kod istenir
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        otp,
        redirect: false,
      });

      if (result?.error === "2FA_REQUIRED") {
        // Şifre doğru → doğrulama kodu adımına geç
        setOtpStep(true);
        setOtp("");
        setIsLoading(false);
      } else if (result?.error === "2FA_INVALID") {
        setError("Doğrulama kodu geçersiz. Tekrar deneyin.");
        setOtp("");
        setIsLoading(false);
      } else if (result?.error) {
        setError("Geçersiz kullanıcı adı veya şifre");
        setIsLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grain relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent-coral/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent-peach/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Login Card */}
        <div className="glass-card p-8 md:p-10 rounded-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-coral/10 flex items-center justify-center">
              <Drama size={32} className="text-accent-coral" />
            </div>
            <h1 className="font-display text-2xl tracking-widest uppercase">
              Begüm Atak Yönetim
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Panele erişmek için giriş bilgilerinizi girin
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {otpStep ? (
              /* ---- 2. adım: doğrulama kodu ---- */
              <>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-coral/10 border border-accent-coral/20">
                  <ShieldCheck size={20} className="text-accent-coral shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{username}</span> için
                    authenticator uygulamasındaki 6 haneli kodu girin.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Doğrulama Kodu</label>
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent-coral focus:ring-2 focus:ring-accent-coral/20 outline-none transition-all text-center text-2xl tracking-[0.4em] font-mono"
                    placeholder="••••••"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Telefonunuza erişemiyorsanız yedek kodlardan birini girin (örn. ABCD-EFGH).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Farklı hesapla gir
                </button>
              </>
            ) : (
            <>
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent-coral focus:ring-2 focus:ring-accent-coral/20 outline-none transition-all"
                  placeholder="Kullanıcı adınızı girin"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent-coral focus:ring-2 focus:ring-accent-coral/20 outline-none transition-all"
                  placeholder="Şifrenizi girin"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600 text-white font-medium transition-all hover:brightness-110 shadow-lg shadow-amber-900/20 dark:shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {otpStep ? "Doğrulanıyor..." : "Giriş yapılıyor..."}
                </>
              ) : otpStep ? (
                "Doğrula ve Giriş Yap"
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Korumalı alan. Yetkisiz erişim yasaktır.
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Oturum 60 dakika hareketsizlik sonrası sona erer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
