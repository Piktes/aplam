import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🌱 BEGÜM ATAK DATABASE SEEDING v1.0");
  console.log("═══════════════════════════════════════\n");

  // Clear existing data (in correct order for foreign keys)
  console.log("🗑️  Clearing existing data...");
  await prisma.systemLog.deleteMany();
  // await prisma.adminUser.deleteMany(); // PRESERVE ADMIN USER
  await prisma.track.deleteMany();
  await prisma.video.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.specialEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.product.deleteMany();
  await prisma.event.deleteMany();
  await prisma.emailSignature.deleteMany();
  await prisma.socialMedia.deleteMany();
  await prisma.bio.deleteMany();
  await prisma.heroImage.deleteMany();

  console.log('Seeding database...');

  // 1. Bio (Begüm Atak - kaynak: sinemalar.com)
  const bio = await prisma.bio.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: `<p><strong>Begüm Atak</strong>, 10 Şubat 1984 tarihinde Ankara'da dünyaya geldi ve bu şehirde büyüdü. Hacettepe Üniversitesi Devlet Konservatuvarı Tiyatro Bölümü'nden mezun oldu.</p>
<p>Sinema oyunculuğundan çok tiyatroya ağırlık veren Atak, <em>Üç Tekerlekli Araba</em> ve <em>Lysistrata</em> gibi önemli oyunlarda rol aldı.</p>
<p>Televizyonda <em>Adı Mutluluk</em>, <em>Ah Neriman</em>, <em>4. Osman</em>, <em>Bizim Evin Halleri</em> ve <em>İnci Taneleri</em> gibi yapımlarda yer aldı. Son dönemde <em>İnci Taneleri</em> dizisinde canlandırdığı <strong>Sibel</strong> karakteriyle geniş kitlelerin beğenisini kazandı.</p>`,
      imageUrl: "/uploads/bio/default-bio.jpg",
      isActive: true
    }
  });

  // 2. Sosyal medya bağlantıları (yer tutucu - gerçek hesaplarla güncellenecek)
  const platforms = [
    { platform: 'instagram', url: 'https://instagram.com/begumatak', isVisible: true, sortOrder: 0 },
    { platform: 'x', url: 'https://x.com/begumatak', isVisible: true, sortOrder: 1 },
    { platform: 'youtube', url: 'https://youtube.com/@begumatak', isVisible: true, sortOrder: 2 },
    { platform: 'facebook', url: 'https://facebook.com/begumatak', isVisible: false, sortOrder: 3 },
    { platform: 'tiktok', url: 'https://tiktok.com/@begumatak', isVisible: false, sortOrder: 4 },
    { platform: 'imdb', url: 'https://www.imdb.com/name/nm10682054/', isVisible: true, sortOrder: 5 },
  ];

  for (const p of platforms) {
    await prisma.socialMedia.create({
      data: p
    });
  }

  // 3. Site ayarları
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      isAudioPlayerVisible: false,
      isShopVisible: false,
      isYoutubeVisible: true,
      heroSliderInterval: 5000
    }
  });

  console.log('Seeding finished.');


  // ========================================
  // ADMIN USER (with bcrypt hashed password)
  // ========================================
  console.log("👤 Creating Admin User...");
  const passwordHash = await bcrypt.hash("Sahs2207$", 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { username: "Sahadmin" },
    update: {
      passwordHash: passwordHash,
    },
    create: {
      username: "Sahadmin",
      passwordHash: passwordHash,
      email: "admin@begumatak.com",
      role: "admin",
      isActive: true,
    },
  });
  console.log(`   ✓ Admin created: ${adminUser.username}`);
  console.log(`   ✓ Password: Sahs2207$ (hashed with bcrypt)\n`);

  // Log the seed action
  await prisma.systemLog.create({
    data: {
      level: "INFO",
      action: "SYSTEM_SEED",
      username: "System",
      details: "Veritabanı başlangıç verileriyle dolduruldu",
    },
  });

  // ========================================
  // VIDEOS (yer tutucu - gerçek videolarla güncellenecek)
  // ========================================
  console.log("📺 Creating YouTube Videos...");
  const videos = [
    { title: "İnci Taneleri - Sibel Sahneleri", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 0, isActive: true },
    { title: "Bizim Evin Halleri - Kamera Arkası", youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0", sortOrder: 1, isActive: true },
    { title: "Röportaj - Tiyatro Üzerine", youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk", sortOrder: 2, isActive: true },
  ];
  for (const video of videos) {
    await prisma.video.create({ data: video });
  }
  console.log(`   ✓ ${videos.length} videos created\n`);

  // ========================================
  // HERO IMAGES (yer tutucu)
  // ========================================
  console.log("🖼️  Creating Hero Images...");
  const heroImages = [
    { imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&q=85", altText: "Tiyatro sahnesi", sortOrder: 0, isActive: true },
    { imageUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=1920&q=85", altText: "Sahne ışıkları", sortOrder: 1, isActive: true },
  ];
  for (const img of heroImages) {
    await prisma.heroImage.create({ data: img });
  }
  console.log(`   ✓ ${heroImages.length} hero images created\n`);

  // ========================================
  // GALLERY IMAGES (yer tutucu)
  // ========================================
  console.log("🖼️  Creating Gallery Images...");
  const galleryImages = [
    { imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80", title: "Sahnede", category: "tiyatro", sortOrder: 0 },
    { imageUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80", title: "Prova", category: "tiyatro", sortOrder: 1 },
    { imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80", title: "Set Günleri", category: "dizi", sortOrder: 2 },
    { imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", title: "Kamera Arkası", category: "dizi", sortOrder: 3 },
  ];
  for (const img of galleryImages) {
    await prisma.galleryImage.create({ data: img });
  }
  console.log(`   ✓ ${galleryImages.length} gallery images created\n`);

  // ========================================
  // EVENTS (yer tutucu - gerçek etkinliklerle güncellenecek)
  // ========================================
  console.log("📅 Creating Events...");
  const events = [
    { title: "Lysistrata - Tiyatro Oyunu", date: new Date("2026-09-18T20:00:00"), venue: "Zorlu PSM", city: "İstanbul", country: "Türkiye", ticketUrl: "https://biletix.com" },
    { title: "Üç Tekerlekli Araba", date: new Date("2026-10-14T20:30:00"), venue: "CSO Ada", city: "Ankara", country: "Türkiye", ticketUrl: "https://biletix.com" },
    { title: "Söyleşi ve İmza Günü", date: new Date("2026-12-05T15:00:00"), venue: "Akmerkez", city: "İstanbul", country: "Türkiye", ticketUrl: "https://biletix.com" },
  ];
  for (const e of events) await prisma.event.create({ data: e });
  console.log(`   ✓ ${events.length} events created\n`);

  // ========================================
  // SPECIAL EVENT POPUP
  // ========================================
  console.log("🎉 Creating Special Event...");
  await prisma.specialEvent.create({
    data: {
      title: "Yeni Sezon Duyurusu! 🎭",
      message: "Yeni tiyatro sezonu başlıyor! Oyun tarihlerinden ve etkinliklerden ilk siz haberdar olmak için bültene abone olun.",
      imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
      linkUrl: "/#newsletter",
      linkText: "Abone Ol",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      showOnce: false,
      isActive: true,
    },
  });
  console.log("   ✓ Special event created\n");

  // ========================================
  // SAMPLE VISITORS (150 entries with countries)
  // ========================================
  console.log("👥 Creating sample visitors...");
  const countries = [
    { country: "Turkey", cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Eskişehir", "Konya"] },
    { country: "Germany", cities: ["Berlin", "Münih", "Hamburg", "Frankfurt", "Köln"] },
    { country: "Netherlands", cities: ["Amsterdam", "Rotterdam", "Lahey", "Utrecht"] },
    { country: "France", cities: ["Paris", "Lyon", "Marsilya", "Nice"] },
    { country: "United Kingdom", cities: ["Londra", "Manchester", "Birmingham"] },
    { country: "United States", cities: ["New York", "Los Angeles", "Chicago"] },
    { country: "Azerbaijan", cities: ["Bakü", "Gence"] },
    { country: "Austria", cities: ["Viyana", "Graz"] },
  ];

  const crypto = await import("crypto");
  const hashIP = (ip: string) => crypto.createHash("sha256").update(ip).digest("hex");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  const visitorData = [];
  for (let i = 0; i < 150; i++) {
    const countryData = countries[Math.floor(Math.random() * countries.length)];
    const city = countryData.cities[Math.floor(Math.random() * countryData.cities.length)];
    const fakeIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    visitorData.push({
      visitorHash: hashIP(fakeIP + i),
      country: countryData.country,
      city: city,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      visitedAt: randomDate(thirtyDaysAgo, now),
      isSubscriber: Math.random() < 0.15,
      hasMessaged: Math.random() < 0.05,
    });
  }
  await prisma.visitorLog.deleteMany({});
  await prisma.visitorLog.createMany({ data: visitorData });
  console.log(`   ✓ ${visitorData.length} visitors created\n`);

  // ========================================
  // SAMPLE SUBSCRIBERS (15 entries)
  // ========================================
  console.log("📧 Creating sample subscribers...");
  const subscriberEmails = [
    "ayse.yilmaz@gmail.com", "mehmet.kaya@yahoo.com", "zeynep.demir@outlook.com",
    "ali.celik@hotmail.com", "fatma.sahin@gmail.com", "mustafa.aydin@icloud.com",
    "elif.ozturk@gmail.com", "ahmet.arslan@outlook.com", "emine.dogan@yahoo.com",
    "huseyin.kilic@gmail.com", "hatice.aslan@proton.me", "ibrahim.cetin@gmail.com",
    "meryem.kurt@outlook.com", "omer.koc@yahoo.com", "sultan.acar@gmail.com",
  ];

  let subscriberCount = 0;
  for (let i = 0; i < subscriberEmails.length; i++) {
    const countryData = countries[Math.floor(Math.random() * countries.length)];
    try {
      await prisma.subscriber.create({
        data: {
          email: subscriberEmails[i],
          receiveEventAlerts: Math.random() > 0.3,
          ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${i}`,
          country: countryData.country,
          city: countryData.cities[Math.floor(Math.random() * countryData.cities.length)],
          isActive: true,
          joinedAt: randomDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), now),
        },
      });
      subscriberCount++;
    } catch (e) {
      // Skip duplicates
    }
  }
  console.log(`   ✓ ${subscriberCount} subscribers created\n`);

  // ========================================
  // SAMPLE MESSAGES (8 entries)
  // ========================================
  console.log("💬 Creating sample messages...");
  const messageContents = [
    { name: "Ayşe Yılmaz", email: "ayse.y@gmail.com", message: "İnci Taneleri'ndeki Sibel karakterinize bayılıyorum! Yeni sezonu sabırsızlıkla bekliyoruz." },
    { name: "Mehmet Kaya", email: "mehmet.k@yahoo.com", message: "Lysistrata oyununuzu İstanbul'da izledim, muhteşemdi. Ankara'ya da gelecek misiniz?" },
    { name: "Zeynep Demir", email: "zeynep.d@outlook.com", message: "Tiyatro atölyesi düşünüyor musunuz? Konservatuvar hazırlığındayım, tavsiyelerinizi çok isterim." },
    { name: "Ali Çelik", email: "ali.c@icloud.com", message: "Bir kısa film projemiz var, sizinle çalışmayı çok isteriz. Menajerinize nasıl ulaşabiliriz?" },
    { name: "Fatma Şahin", email: "fatma.s@gmail.com", message: "Bizim Evin Halleri'nden beri sizi takip ediyorum. Başarılarınızın devamını dilerim!" },
    { name: "Mustafa Aydın", email: "mustafa.a@gmail.com", message: "Üç Tekerlekli Araba oyununun tekrar sahnelenme ihtimali var mı?" },
    { name: "Elif Öztürk", email: "elif.o@proton.me", message: "Oyunculuğunuz bana çok ilham veriyor. Röportaj talebim için e-posta adresinize yazdım." },
    { name: "Ahmet Arslan", email: "ahmet.a@outlook.com", message: "Yeni dizi projeniz olacak mı? Sosyal medyadan duyuru bekliyoruz!" },
  ];

  const messageData = messageContents.map((msg, i) => ({
    name: msg.name,
    email: msg.email,
    message: msg.message,
    ipAddress: `172.16.${Math.floor(Math.random() * 255)}.${i}`,
    createdAt: randomDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), now),
    isRead: Math.random() > 0.5,
  }));
  await prisma.message.createMany({ data: messageData });
  console.log(`   ✓ ${messageData.length} messages created\n`);

  console.log("═══════════════════════════════════════");
  console.log("🎉 SEEDING COMPLETE!");
  console.log("═══════════════════════════════════════");
  console.log("\n📋 Admin Credentials:");
  console.log("   Username: Sahadmin");
  console.log("   Password: Sahs2207$");
  console.log("\n📊 Sample Data Summary:");
  console.log(`   👥 Visitors:    150`);
  console.log(`   📧 Subscribers: 15`);
  console.log(`   💬 Messages:    8`);
  console.log("\n🚀 Run: npm run db:seed && npm run dev\n");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
