"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Ticket, Save, Loader2, Send, Mail } from "lucide-react";
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop";
import { AnnouncementPreviewModal } from "@/components/admin/announcement-preview-modal";
import { LocationAutocomplete } from "@/components/admin/location-autocomplete";
import { InfoBar } from "@/components/admin/info-bar";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for conditional validation
  const [isFree, setIsFree] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [sendAnnouncement, setSendAnnouncement] = useState(false);

  // Modal state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  // Location state for autocomplete
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleImageUpload = (file: File, croppedDataUrl: string) => {
    setImageData(croppedDataUrl);
  };

  // Ticket URL is required ONLY if not free AND not sold out
  const isTicketUrlRequired = !isFree && !isSoldOut;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Add image data if uploaded
    if (imageData) {
      formData.set("imageUrl", imageData);
    }

    // If announcement checkbox is checked, show modal instead of saving directly
    if (sendAnnouncement) {
      setPendingFormData(formData);
      setShowAnnouncementModal(true);
      return;
    }

    // Otherwise, save directly
    await saveEvent(formData, false);
  };

  const saveEvent = async (formData: FormData, sendEmail: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
      }

      const eventData = await response.json();

      // If sendEmail is true, trigger announcement
      if (sendEmail && eventData.id) {
        const announcementRes = await fetch("/api/events/send-announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: eventData.id }),
        });

        const announcementData = await announcementRes.json();

        if (!announcementRes.ok) {
          console.error("Announcement failed:", announcementData);
          throw new Error(announcementData.error || "Failed to send announcement emails");
        }

        console.log("Announcement sent successfully:", announcementData);
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setShowAnnouncementModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const handleModalClose = () => {
    setShowAnnouncementModal(false);
    setPendingFormData(null);
  };

  const handleSaveOnly = async () => {
    if (pendingFormData) {
      await saveEvent(pendingFormData, false);
    }
  };

  const handleConfirmAndSend = async () => {
    if (pendingFormData) {
      await saveEvent(pendingFormData, true);
    }
  };

  // Build event preview data for modal
  const getEventPreviewData = () => {
    if (!pendingFormData) return null;

    const dateStr = pendingFormData.get("date") as string;
    const timeStr = pendingFormData.get("time") as string;

    return {
      title: pendingFormData.get("title") as string || "Untitled Event",
      date: dateStr && timeStr ? `${dateStr}T${timeStr}` : new Date().toISOString(),
      venue: pendingFormData.get("venue") as string || "",
      city: pendingFormData.get("city") as string || "",
      country: pendingFormData.get("country") as string || "USA",
      price: pendingFormData.get("price") as string || null,
      description: pendingFormData.get("description") as string || null,
      imageUrl: imageData,
      ticketUrl: pendingFormData.get("ticketUrl") as string || "",
    };
  };

  return (
    <div className="min-h-screen">
      {/* InfoBar */}
      <InfoBar backHref="/admin/events" backLabel="Etkinliklere Dön" />

      <main className="max-w-4xl mx-auto px-4 pb-10">
        <div className="mb-8">
          <h1 className="font-display text-display-md tracking-wider uppercase">Etkinlik Oluştur</h1>
          <p className="text-muted-foreground mt-2">Yeni konser veya turne tarihi ekleyin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
          {/* Event Image */}
          <ImageUploadWithCrop
            aspect={16 / 9}
            onUpload={handleImageUpload}
            label="Etkinlik Afişi / Banner"
            helpText="Önerilen: 1920x1080 piksel (16:9 en boy oranı)"
          />

          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-2" />
              Etkinlik Başlığı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="örn: Eko Turnesi - İstanbul"
              className="input-field"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Tarih *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="input-field"
                onClick={(e) => e.currentTarget.showPicker()}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Saat *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                defaultValue="20:00"
                className="input-field"
                onClick={(e) => e.currentTarget.showPicker()}
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium mb-2">
              <MapPin size={16} className="inline mr-2" />
              Mekan *
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              required
              placeholder="örn: Zorlu PSM"
              className="input-field"
            />
          </div>

          {/* City & Country Autocomplete */}
          <LocationAutocomplete
            onSelect={(city, country) => {
              setSelectedCity(city);
              setSelectedCountry(country);
            }}
          />

          {/* Ticket URL - Conditional Requirement */}
          <div>
            <label htmlFor="ticketUrl" className="block text-sm font-medium mb-2">
              <Ticket size={16} className="inline mr-2" />
              Bilet Bağlantısı {isTicketUrlRequired && <span className="text-accent-coral">*</span>}
            </label>
            <input
              type="url"
              id="ticketUrl"
              name="ticketUrl"
              required={isTicketUrlRequired}
              placeholder="https://ticketmaster.com/..."
              className="input-field"
            />
            {!isTicketUrlRequired && (
              <p className="text-xs text-muted-foreground mt-1">
                Ücretsiz veya biletleri tükenmiş etkinlikler için isteğe bağlıdır
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Açıklama (e-postalar için)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="E-posta bildirimleri için kısa açıklama..."
              className="input-field resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Ücret (isteğe bağlı)
            </label>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="örn: 150 TL - 500 TL"
              className="input-field"
            />
          </div>

          {/* Status Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked
                className="w-5 h-5 rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Aktif (görünür)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-5 h-5 rounded border-border accent-green-500"
              />
              <label htmlFor="isFree" className="text-sm font-medium text-green-600">
                🎉 Ücretsiz Etkinlik
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isSoldOut"
                name="isSoldOut"
                checked={isSoldOut}
                onChange={(e) => setIsSoldOut(e.target.checked)}
                className="w-5 h-5 rounded border-border"
              />
              <label htmlFor="isSoldOut" className="text-sm font-medium">
                Tükendi
              </label>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="border-t border-border pt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <span className="text-accent-coral">⚡</span>
              E-posta Otomasyonu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoReminder"
                  name="autoReminder"
                  defaultChecked
                  className="w-5 h-5 rounded border-border accent-accent-coral"
                />
                <div>
                  <label htmlFor="autoReminder" className="text-sm font-medium">
                    Otomatik Hatırlatıcı
                  </label>
                  <p className="text-xs text-muted-foreground">Etkinlikten 7 gün önce gönderir</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSoldOut"
                  name="autoSoldOut"
                  defaultChecked
                  className="w-5 h-5 rounded border-border accent-accent-coral"
                />
                <div>
                  <label htmlFor="autoSoldOut" className="text-sm font-medium">
                    Otomatik Tükendi Uyarısı
                  </label>
                  <p className="text-xs text-muted-foreground">Biletler tükendiğinde aboneleri bilgilendirir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Send Announcement Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-coral/5 border border-accent-coral/20">
              <input
                type="checkbox"
                id="sendAnnouncement"
                checked={sendAnnouncement}
                onChange={(e) => setSendAnnouncement(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-border accent-accent-coral"
              />
              <div>
                <label htmlFor="sendAnnouncement" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Mail size={16} className="text-accent-coral" />
                  Duyuru E-postası Gönder
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Etkinlik bildirimlerini açmış olan abonelere bu yeni etkinliği duyurur
                </p>
              </div>
            </div>
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
              ) : sendAnnouncement ? (
                <>
                  <Send size={16} />
                  Oluştur ve E-postayı Önizle
                </>
              ) : (
                <>
                  <Save size={16} />
                  Etkinlik Oluştur
                </>
              )}
            </button>
            <Link href="/admin/events" className="btn-secondary">
              İptal
            </Link>
          </div>
        </form>
      </main>

      {/* Announcement Preview Modal */}
      {showAnnouncementModal && pendingFormData && (
        <AnnouncementPreviewModal
          isOpen={showAnnouncementModal}
          onClose={handleModalClose}
          onSaveOnly={handleSaveOnly}
          onConfirmAndSend={handleConfirmAndSend}
          event={getEventPreviewData()!}
        />
      )}
    </div>
  );
}
