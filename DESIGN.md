---
name: Tezene
mode: operate
colors:
  dark: { zemin: "#120e0b", yuzey: "#1a1511", yuzey2: "#231c17", cizgi: "#332a22", yazi: "#f4ede3", soluk: "#b5a796", silik: "#9a8b79" }
  light: { zemin: "#f2ede6", yuzey: "#fffdfa", yuzey2: "#f7f2eb", cizgi: "#e0d6c9", yazi: "#1d1712", soluk: "#5e5246", silik: "#6f6255" }
  roles: { etiket: "#e3a52f", etiket-metin-acik: "#8a5a00", kobalt: "#7d97f3 / #3557c6", kirmizi: "#ec6a52 / #c23a26", yesil: "#4fcb84 / #1d8549" }
  ahsap: { ceviz: "#7a5234", ceviz-koyu: "#4e321f", ladin: "#d8b98c", ladin-koyu: "#b8935f" }
type: { family: "system-ui stack", display: "800, -0.04em, tabular figures", body: "15px/1.5", ders-metni: "16px/1.6", label: "12px 600" }
radius: { kontrol: 10px, panel: 14px, kart: 18px, devam-karti: 22px }
motion: { egri: "cubic-bezier(.16,1,.3,1)", gorunum: "320ms fade + 8px", adim: "350ms yandan", alt-sayfa: "320ms aşağıdan" }
---

# Tezene tasarım sistemi (sürüm 3)

**Dünya:** 45'lik plak etiketi ve pikap strobosu, bağlamanın ahşabıyla ısıtılmış hali.
- Nötr renkler ceviz/espresso tonundadır.
- Koyu tema varsayılandır, açık tema sıcak kâğıt tonundadır.

**İmzalar:**
- Strob akort göstergesi: halkalar sapmayla döner, ses doğruysa durup yeşile döner.
- Elle çizilmiş bağlama illüstrasyonu: SVG sembolü `#i-baglama`. Renkleri gölge ağacına geçebilsin diye satır içi CSS değişkenleriyle verilir. Karşılama ekranında, devam kartında ve ders bitişinde kullanılır.

**Renk rolleri:**
- Safran: etkin gezinme, birincil eylem, ilerleme.
- Kırmızı: yalnız karar ve hata/akortsuzluk.
- Kobalt: güçlü.
- Yeşil: yalnız tamamlandı/akortlu.

**Bileşenler:**
- Kart (18 px yarıçap) ve devam kartı (ahşap tonlu koyu degrade, her iki temada koyu).
- Görev satırı (kendiliğinden işaretlenen yuvarlak tik).
- İstatistik kutusu, seviye çubuğu, ders düğmesi (numara rozeti: tamam yeşil, sıradaki safran), egzersiz kartı.
- Ders oynatıcı: adım çubuğu, adım kartı, alt Geri/Devam.
- Mini sap: perde konumunu noktayla gösterir.
- Alt sayfa (telefonda "Daha" menüsü).

**Modlar:**
- `html[data-mod]` değeri `kolay` ya da `pro` olur.
- `.pro` sınıflı öğeler Kolay modda gizlenir, `.kolay-yalniz` sınıflı öğeler Profesyonel modda gizlenir.

**Gezinme:**
- Masaüstünde sol rayda 9 bölüm ve mod anahtarı.
- 860 px altında alt çubuk: Ana sayfa, Dersler, Akort, Ritim, Daha.

**Bilinçli istisnalar (denetleyici uyarıları):**
- Sapın eşiği ve perdeleri kalın tek taraflı kenarlarla çizilir; çalgının kendisidir.
- Kayıt noktası yalnız gerçek kayıt sırasında yanıp söner.

**Yazı tipi:** Çevrimdışı çalışma ve dosya indirmeme şartı nedeniyle sistem yazı tipi.
