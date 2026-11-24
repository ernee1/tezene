// `npx cap add android` sonrası Android projesini ayarlar: mikrofon izni ve sürüm numarası.
// node scripts/android-hazirla.js [surumKodu]
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..');
const manifest = path.join(kok, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const gradle = path.join(kok, 'android', 'app', 'build.gradle');
if (!fs.existsSync(manifest) || !fs.existsSync(gradle)) { console.error('Android projesi bulunamadı. Önce: npx cap add android'); process.exit(1); }

let m = fs.readFileSync(manifest, 'utf8');
for (const izin of ['android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS']) {
  if (!m.includes(izin)) m = m.replace('</manifest>', `    <uses-permission android:name="${izin}" />\n</manifest>`);
}
fs.writeFileSync(manifest, m);

const kod = Math.max(1, parseInt(process.argv[2] || process.env.GITHUB_RUN_NUMBER || '1', 10));
const surum = require(path.join(kok, 'package.json')).version.replace(/\.\d+$/, '') + '.' + kod;
let g = fs.readFileSync(gradle, 'utf8');
g = g.replace(/versionCode\s+\d+/, `versionCode ${kod}`).replace(/versionName\s+"[^"]*"/, `versionName "${surum}"`);
fs.writeFileSync(gradle, g);
console.log(`Android hazır: mikrofon izni eklendi, sürüm ${surum} (kod ${kod})`);
