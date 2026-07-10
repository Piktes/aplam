import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { ScrollReveal } from "@/components/scroll-reveal";
import { publicV2FontVars } from "@/lib/fonts-v2";
import { HERO_FONTS } from "@/lib/hero-fonts";
import { sanitizeHeroHtml } from "@/lib/sanitize-hero";
import { HERO_DEFAULTS, asHeroFont, asHeroSize, asHeroPosition } from "@/lib/hero-text";
import {
  HERO_POSITION_CLASSES,
  HERO_TITLE_SIZE_CLASSES,
  HERO_SUBTITLE_SIZE_CLASSES,
} from "@/components/hero-text-config";
import { SocialLinksRow } from "@/components/social-icons";
import { SocialAccordion } from "@/components/social-accordion";
import { HeroAudioPlayer } from "@/components/hero-audio-player";
import { HeroSlider } from "@/components/hero-slider";
import { YouTubeCarousel } from "@/components/youtube-carousel";
import { BioSection } from "@/components/bio-section";
import { SpecialEventPopup } from "@/components/special-event-popup";
import { GalleryStack } from "@/components/gallery-stack";
import { ContactForm } from "@/components/contact-form";
import { NewsletterForm } from "@/components/newsletter-form";
// import { JsonLd } from "@/components/json-ld"; // Temporarily disabled or needs refactoring
import { VisitorTracker } from "@/components/visitor-tracker";
import {
  ArrowRight, Mail, MessageCircle, Calendar, Sparkles, Music2, MapPin
} from "lucide-react";

export const revalidate = 60;

// ========================================
// DATA FETCHING
// ========================================
async function getSiteSettings() {
  return await prisma.siteSettings.findFirst();
}

async function getBio() {
  return await prisma.bio.findFirst({
    include: {
      images: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });
}

async function getSocialLinks() {
  return await prisma.socialMedia.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" }
  });
}

async function getHeroImages() {
  return await prisma.heroImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });
}

