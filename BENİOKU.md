# Tezene – Bağlama Atölyesi (sürüm 3)

Bağlama öğrenmek ve geliştirmek için ders ve araç uygulaması. Uygulamada sanal saz çalınmaz; siz gerçek sazınızı çalarsınız, uygulama mikrofonla dinleyip size yol gösterir.
- Bağımlılığı yoktur ve çevrimdışı çalışır (PWA).
- Veriler yalnız cihazda tutulur: ayarlar ve ilerleme localStorage'da, ses kayıtları IndexedDB'de.

## Çalıştırma
```
node sunucu.js 8080
```
Ardından http://localhost:8080 adresini açın. Mikrofon gerektiren özellikler (akort, mikrofonlu ders adımları, zamanlama testi, kayıt) yalnız `https://` ya da `localhost` adreslerinde çalışır.

## Testler
```
node tests/testler.js                              # beklenen: 27 geçti, HEPSİ GEÇTİ
node tests/ekran.js <klasör> [koyu|acik] [kolay|pro|ilk]   # ekran görüntüleri
```

## Bölümler
- **Ana sayfa:**
  - Kaldığınız derse devam.
  - Bugünün çalışması: kendiliğinden işaretlenen görevler (akort, ders, egzersiz; Profesyonel modda metronom).
  - Gelişim: seri, ders, haftalık süre, en yüksek tempo, seviye çubukları.
  - Hızlı araçlar.
- **Dersler:** 3 seviye, 15 ders. Adım türleri:
  - anlatım ve mini sap çizimi
  - referans dinleme
  - soru
  - mikrofonla perde kontrolü
  - mikrofonla ritim kontrolü
  - İlerleme kaydedilir, yarıda bırakılan ders kaldığı adımdan açılır.
- **Egzersizler:** 8 egzersiz. Metronomla çalma, temiz çalınan tempoyu kaydetme, en iyi tempo ve geçmiş.
- **Akort:** Strob göstergeli akortçu. Otomatik, tek tel ve (Profesyonel modda) kromatik modlar.
- **Ritim:**
  - Metronom ve usuller.
  - Mikrofonla zamanlama testi.
  - Profesyonel modda hızlanan tempo.
- **Sap:** Perde haritası ve makam işaretleri.
- **Makam:** Yalnız Profesyonel modda.
- **Kulak:** Perde bulma ve aralık tanıma alıştırmaları.
- **Defter:** Repertuvar, kronometre, kalıcı kayıtlar (dinle, adlandır, indir, sil), yedek.
- **Ayarlar:** Kullanım modu, düzen. Profesyonel modda ayrıca ahenk, perdeler ve referans sesleri.

## Dosyalar
- `index.html`: iskelet ve ikonlar
- `stil.css`: tasarım sistemi
- `dersler.js`: müfredat ve egzersizler (yalnız veri)
- `app.js`: uygulama
- `sw.js`: çevrimdışı çalışma
- `docs/gelistirme-plani.md`: analiz ve plan
- `DESIGN.md`: tasarım kuralları

## Bilinen sınırlar
- Ritim ölçümünde cihazın mikrofon gecikmesi bilinemez. Bu yüzden isabet, gecikmeden arındırılarak hesaplanır; ortalama sapma ayrıca gösterilir.
- Tık sesi mikrofona karışırsa ölçüm sırasında metronom yalnız ışıkla gösterilir. Kulaklık önerilir.
- Ders içerikleri genel bilgidir; duruş ve tezene tekniğini uygulama göremez.
- Ses kayıtları yedek dosyasına dahil değildir; tek tek indirilebilir.
- Gerçek telefonda ve gerçek sazla denenmedi. Testler Chromium'da, sahte mikrofonla (sabit La sesi ve 120 bpm tık sesi) yapıldı.
