# Tezene – Bağlama Atölyesi

Bağlama öğrenmek ve geliştirmek için akort, dersler, perde haritası, makam dizileri, metronom, kulak eğitimi ve çalışma defteri.

## Android uygulamasını indirme
Sağdaki **Releases** bölümünden en son `Tezene-….apk` dosyasını telefona indirip açın. Telefon izin isterse “bu kaynaktan yüklemeye izin ver” deyin.

Her yeni sürüm aynı anahtarla imzalanır; eskisinin üstüne kurulur ve verileriniz korunur.

## Nasıl derlenir
`main` dalına yapılan her gönderimde GitHub Actions (`.github/workflows/apk.yml`) uygulamayı Capacitor ile Android'e paketler, APK'yı derler ve yeni bir sürüm olarak yayınlar. Elle çalıştırmak için: **Actions › Android APK › Run workflow**.

Ayrıntılar için [BENİOKU.md](BENİOKU.md) dosyasına bakın.

> İmza anahtarı depoda değildir. GitHub'daki `ANDROID_IMZA_ANAHTARI` gizli ayarında (Settings › Secrets and variables › Actions) base64 olarak durur. Anahtarın aslını güvenli bir yerde saklayın; kaybolursa yeni sürümler eskisinin üstüne kurulamaz.
