# Tezene – analiz ve geliştirme planı (sürüm 3)

## 1. Mevcut durum (sürüm 2.0.0)
- **Yapı:** `index.html` (iskelet + SVG ikon seti), `stil.css` (tasarım belirteçleri, koyu/açık tema), `app.js` (tek IIFE, ~700 satır), `sw.js` (çevrimdışı), `sunucu.js` (yerel sunucu), `tests/` (18 Playwright testi).
- **Bölümler:** Akort (strob, YIN algılama), Sap (perde haritası), Makam (12 dizi + kendi dizilerin), Ritim (metronom), Kulak (2 alıştırma), Defter (repertuvar, kronometre, mikrofon kaydı, yedek), Ayarlar.
- **Tasarım dili:** 45'lik plak etiketi ve strob. Safran vurgu, nötr siyah zemin, sistem yazı tipi.

## 2. Eksikler
1. **Ana ekran yok:** Uygulama doğrudan Akort'ta açılıyor; devam, günlük öneri ve gelişim görünmüyor.
2. **Eğitim yok:** Ders, seviye ve ilerleme sistemi yok. Yeni başlayan biri ne yapacağını bilemez.
3. **Tek kullanım seviyesi:** Teknik terimler (koma, sent, kromatik) yeni başlayana da gösteriliyor.
4. **Kayıtlar kalıcı değil:** Sayfa yenilenince kaybolur, yönetilemez.
5. **Egzersiz takibi yok:** Tempo ilerlemesi tutulmuyor.
6. **Ritim çalıştırıcısı yalnız metronom:** Hızlanan tempo ve zamanlama ölçümü yok.
7. **Gezinme dar:** Telefonda 7 düğme sıkışık; yeni bölümler eklenince sığmaz.
8. **Kod:** Mikrofon açma kodu Akort ve kayıt arasında tekrarlanıyor; görünüm geçişlerinde animasyon yok.

## 3. Tasarım sorunları
- Zemin soğuk nötr siyah; brief sıcak ve doğal bir palet istiyor. Plak ve strob kimliği korunarak nötrler ceviz/espresso tonuna çekilecek.
- Saz kültürünü gösteren özgün bir görsel yok. Elle çizilmiş bir bağlama illüstrasyonu (SVG) eklenecek.
- Boş durumlar ve ilk açılış deneyimi zayıf.

## 4. Plan
1. **Tasarım sistemi:** Sıcak nötrler, kart bileşeni, görünüm geçişi, telefon için "Daha" menüsü (alt sayfa).
2. **Ana sayfa:**
   - Karşılama ve mod seçimi.
   - "Kaldığın yerden devam et".
   - Bugünün çalışması (kendi kendine tamamlanan görevler).
   - Gelişim (seri gün, bu hafta, dersler, egzersiz rekoru).
   - Hızlı araçlar.
3. **Kolay / Profesyonel mod:** Kolay modda teknik araçlar ve gelişmiş ayarlar gizlenir; her an değiştirilebilir.
4. **Ders sistemi:**
   - 3 seviye, 15 ders.
   - Adım türleri: anlatım, mini sap çizimi, referans dinleme, soru, mikrofonla perde kontrolü, mikrofonla ritim kontrolü.
   - İlerleme kaydedilir.
5. **Egzersizler:** 8 egzersiz, metronomla başlatma, tempo kaydı, en iyi tempo ve geçmiş.
6. **Ritim çalıştırıcısı:**
   - Hızlanan tempo (başlangıç, artış, hedef).
   - Mikrofonla zamanlama testi (isabet yüzdesi, ortalama sapma).
7. **Kayıtlar:**
   - IndexedDB'de kalıcı.
   - Dinleme, adlandırma, silme, indirme.
   - Depolama yoksa açık uyarı.
8. **Kod:** Ortak `Dinleyici` (mikrofon) modülü. Müfredat ayrı `dersler.js` dosyasında.
9. **Test:** Mevcut 18 test korunur. Ana sayfa, mod, ders oynatıcı (sahte mikrofonla perde ve ritim kontrolü), egzersiz, kalıcı kayıt ve ritim çalıştırıcısı için yeni testler.

## 5. Bilinçli sınırlar
- Ritim ölçümünde cihazın mikrofon gecikmesi bilinemez. Bu yüzden sonuç gecikmeden arındırılmış tutarlılık olarak verilir ve ortalama sapma ayrıca gösterilir.
- Ders içerikleri genel saz eğitimi bilgisidir. Bir öğretmenin yerini tutmaz; uygulamada da bu şekilde söylenir.
