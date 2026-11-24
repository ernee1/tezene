// ikon.svg ve plak çiziminden PWA ve Android simgelerini üretir: node tests/ikon_uret.js
const { chromium } = require('./pw');
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..');
const ZEMIN = '#120e0b';
// Plak: köşesiz, ortalanmış; olcek = plağın tuvale oranı
const plak = (n, olcek, zemin) => `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 512 512">
  ${zemin ? `<rect width="512" height="512" fill="${zemin}"/>` : ''}
  <g transform="translate(256 256) scale(${olcek}) translate(-256 -256)">
    <circle cx="256" cy="256" r="196" fill="#0b0b0c" stroke="#3a2f25" stroke-width="3"/>
    <g fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="2"><circle cx="256" cy="256" r="180"/><circle cx="256" cy="256" r="166"/><circle cx="256" cy="256" r="152"/><circle cx="256" cy="256" r="138"/><circle cx="256" cy="256" r="124"/></g>
    <circle cx="256" cy="256" r="96" fill="#e3a52f"/>
    <circle cx="256" cy="256" r="84" fill="none" stroke="#1b1406" stroke-opacity=".35" stroke-width="3"/>
    <circle cx="256" cy="256" r="12" fill="${ZEMIN}"/>
  </g></svg>`;
const acilis = n => `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}"><rect width="${n}" height="${n}" fill="${ZEMIN}"/>
  <g transform="translate(${n / 2 - 256 * 0.9} ${n / 2 - 256 * 0.9}) scale(0.9)">${plak(512, 1, null).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`;

(async () => {
  const b = await chromium.launch();
  const ciz = async (svg, n, dosya) => {
    const p = await b.newPage({ viewport: { width: n, height: n } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    fs.mkdirSync(path.dirname(dosya), { recursive: true });
    await p.screenshot({ path: dosya, omitBackground: true }); await p.close();
  };
  const ana = fs.readFileSync(path.join(kok, 'ikon.svg'), 'utf8');
  for (const n of [192, 512]) await ciz(ana.replace('<svg ', `<svg width="${n}" height="${n}" `), n, path.join(kok, `ikon-${n}.png`));
  // PWA maskable: tam dolu zemin, plak güvenli alanda (%80 çap içinde)
  await ciz(plak(512, 0.78, ZEMIN), 512, path.join(kok, 'ikon-maskable-512.png'));
  // Android (@capacitor/assets): uyarlanabilir simge katmanları ve açılış ekranı
  await ciz(plak(1024, 1.15, ZEMIN), 1024, path.join(kok, 'assets', 'icon-only.png'));
  await ciz(plak(1024, 0.62, null), 1024, path.join(kok, 'assets', 'icon-foreground.png'));
  await ciz(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${ZEMIN}"/></svg>`, 1024, path.join(kok, 'assets', 'icon-background.png'));
  await ciz(acilis(2732), 2732, path.join(kok, 'assets', 'splash.png'));
  await ciz(acilis(2732), 2732, path.join(kok, 'assets', 'splash-dark.png'));
  await b.close(); console.log('Simgeler üretildi: ikon-192/512, ikon-maskable-512, assets/ (Android)');
})();
