"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Tag, Link as LinkIcon, Save, Loader2 } from "lucide-react";
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop";
import { InfoBar } from "@/components/admin/info-bar";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File, croppedDataUrl: string) => {
    setImageData(croppedDataUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Add image data if uploaded
    if (imageData) {
      formData.set("image", imageData);
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ürün oluşturulamadı");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler yanlış gitti");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* InfoBar */}
      <InfoBar />

      <main className="max-w-4xl mx-auto px-4 pb-10">
        <div className="mb-8">
          <h1 className="font-display text-display-md tracking-wider uppercase">Ürün Ekle</h1>
          <p className="text-muted-foreground mt-2">Mağazaya yeni bir ürün ekleyin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
          {/* Product Image - 1:1 Square */}
          <ImageUploadWithCrop
            aspect={1}
            onUpload={handleImageUpload}
            label="Ürün Görseli"
            helpText="Kare görsel önerilir (1:1 en boy oranı, en az 800x800 piksel)"
          />

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              <Package size={16} className="inline mr-2" />
              Ürün Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="örn: Tur Tişörtü - Vintage Siyah"
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Ürün detaylarını, kullanılan malzemeleri, beden bilgilerini açıklayın..."
              className="input-field resize-none"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Fiyat (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                placeholder="45.00"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-2">
                Stok Miktarı
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                defaultValue="100"
                className="input-field"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              <Tag size={16} className="inline mr-2" />
              Kategori
            </label>
            <select
              id="category"
              name="category"
              className="input-field"
              defaultValue="apparel"
            >
              <option value="apparel">Giyim</option>
              <option value="music">Müzik</option>
              <option value="accessories">Aksesuar</option>
              <option value="collectibles">Koleksiyon Ürünleri</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          {/* Buy URL */}
          <div>
            <label htmlFor="buyUrl" className="block text-sm font-medium mb-2">
              <LinkIcon size={16} className="inline mr-2" />
              Satın Alma Bağlantısı *
            </label>
            <input
              type="url"
              id="buyUrl"
              name="buyUrl"
              required
              placeholder="https://shop.begumatak.com/product/..."
              className="input-field"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Harici mağaza bağlantısı (Shopify, Big Cartel vb.)
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked
              className="w-5 h-5 rounded border-border"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Aktif (mağazada görünür)
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Ürün Oluştur
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
