// Ekran görüntüleri: node tests/ekran.js <klasör> [koyu|acik] [kolay|pro|ilk]
const { chromium } = require('./pw');
const { sunucu } = require('../sunucu.js');
const path = require('path'), fs = require('fs');
(async () => {
  const dir = process.argv[2] || 'ekran', tema = process.argv[3] || 'koyu', mod = process.argv[4] || 'pro'; fs.mkdirSync(dir, { recursive: true });
  const srv = sunucu(); await new Promise(r => srv.listen(0, r)); const URL_ = `http://localhost:${srv.address().port}/`;
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  for (const [ad, vp] of [['masa', { width: 1440, height: 900 }], ['tel', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: ad === 'tel' ? 2 : 1, hasTouch: ad === 'tel' });
    const p = await ctx.newPage(); const hatalar = []; p.on('pageerror', e => hatalar.push(String(e)));
    await p.addInitScript(([t, m]) => { try { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('tezene_ayar', JSON.stringify(m === 'ilk' ? { tema: t } : { tema: t, mod: m })); localStorage.setItem('tezene_ilerleme', JSON.stringify({ dersler: { d01: { adim: 4, bitti: Date.now() - 864e5 }, d02: { adim: 4, bitti: Date.now() }, d03: { adim: 1, bitti: null } }, egz: { e1: [{ ts: Date.now() - 3 * 864e5, bpm: 64 }, { ts: Date.now() - 864e5, bpm: 72 }, { ts: Date.now(), bpm: 80 }] }, gun: {} })); } } catch (e) {} }, [tema, mod]);
    await p.goto(URL_ + '#ana'); await p.waitForFunction(() => window.Tezene); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(dir, `${ad}-ana.png`), fullPage: true });
    if (mod === 'ilk') { await ctx.close(); continue; }
    const gitV = async v => { if (ad === 'tel' && !['ana', 'dersler', 'akort', 'ritim'].includes(v)) { await p.click('#dahaBtn'); await p.click(`#dahaSayfa [data-git="${v}"]`); } else await p.click(`#ray [data-git="${v}"]`); await p.waitForTimeout(350); };
    await gitV('dersler'); await p.screenshot({ path: path.join(dir, `${ad}-dersler.png`), fullPage: true });
    await p.click('#dersSekme [data-s="egz"]'); await p.waitForTimeout(200); await p.screenshot({ path: path.join(dir, `${ad}-egz.png`), fullPage: true });
    await p.click('#dersSekme [data-s="ders"]'); await p.click('[data-ders="d05"]'); await p.waitForTimeout(350); await p.screenshot({ path: path.join(dir, `${ad}-ders-metin.png`), fullPage: true });
    await p.click('#adimIleri'); await p.click('#adimIleri'); await p.waitForTimeout(350); await p.screenshot({ path: path.join(dir, `${ad}-ders-cal.png`), fullPage: true });
    await gitV('ritim'); await p.screenshot({ path: path.join(dir, `${ad}-ritim.png`), fullPage: true });
    await gitV('akort'); await p.evaluate(() => { Tezene.Akort.goster(440 * Math.pow(2, 9 / 1200)); Tezene.Strob.a = [0.3, 0.9, 1.7]; Tezene.Strob.ciz(); }); await p.screenshot({ path: path.join(dir, `${ad}-akort.png`), fullPage: true });
    await gitV('defter'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(dir, `${ad}-defter.png`), fullPage: true });
    if (ad === 'tel') { await p.click('#dahaBtn'); await p.waitForTimeout(400); await p.screenshot({ path: path.join(dir, `tel-daha.png`) }); }
    if (hatalar.length) console.log(ad, 'HATA', hatalar);
    await ctx.close();
  }
  await b.close(); srv.close(); console.log('tamam');
})();