async function getActiveTracks() {
  return await prisma.track.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

async function getActiveVideos() {
  return await prisma.video.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

async function getUpcomingEvents() {
  return await prisma.event.findMany({
    where: { isActive: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 6,
  });
}

async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getGalleryImages() {
  return await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

async function getActiveSpecialEvent() {
  const now = new Date();
  return await prisma.specialEvent.findFirst({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
  });
}

export default async function Home() {
  const [
    settings, bio, socialLinks, heroImages,
    tracks, videos, events, products, galleryImages, specialEvent
  ] = await Promise.all([
    getSiteSettings(), getBio(), getSocialLinks(), getHeroImages(),
    getActiveTracks(), getActiveVideos(), getUpcomingEvents(),
    getProducts(), getGalleryImages(), getActiveSpecialEvent(),
  ]);

  const artistName = "Begüm Atak"; // Hardcoded for now as requested for Single Artist

  // ========================================
  // HERO KAPAK METNİ (admin panelden). Üç durum:
  //   null  = hiç ayarlanmadı → eski hardcoded metin (fallback)
  //   ""    = admin bilerek boş bıraktı → o metin hiç gösterilmez
  //   dolu  = özel içerik render edilir
  // HTML DB'de sanitize edilmiş olsa da render'da tekrar sanitize edilir;
  // renk stilleri her durumda atılır, renk temadan gelir.
  // ========================================
  const heroTitleSet = settings?.heroTitle != null;
  const heroSubtitleSet = settings?.heroSubtitle != null;
  const heroTitleHtml = heroTitleSet ? sanitizeHeroHtml(settings!.heroTitle) : null;
  const heroSubtitleHtml = heroSubtitleSet ? sanitizeHeroHtml(settings!.heroSubtitle) : null;
  const heroTitleFont = asHeroFont(settings?.heroTitleFont) ?? HERO_DEFAULTS.titleFont;
  const heroSubtitleFont = asHeroFont(settings?.heroSubtitleFont) ?? HERO_DEFAULTS.subtitleFont;
  const heroTitleSize = asHeroSize(settings?.heroTitleSize) ?? HERO_DEFAULTS.titleSize;
  const heroSubtitleSize = asHeroSize(settings?.heroSubtitleSize) ?? HERO_DEFAULTS.subtitleSize;
  const heroPosition = asHeroPosition(settings?.heroTextPosition);
  const heroPos = HERO_POSITION_CLASSES[heroPosition];
  const heroPosIsCenter = heroPosition === "tam-orta";

  // Konumlanan katman bu bloğu içerir: "Sosyal Medya" akordeonu metnin biraz
  // üzerinde durur ve metinle birlikte konumlanır.
  const heroTextContent = (
    <>
      {settings?.isSocialLinksVisible && (
        <div className="opacity-0 animate-fade-in animate-delay-300 mb-6 pointer-events-auto">
          <SocialAccordion links={socialLinks} size={18} />
        </div>
      )}
      {heroTitleHtml ? (
        /* Özel metin: font inline style ile yalnız buraya uygulanır; renk
           sınıfı YOK — .public-v2 tema değişkeninden (foreground) gelir */
        <h1
          className={`opacity-0 animate-fade-in animate-delay-100 font-display tracking-widest normal-case ${HERO_TITLE_SIZE_CLASSES[heroTitleSize]}`}
          style={{ fontFamily: HERO_FONTS[heroTitleFont].fontFamily }}
          dangerouslySetInnerHTML={{ __html: heroTitleHtml }}
        />
      ) : !heroTitleSet ? (
        <h1 className="opacity-0 animate-fade-in animate-delay-100 font-display text-display-xl tracking-widest normal-case">
          {artistName}
        </h1>
      ) : null}
      {/* Alt metin rengi temadan gelir (foreground %80) — açık/koyu geçişinde
          başlık gibi kendiliğinden uyum sağlar (eski sabit text-white/80 kaldırıldı) */}
      {heroSubtitleHtml ? (
        <p
          className={`opacity-0 animate-fade-in animate-delay-200 mt-8 text-[hsl(var(--foreground)/0.8)] max-w-2xl leading-relaxed ${HERO_SUBTITLE_SIZE_CLASSES[heroSubtitleSize]}`}
          style={{ fontFamily: HERO_FONTS[heroSubtitleFont].fontFamily }}
          dangerouslySetInnerHTML={{ __html: heroSubtitleHtml }}
        />
      ) : !heroSubtitleSet ? (
        <p className="opacity-0 animate-fade-in animate-delay-200 mt-8 text-xl md:text-2xl text-[hsl(var(--foreground)/0.8)] max-w-2xl leading-relaxed font-serif italic">
          Tiyatro sahnesinden ekrana uzanan bir yolculuk
        </p>
      ) : null}
    </>
  );

  // ========================================
  // DYNAMIC SECTION COLORING
  // ========================================
  const visibleSections = [
    { id: 'hero', visible: true },
    { id: 'concerts', visible: true },
    { id: 'videos', visible: (settings?.isYoutubeVisible ?? true) && videos.length > 0 },
    { id: 'shop', visible: (settings?.isShopVisible ?? true) && products.length > 0 },
    { id: 'gallery', visible: galleryImages.length > 0 },
    { id: 'about', visible: true },
    { id: 'contact', visible: true },
    { id: 'newsletter', visible: true },
  ].filter(s => s.visible);

  const getSectionBg = (sectionId: string) => {
    const idx = visibleSections.findIndex(s => s.id === sectionId);
    const len = visibleSections.length;
    if (idx <= 1) return 'gradient-warm-bg';
    if (idx === len - 1) return '';
    return (idx % 2 === 0) ? '' : 'gradient-warm-bg';
  };

  const spotifyLink = socialLinks.find(l => l.platform.toLowerCase().includes('spotify'))?.url;

  return (
    <main className={`public-v2 ${publicV2FontVars} relative grain`}>
      {/* <JsonLd artist={artist} /> */}
      <SpecialEventPopup event={specialEvent} />
      <VisitorTracker />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-2 py-1 md:px-4 md:py-2 opacity-0 animate-fade-in">
        <div className="max-w-7xl mx-auto flex justify-center">
          {/* min-h-12: mobilde linkler gizli olduğundan pill büzüşür ve absolute
              konumlu butonlar üstten taşıp kesilir — minimum yükseklik şart */}
          <div className="rounded-full px-6 py-1.5 md:px-8 md:py-2 min-h-12 md:min-h-0 flex items-center justify-center w-full max-w-5xl mx-auto bg-transparent border-none shadow-none md:backdrop-blur-xl md:border md:border-[#D8A48F]/25 md:bg-[#FDF8F4]/75 md:shadow-lg dark:md:bg-[#382B2B]/85 dark:md:border-[#D8A48F]/15 transition-all duration-300 relative">

            <div className="hidden md:flex items-center gap-8">
              <Link href="#concerts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Etkinlikler</Link>
              {settings?.isYoutubeVisible && videos.length > 0 && <Link href="#videos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Videolar</Link>}
              {settings?.isShopVisible && products.length > 0 && <Link href="#shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Mağaza</Link>}
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Hakkında</Link>
              <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">İletişim</Link>
              <Link href="/press-kit" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Basın Kiti</Link>
            </div>
            {/* transform kullanma: içindeki fixed çekmece/backdrop viewport yerine
                bu kutuya bağlanır (transform'lu ata fixed'in çapası olur) */}
            <div className="md:hidden absolute left-2 inset-y-0 flex items-center">
              <MobileNav artistName={artistName} showVideos={settings?.isYoutubeVisible} showShop={settings?.isShopVisible} />
            </div>
            <div className="flex items-center absolute right-2 md:right-4 inset-y-0">
              <div className="scale-75 md:scale-100 origin-right">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section — konum seçimi YALNIZ metni (başlık+alt metin) taşır;
          butonlar / sosyal ikonlar / oynatıcı her zaman ortada sabittir.
          tam-orta'da metin ve aksiyonlar eskisi gibi tek ortalanmış kolondadır. */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-warm-bg">
        <HeroSlider
          images={heroImages}
          fallbackImage={bio?.imageUrl || ""} // Fallback to Bio image if no hero images
          interval={settings?.heroSliderInterval || 5000}
          kenBurnsEffect={settings?.heroKenBurnsEffect ?? true}
        />
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent-coral/20 rounded-full blur-3xl animate-float z-10" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent-peach/20 rounded-full blur-3xl animate-float z-10" style={{ animationDelay: "3s" }} />

        {!heroPosIsCenter && (
          /* Metin bloğu seçilen konumda ayrı bir katmanda; pointer-events-none
             ile alttaki içeriğe tıklamayı engellemez */
          <div className={`absolute inset-0 z-30 flex pointer-events-none ${heroPos.flex} ${heroPos.pad}`}>
            <div className={`px-6 max-w-5xl flex flex-col ${heroPos.block}`}>
              {heroTextContent}
            </div>
          </div>
        )}

        <div className="relative z-30 text-center px-6 max-w-5xl flex flex-col items-center">
          {heroPosIsCenter && heroTextContent}
          {/* "Etkinlikleri Gör" CTA'sı şimdilik yayından kaldırıldı — geri almak
              için aşağıdaki yorumu açman yeterli:
          <a href="#concerts" className="btn-primary btn-hero-glass">Etkinlikleri Gör</a>
          */}
          {spotifyLink && (
            <div className="opacity-0 animate-fade-in animate-delay-300 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={spotifyLink} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                <Music2 size={18} /> Şimdi Dinle
              </a>
            </div>
          )}
          <HeroAudioPlayer tracks={tracks} isVisible={settings?.isAudioPlayerVisible ?? true} />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in animate-delay-600 z-30">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Concerts */}
      <section id="concerts" className={`section-padding px-6 ${getSectionBg('concerts')}`}>
        <ScrollReveal className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase text-accent-coral mb-4">
              <Calendar size={16} /> Sahne ve Etkinlikler
            </span>
            <h2 className="font-display text-display-lg tracking-wider uppercase">Yaklaşan Etkinlikler</h2>
          </div>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, index) => (
                <ScrollReveal key={event.id} delay={index * 100}>
                  <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover-lift">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[80px]">
                      <div className="font-display text-4xl md:text-5xl leading-none tracking-wide">{new Date(event.date).getDate()}</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">{new Date(event.date).toLocaleDateString("tr-TR", { month: "short", year: "numeric" })}</div>
                    </div>
                    <div className="hidden md:block w-px h-16 bg-border" />
                    <div>
                      <h3 className="font-display text-xl md:text-2xl tracking-wide">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-muted-foreground">
                        <span className="flex items-center gap-1.5"><MapPin size={14} />{event.venue}</span>
                        <span>{event.city}, {event.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Priority 1: Sold Out */}
                    {event.isSoldOut ? (
                      <span className="px-6 py-3 rounded-full text-sm font-medium bg-muted text-muted-foreground">TÜKENDİ</span>
                    ) : /* Priority 2: Free Event */ event.isFree ? (
                      <span className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-accent-coral via-accent-peach to-accent-coral bg-clip-text text-transparent animate-pulse">
                        Ücretsiz :)
                      </span>
                    ) : /* Priority 3: Standard Ticket Button */ (
                      <a href={event.ticketUrl || "#"} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">Bilet Al <ArrowRight size={16} /></a>
                    )}
                  </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <Calendar className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-xl text-muted-foreground font-serif">Yaklaşan etkinlik bulunmuyor</p>
              <p className="text-muted-foreground mt-2">Yeni tarihler için yakında tekrar bakın!</p>
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Videos */}
      <ScrollReveal>
        <YouTubeCarousel videos={videos} autoScrollInterval={settings?.youtubeScrollInterval || 2000} isVisible={settings?.isYoutubeVisible ?? true} className={getSectionBg('videos')} />
      </ScrollReveal>

      {/* Shop */}
      {settings?.isShopVisible && products.length > 0 && (
        <section id="shop" className={`section-padding px-6 ${getSectionBg('shop')}`}>
          <ScrollReveal className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase text-accent-coral mb-4">
                <Sparkles size={16} /> Resmi Ürünler
              </span>
              <h2 className="font-display text-display-lg tracking-wider uppercase">Mağaza</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 100}>
                  <a href={product.buyUrl} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="glass-card overflow-hidden hover-lift">
                    <div className="aspect-square relative img-zoom">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 btn-primary text-sm">Ürünü Gör</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{product.category}</span>
                      <h3 className="font-display text-lg mt-1 tracking-wide group-hover:text-accent-coral transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-medium">{formatPrice(product.price.toString())}</span>
                        {product.stock < 50 && <span className="text-xs text-accent-coral">Son Ürünler</span>}
                      </div>
                    </div>
                  </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <ScrollReveal>
          <GalleryStack images={galleryImages} className={getSectionBg('gallery')} />
        </ScrollReveal>
      )}

      {/* About (Bio) */}
      <ScrollReveal>
        <BioSection
          artist={{
            name: artistName,
            bio: bio?.content || "",
          }}
          bioImages={bio?.images || []}
          className={getSectionBg('about')}
        />
      </ScrollReveal>

      {/* Contact */}
      <section id="contact" className={`section-padding px-6 ${getSectionBg('contact')}`}>
        <ScrollReveal className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-accent-coral mb-4 block">İletişime Geçin</span>
              <h2 className="font-display text-display-lg tracking-wider uppercase mb-6">Mesaj Gönderin</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">Bir sorunuz mu var, iş birliği mi yapmak istiyorsunuz ya da sadece merhaba mı demek istiyorsunuz? Formu doldurun, size geri dönelim.</p>
              <div className="space-y-4">
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-coral/10 flex items-center justify-center"><Mail className="text-accent-coral" size={20} /></div>
                  <div><p className="text-sm text-muted-foreground">E-posta</p><p className="font-medium">iletisim@begumatak.com</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-coral/10 flex items-center justify-center"><MessageCircle className="text-accent-coral" size={20} /></div>
                  <div><p className="text-sm text-muted-foreground">Menajerlik</p><p className="font-medium">info@begumatak.com</p></div>
                </div>
              </div>
              {settings?.isSocialLinksVisible && (<div className="mt-8"><p className="text-sm text-muted-foreground mb-4">Sosyal medyada takip edin</p><SocialLinksRow links={socialLinks} size={18} /></div>)}
            </div>
            <ContactForm
              successImage={settings?.contactSuccessImage}
              successTitle={settings?.contactSuccessTitle}
              successMessage={settings?.contactSuccessMessage}
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className={`section-padding px-6 ${getSectionBg('newsletter')}`}>
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-10 md:p-16 rounded-[2.5rem]">
            <Mail className="mx-auto text-accent-coral mb-6" size={48} />
            <h2 className="font-display text-display-md tracking-wider uppercase">Haberdar Olun</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">Yeni projelerden, oyunlardan ve etkinlik duyurularından ilk siz haberdar olun.</p>
            <NewsletterForm
              successImage={settings?.subscribeSuccessImage}
              successTitle={settings?.subscribeSuccessTitle}
              successMessage={settings?.subscribeSuccessMessage}
            />
            <p className="mt-6 text-sm text-muted-foreground">Asla spam yok. İstediğiniz zaman abonelikten çıkabilirsiniz.</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border">
        <ScrollReveal className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Link href="/" className="hover:opacity-70 transition-opacity flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-foreground/10 bg-white/50 flex items-center justify-center">
                  <Image src="/logo-dark.png" alt="Logo" width={40} height={40} className="object-cover dark:hidden scale-[2.0]" />
                  <Image src="/logo-light.png" alt="Logo" width={40} height={40} className="object-cover hidden dark:block scale-[2.0]" />
                </div>
                <span className="font-display text-2xl sm:text-3xl tracking-widest uppercase">{artistName}</span>
              </Link>
              <p className="mt-4 text-muted-foreground max-w-sm">Tiyatro sahnesinden ekrana uzanan bir yolculuk. Oyunlar, etkinlikler ve daha fazlası.</p>
              {settings?.isSocialLinksVisible && (<div className="mt-6"><SocialLinksRow links={socialLinks} size={18} /></div>)}
            </div>
            <div>
              <h4 className="font-display text-sm tracking-wider uppercase mb-4">Hızlı Bağlantılar</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#concerts" className="hover:text-foreground transition-colors">Etkinlikler</Link></li>
                {settings?.isYoutubeVisible && videos.length > 0 && <li><Link href="#videos" className="hover:text-foreground transition-colors">Videolar</Link></li>}
                {settings?.isShopVisible && <li><Link href="#shop" className="hover:text-foreground transition-colors">Mağaza</Link></li>}
                <li><Link href="#about" className="hover:text-foreground transition-colors">Hakkında</Link></li>
                <li><Link href="#contact" className="hover:text-foreground transition-colors">İletişim</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {artistName}. Tüm hakları saklıdır.</p>
            <p className="font-script text-lg text-accent-peach">Sanat için ♥ ile yapıldı</p>
          </div>
        </ScrollReveal>
      </footer>
    </main>
  );
}
