// Android paketine girecek web dosyalarını www/ klasörüne kopyalar: node scripts/www.js
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..'), hedef = path.join(kok, 'www');
const dosyalar = ['index.html', 'stil.css', 'dersler.js', 'app.js', 'sw.js', 'manifest.webmanifest', 'ikon.svg', 'ikon-192.png', 'ikon-512.png', 'ikon-maskable-512.png'];
fs.rmSync(hedef, { recursive: true, force: true }); fs.mkdirSync(hedef);
for (const d of dosyalar) {
  const k = path.join(kok, d);
  if (!fs.existsSync(k)) { console.error('Eksik dosya: ' + d); process.exit(1); }
  fs.copyFileSync(k, path.join(hedef, d));
}
console.log(`www/ hazır (${dosyalar.length} dosya)`);
