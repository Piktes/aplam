"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Loader2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop";
import { SocialIcon } from "@/components/social-icons";
import { InfoBar } from "@/components/admin/info-bar";

// ========================================
// TYPES
// ========================================
interface BioData {
  content: string;
  imageUrl: string;
  isActive: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  isVisible: boolean;
  sortOrder: number;
}

// Default platforms to ensure UI shows all options
const DEFAULT_PLATFORMS = [
  'facebook', 'instagram', 'tiktok', 'youtube', 'spotify', 'appleMusic', 'soundcloud', 'twitter', 'imdb'
];

export default function SettingsPage() {
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data State
  const [bio, setBio] = useState<BioData>({ content: "", imageUrl: "", isActive: true });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Notification State (Toast)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ========================================
  // FETCH DATA
  // ========================================
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Bio
        const bioRes = await fetch("/api/admin/bio");
        if (bioRes.ok) {
          const { data } = await bioRes.json();
          if (data) {
            setBio({
              content: data.content || "",
              imageUrl: data.imageUrl || "",
              isActive: data.isActive ?? true
            });
          }
        }

        // Fetch Social Media
        const socialRes = await fetch("/api/admin/social-media");
        if (socialRes.ok) {
          const { data } = await socialRes.json();

          // Merge with default platforms to ensure fields exist
          const existingLinks = Array.isArray(data) ? data : [];

          const mergedLinks = DEFAULT_PLATFORMS.map((platform, index) => {
            const existing = existingLinks.find((l: any) => l.platform === platform);
            return existing ? {
              ...existing,
              platform // ensure platform string is correct
            } : {
              platform,
              url: "",
              isVisible: true,
              sortOrder: index
            };
          });
          setSocialLinks(mergedLinks);
        }

      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setToast({ type: "error", message: "Ayarlar yüklenemedi. Lütfen sayfayı yenileyin." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // ========================================
  // HANDLERS
  // ========================================
  const handleBioChange = (key: keyof BioData, value: any) => {
    setBio(prev => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: any) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSocialLinks(newLinks);
  };

  const handleHeroImageUpload = (file: File, dataUrl: string) => {
    // Optimistic update
    setBio(prev => ({ ...prev, imageUrl: dataUrl }));
    // We will stick to the previous pattern: upload on submit if changed.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      // 1. Upload Bio Image if needed
      let finalImageUrl = bio.imageUrl;
      if (bio.imageUrl && bio.imageUrl.startsWith("data:image")) {
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: bio.imageUrl, folder: "bio" }),
        });

        if (!uploadRes.ok) throw new Error("Biyografi görseli yüklenemedi");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      // 2. Save Bio
      const saveBioRes = await fetch("/api/admin/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bio, imageUrl: finalImageUrl }),
      });
      const bioResult = await saveBioRes.json();
      if (!bioResult.success && saveBioRes.status !== 200) { // Check status too
        throw new Error(bioResult.error || "Biyografi kaydedilemedi");
      }

      // 3. Save Social Media
      const saveSocialRes = await fetch("/api/admin/social-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: socialLinks }),
      });
      const socialResult = await saveSocialRes.json();
      if (!socialResult.success && saveSocialRes.status !== 200) {
        throw new Error(socialResult.error || "Sosyal medya bağlantıları kaydedilemedi");
      }

      setToast({ type: "success", message: "Ayarlar başarıyla kaydedildi!" });
      router.refresh();

    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Ayarlar kaydedilemedi"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-warm-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-coral" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* InfoBar */}
      <InfoBar />

      {/* TOAST NOTIFICATION (Fixed Overlay) */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${toast.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
          }`}>
          {toast.type === "success" ? <CheckCircle size={24} /> : <XCircle size={24} />}
          <p className="font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 opacity-80 hover:opacity-100">
            <XCircle size={16} />
          </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pb-10">
        <div className="mb-8">
          <h1 className="font-display text-display-md tracking-wider uppercase">Ayarlar</h1>
          <p className="text-muted-foreground mt-2">Biyografinizi ve Sosyal Medya Bağlantılarınızı Yönetin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* --- BIO SECTION --- */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="text-accent-coral" size={24} />
              <h2 className="font-display text-2xl tracking-wide">Biyografi</h2>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <ImageUploadWithCrop
                aspect={1}
                currentImage={bio.imageUrl || null}
                onUpload={handleHeroImageUpload}
                label="Profil / Biyografi Görseli"
                helpText="Hakkında bölümünde görünür. Yüksek kalite önerilir."
                maxWidth={800}
              />

              {/* Bio Text */}
              <div>
                <label className="block text-sm font-medium mb-2">Biyografi Metni</label>
                <textarea
                  value={bio.content}
                  onChange={(e) => handleBioChange("content", e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Hikayenizi buraya yazın..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Bu metin web sitenizin ana sayfasında gösterilecektir.
                </p>
              </div>
            </div>
          </div>

          {/* --- SOCIAL MEDIA SECTION --- */}
          <div className="glass-card p-8">
            <h2 className="font-display text-2xl tracking-wide mb-6">Sosyal Medya Bağlantıları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialLinks.map((link, index) => (
                <div key={link.platform}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium capitalize">
                      <SocialIcon platform={link.platform as any} size={16} />
                      {link.platform === 'appleMusic' ? 'Apple Music' : link.platform === 'imdb' ? 'IMDb' : link.platform}
                    </label>

                    {/* Toggle Visibility */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {link.isVisible ? "Görünür" : "Gizli"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSocialChange(index, "isVisible", !link.isVisible)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${link.isVisible ? "bg-accent-coral" : "bg-muted"
                          }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${link.isVisible ? "translate-x-4" : "translate-x-0"
                          }`} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                    className="input-field"
                    placeholder={`https://${link.platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- SUBMIT ACTIONS --- */}
          <div className="flex items-center gap-4 sticky bottom-6 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 flex-1 justify-center md:flex-none"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Tüm Ayarları Kaydet
                </>
              )}
            </button>
            <Link href="/admin" className="btn-secondary">
              İptal
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
}
