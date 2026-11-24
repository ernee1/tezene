// Tezene regresyon testleri (gerçek Chromium). Çalıştır: node tests/testler.js
const { chromium } = require('./pw');
const { sunucu } = require('../sunucu.js');
const fs = require('fs'), os = require('os'), path = require('path');

let gecen = 0; const kalan = [];
async function test(ad, fn) {
  try { await fn(); gecen++; console.log('  ✓ ' + ad); }
  catch (e) { kalan.push(ad); console.log('  ✗ ' + ad + '\n     ' + String(e && e.stack || e).split('\n').slice(0, 3).join('\n     ')); }
}
const esit = (a, b, m) => { if (a !== b) throw new Error(`${m || 'eşit değil'}: beklenen ${JSON.stringify(b)}, gelen ${JSON.stringify(a)}`); };
const dogru = (v, m) => { if (!v) throw new Error(m || 'koşul sağlanmadı'); };
const yakin = (a, b, t, m) => { if (!(Math.abs(a - b) <= t)) throw new Error(`${m || 'yakın değil'}: beklenen ${b}±${t}, gelen ${a}`); };
function wavYaz(dosya, f, sn = 4, sr = 48000) {
  const n = sn * sr, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) { const t = i / sr, v = 0.5 * Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t) + 0.1 * Math.sin(6 * Math.PI * f * t); b.writeInt16LE(Math.round(v * 20000), 44 + i * 2); }
  fs.writeFileSync(dosya, b);
}

(async () => {
  const srv = sunucu(); await new Promise(r => srv.listen(0, r)); const URL_ = `http://localhost:${srv.address().port}/`;
  const wav = path.join(os.tmpdir(), 'tezene_test_440p10.wav'); wavYaz(wav, 440 * Math.pow(2, 10 / 1200));
  const tarayici = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav] });
  const hatalar = [];
  async function sayfa(o = {}) {
    const ctx = await tarayici.newContext({ viewport: o.vp || { width: 1280, height: 800 }, hasTouch: !!o.touch, permissions: ['microphone'] });
    const p = await ctx.newPage(); p.on('pageerror', e => hatalar.push(String(e))); p.on('console', m => { if (m.type() === 'error') hatalar.push(m.text()); });
    p.on('dialog', d => d.accept());
    if (!o.ilk) await p.addInitScript(() => { try { if (!localStorage.getItem('tezene_ayar')) localStorage.setItem('tezene_ayar', JSON.stringify({ mod: 'pro' })); } catch (e) {} });
    await p.goto(URL_ + (o.hash || ''), { waitUntil: 'load' }); await p.waitForFunction(() => window.Tezene); return p;
  }
  const git = (p, v) => p.click(`#ray button[data-git="${v}"]`);
  console.log('Tezene testleri');

  await test('T1 açılış: hata yok, varsayılan ana sayfa, 9 bölüm, koyu tema', async () => {
    const p = await sayfa();
    esit(await p.isVisible('#v-ana'), true); esit(await p.getAttribute('html', 'data-theme'), 'dark');
    for (const v of ['ana', 'dersler', 'akort', 'sap', 'makam', 'ritim', 'kulak', 'defter', 'ayar']) { await git(p, v); esit(await p.isVisible(`#v-${v}`), true, v); esit(await p.getAttribute(`#ray button[data-git="${v}"]`, 'aria-current'), 'page'); }
    esit(await p.locator('#v-cal, #mizrap, #tabMetin').count(), 0, 'sanal çalma kaldırıldı');
    esit(hatalar.length, 0, 'konsol hatası: ' + hatalar.join(' | ')); await p.context().close();
  });

  await test('T2 sap: 29 perde × 3 tel, Re-Sol-La; dokunmak ses çıkarmaz, bilgi gösterir', async () => {
    const p = await sayfa({ hash: '#sap' });
    esit(await p.locator('.tel-sira[data-tel="0"] .hucre').count(), 29); esit(await p.locator('.hucre').count(), 87);
    esit((await p.$$eval('.sabit-hucre b', e => e.map(x => x.textContent))).join(','), 'Re,Sol,La');
    await p.click('.hucre[data-tel="0"][data-p="4"]');
    esit(await p.evaluate(() => Tezene.Ses.log.length), 0, 'ses çıkmamalı');
    const b = await p.textContent('#perdeBilgi'); dogru(/Si/.test(b) && /9 koma/.test(b) && /495,0 Hz/.test(b), 'bilgi: ' + b);
    dogru(await p.locator('.hucre.sec[data-p="4"]').count() === 1, 'seçili işaret');
    await p.context().close();
  });

  await test('T3 makam işaretleri: Hicaz karar/güçlü/dizi noktaları', async () => {
    const p = await sayfa({ hash: '#sap' });
    await p.selectOption('#sapMakam', 'hicaz');
    dogru(await p.locator('.hucre[data-tel="0"][data-p="2"] .nokta.m').count() === 1, 'Si♭⁴');
    dogru(await p.locator('.hucre[data-tel="0"][data-p="6"] .nokta.m').count() === 1, 'Do#⁴');
    dogru(await p.locator('.hucre[data-tel="0"][data-p="8"] .nokta.g').count() === 1, 'Re güçlü (4. derece)');
    dogru(await p.locator('.hucre[data-tel="0"][data-p="18"] .nokta.k').count() === 1, 'tiz La karar');
    dogru(await p.locator('.hucre[data-tel="0"][data-p="4"] .nokta').count() === 0, 'Si dizide yok');
    dogru(await p.isVisible('#lejant'), 'lejant');
    await p.click('.hucre[data-tel="0"][data-p="8"]'); dogru(/Güçlü · Hicaz/.test(await p.textContent('#perdeBilgi')));
    await p.context().close();
  });

  await test('T4 düzen + ahenk: Bozuk düzen, La 442, transpoze −2; kalıcı', async () => {
    const p = await sayfa({ hash: '#ayar' });
    await p.selectOption('#ayDuzen', 'bozuk');
    await p.fill('#ayA4', '442'); await p.press('#ayA4', 'Tab'); await p.fill('#ayTrans', '-2'); await p.press('#ayTrans', 'Tab');
    await git(p, 'akort');
    const hzler = await p.$$eval('#akTablo tbody td.sayi', e => e.map(x => x.textContent));
    esit(hzler[2], (442 * Math.pow(2, -200 / 1200)).toFixed(1).replace('.', ',') + ' Hz', 'alt tel Hz');
    esit((await p.$$eval('#akTablo tbody b', e => e.map(x => x.textContent))).join(','), 'Sol4,Re4,La4');
    await p.reload(); await p.waitForFunction(() => window.Tezene);
    esit(await p.evaluate(() => [Tezene.st.a4, Tezene.st.trans, Tezene.st.duzen].join()), '442,-2,bozuk');
    await p.context().close();
  });

  await test('T5 makam listesi: eksik perde uyarısı, dizi dinletme, sapta göster', async () => {
    const p = await sayfa({ hash: '#makam' });
    esit(await p.locator('.mk[data-id="hicaz"] .mk-uyari').count(), 0);
    await git(p, 'ayar'); await p.uncheck('#ayPerdeler input[data-i="1"]'); await p.uncheck('#ayPerdeler input[data-i="11"]');
    await git(p, 'makam'); dogru(/karşılığı yok/.test(await p.textContent('.mk[data-id="hicaz"]')), 'uyarı');
    dogru(await p.locator('.mk[data-id="hicaz"] .n.yok').count() >= 1, 'kesik çizgili ses');
    await p.click('.mk[data-id="hicaz"] button[data-a="cik"]');
    await p.waitForFunction(() => Tezene.Ses.log.length >= 8, null, { timeout: 8000 });
    esit((await p.evaluate(() => Tezene.Ses.log.map(x => Math.round(x.c / Tezene.K)))).join(','), '0,5,17,22,31,39,44,53');
    await p.click('.mk[data-id="kurdi"] button[data-a="sap"]');
    esit(await p.isVisible('#v-sap'), true); esit(await p.inputValue('#sapMakam'), 'kurdi');
    await p.context().close();
  });

  await test('T6 not adları: koma üst simgeleri, harf sistemi', async () => {
    const p = await sayfa();
    esit((await p.evaluate(() => [5, 4, 8, 17, 18, -31, 53, -9].map(k => Tezene.notaAdi(k * Tezene.K, true).tam))).join(' '), 'Si♭⁴4 Si♭⁵4 Si♭¹4 Do#⁴5 Re♭⁴5 Re4 La5 Sol4');
    await git(p, 'ayar'); await p.selectOption('#gIsim', 'harf');
    esit(await p.evaluate(() => Tezene.notaAdi(-9 * Tezene.K, false).metin), 'G');
    await p.context().close();
  });

  await test('T7 perde algılama (YIN): ±3 sent, sessizlikte sonuç yok', async () => {
    const p = await sayfa();
    const r = await p.evaluate(() => { const sr = 48000, n = 4096, out = []; for (const f of [82.41, 146.8, 196, 293.66, 440, 587.3, 880]) { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = 0.4 * Math.sin(2 * Math.PI * f * i / sr) + 0.25 * Math.sin(4 * Math.PI * f * i / sr) + 0.15 * Math.sin(6 * Math.PI * f * i / sr); const d = Tezene.perdeAlgila(b, sr); out.push(d ? 1200 * Math.log2(d.f / f) : 999); } return { out, sessiz: Tezene.perdeAlgila(new Float32Array(n), sr) }; });
    r.out.forEach((c, i) => yakin(c, 0, 3, '#' + i)); esit(r.sessiz, null);
    await p.context().close();
  });

  await test('T8 akort: sahte mikrofon La+10 sent; otomatik, tel ve kromatik modlar; strob döner', async () => {
    const p = await sayfa({ hash: '#akort' });
    await p.click('#akBasla'); await p.waitForFunction(() => Tezene.Akort.sonuc, null, { timeout: 8000 }); await p.waitForTimeout(500);
    let s = await p.evaluate(() => Tezene.Akort.sonuc); esit(s.ad, 'La'); yakin(s.sapma, 10, 3);
    dogru(/tiz/.test(await p.textContent('#akDurum'))); esit(await p.textContent('#akHedefHz'), '440,0');
    dogru(await p.locator('#akTablo tr.aktif[data-tel="0"]').count() === 1, 'alt tel satırı vurgulu');
    const a0 = await p.evaluate(() => Tezene.Strob.a[2]); await p.waitForTimeout(400); dogru(await p.evaluate(() => Tezene.Strob.a[2]) > a0, 'tiz seste strob saat yönünde döner');
    await p.click('#akHedef button[data-h="1"]'); await p.waitForTimeout(400);
    s = await p.evaluate(() => Tezene.Akort.sonuc); esit(s.ad, 'Sol'); yakin(s.sapma, 10 + 9 * 1200 / 53, 4);
    await p.click('#akHedef button[data-h="krom"]'); await p.selectOption('#akSistem', '12'); await p.waitForTimeout(400);
    s = await p.evaluate(() => Tezene.Akort.sonuc); esit(s.ad, 'La'); yakin(s.sapma, 10, 3);
    await git(p, 'sap'); esit(await p.evaluate(() => Tezene.Akort.acik), false, 'bölümden çıkınca mikrofon kapanır');
    await p.context().close();
  });

  await test('T9 metronom: 9/8 deseni, vuruş, mini düğme, boşluk tuşu, özel gruplama', async () => {
    const p = await sayfa({ hash: '#ritim' });
    esit(await p.locator('#vuruslar i').count(), 9); esit(await p.locator('#vuruslar i.s1, #vuruslar i.s2').count(), 4);
    await p.$eval('#bpmKaydir', e => { e.value = 240; e.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.keyboard.press('Space'); await p.waitForTimeout(1300);
    const v = await p.evaluate(() => Tezene.Met.vurus); dogru(v >= 3 && v <= 8, 'vuruş ' + v);
    await git(p, 'ana'); dogru(await p.isVisible('#metMini'), 'mini metronom'); await p.click('#metMini');
    esit(await p.evaluate(() => Tezene.Met.acik), false);
    await git(p, 'ritim'); await p.selectOption('#usulSec', 'ozel'); await p.fill('#usulOzel', '3+3+2');
    esit(await p.locator('#vuruslar i').count(), 8); esit(await p.textContent('#usulAd'), 'Özel gruplama · 3+3+2');
    await p.context().close();
  });

  await test('T10 kulak eğitimi: doğru/yanlış, rekor, aralık modu', async () => {
    const p = await sayfa({ hash: '#kulak' });
    await p.click('#egzYeni'); const c = await p.evaluate(() => Tezene.Egz.soru.cevap); await p.click(`#egzSecenek button[data-i="${c}"]`);
    esit(await p.textContent('#egzDogru'), '1'); esit(await p.textContent('#egzRekor'), '1');
    await p.click('#egzYeni'); const c2 = await p.evaluate(() => Tezene.Egz.soru.cevap);
    const y = await p.$$eval('#egzSecenek button', (b, c) => b.map(x => +x.dataset.i).find(i => i !== c), c2); await p.click(`#egzSecenek button[data-i="${y}"]`);
    esit(await p.textContent('#egzYanlis'), '1'); esit(await p.textContent('#egzSeri'), '0');
    await p.click('#egzMod button[data-m="aralik"]'); await p.click('#egzYeni');
    dogru([9, 17, 22, 31, 53].includes(await p.evaluate(() => Tezene.Egz.soru.cevap))); esit(await p.locator('#egzSecenek button').count(), 5);
    await p.context().close();
  });

  await test('T11 defter: eser ekle, kronometre oturumu, haftalık toplam, kalıcılık, silme', async () => {
    const p = await sayfa({ hash: '#defter' });
    await p.click('#esEkle'); dogru(await p.isVisible('#esHata'), 'boş ad hatası');
    await p.fill('#esAd', 'Uzun ince bir yoldayım'); await p.selectOption('#esMakam', 'huseyni'); await p.fill('#esBpm', '72'); await p.click('#esEkle');
    esit(await p.locator('#esTablo tbody tr[data-id]').count(), 1);
    const id = await p.getAttribute('#esTablo tbody tr[data-id]', 'data-id');
    await p.selectOption('#krEser', id); await p.click('#krBasla');
    esit(await p.isDisabled('#krEser'), true);
    await p.evaluate(() => { Tezene.Defter.kr.bas = Date.now() - 125000; });
    await p.click('#krBasla');
    dogru(/2 dk/.test(await p.textContent('#dfHafta')), 'hafta: ' + await p.textContent('#dfHafta'));
    dogru(/2 dk/.test(await p.textContent('#esTablo tbody')), 'eser toplamı');
    await p.selectOption('#esTablo select[data-a=durum]', 'hazir');
    await p.reload(); await p.waitForFunction(() => window.Tezene);
    esit(await p.locator('#otListe li button[data-sil]').count(), 1); esit(await p.inputValue('#esTablo select[data-a=durum]'), 'hazir');
    await p.click('#esTablo button[data-a="met"]'); esit(await p.isVisible('#v-ritim'), true); esit(await p.textContent('#bpmDeger'), '72');
    await git(p, 'defter'); await p.click('#esTablo button[data-a="sil"]');
    esit(await p.locator('#esTablo tbody tr[data-id]').count(), 0); dogru(/Serbest çalışma/.test(await p.textContent('#otListe')), 'oturum serbest kalır');
    // 5 sn'den kısa oturum kaydedilmez
    await p.click('#krBasla'); await p.click('#krBasla'); esit(await p.locator('#otListe li button[data-sil]').count(), 1);
    await p.context().close();
  });

  await test('T12 kendini kaydet: mikrofon kaydı oynatıcı ve indirme bağlantısı üretir', async () => {
    const p = await sayfa({ hash: '#defter' });
    await p.click('#skKayit'); await p.waitForTimeout(1300); await p.click('#skKayit');
    await p.waitForSelector('#skListe li audio', { timeout: 5000 });
    dogru(/^blob:/.test(await p.getAttribute('#skListe li a[download]', 'href')), 'indirme bağlantısı');
    await p.context().close();
  });

  await test('T13 perde düzenleme: 12 eşit perde, kısa sap, perde ekleme ve doğrulama', async () => {
    const p = await sayfa({ hash: '#ayar' });
    await p.selectOption('#ayPerdeHazir', '12'); esit(await p.locator('#ayPerdeler label').count(), 11);
    await p.click('#aySap button[data-s="kisa"]'); esit(await p.evaluate(() => Tezene.st.perdeSayi), 14);
    await p.fill('#ayPerdeYeni', '12k'); await p.click('#ayPerdeEkle'); esit(await p.locator('#ayPerdeler label').count(), 12);
    esit(await p.inputValue('#ayPerdeHazir'), 'ozel');
    await p.fill('#ayPerdeYeni', '1300'); await p.click('#ayPerdeEkle'); dogru(await p.isVisible('#ayPerdeHata'));
    await git(p, 'sap'); esit(await p.locator('.tel-sira[data-tel="0"] .hucre').count(), 14);
    await p.context().close();
  });

  await test('T14 kendi makamı ve düzeni; bozuk depolama çökertmez', async () => {
    const p = await sayfa({ hash: '#makam' });
    await p.fill('#mkYeniAd', 'Deneme'); await p.fill('#mkYeniAra', '9 9 4 9 9 9 4'); await p.click('#mkEkle');
    dogru(await p.locator('.mk:has-text("Deneme")').count() === 1);
    await p.fill('#mkYeniAd', 'X'); await p.fill('#mkYeniAra', '9 x'); await p.click('#mkEkle'); dogru(/tam sayı/.test(await p.textContent('#mkEkleMsj')));
    await git(p, 'ayar'); await p.selectOption('#ayTeller select[data-tel="2"]', '-22'); await p.fill('#ayDuzenAd', 'Benim düzenim'); await p.click('#ayDuzenKaydet');
    esit(await p.evaluate(() => Tezene.st.ozelDuzen.length), 1); await p.waitForTimeout(300);
    await p.evaluate(() => { localStorage.setItem('tezene_ayar', '{"teller":"x","a4":99999,"perdeOct":[{"c":"a"}],"ses":null,"met":{"bpm":-5},"v":"yok"}'); localStorage.setItem('tezene_defter_v2', '{"eserler":[{"id":1}],"oturumlar":"x"}'); });
    await p.reload(); await p.waitForFunction(() => window.Tezene);
    esit(await p.evaluate(() => [Tezene.st.a4, Tezene.st.teller.join(' '), Tezene.st.met.bpm, Tezene.perdeler().length, Tezene.st.v].join('|')), '440|0 -9 -31|90|29|ayar');
    await git(p, 'defter'); esit(await p.locator('#esTablo tbody tr[data-id]').count(), 0);
    await p.context().close();
  });

  await test('T15 açık tema ve solak sap', async () => {
    const p = await sayfa({ hash: '#ayar' });
    await p.selectOption('#gTema', 'acik'); esit(await p.getAttribute('html', 'data-theme'), 'light');
    await p.check('#gSolak'); await git(p, 'sap'); dogru(await p.locator('.sap-cerceve.solak').count() === 1);
    const [sab, kap] = await p.evaluate(() => [document.querySelector('#sapSabit').getBoundingClientRect().left, document.querySelector('#sapKap').getBoundingClientRect().left]); dogru(sab > kap, 'boş teller sağda');
    const r = await p.evaluate(() => { const h = document.querySelector('.hucre[data-tel="0"][data-p="1"]').getBoundingClientRect(), k = document.querySelector('#sapKap').getBoundingClientRect(); return Math.abs(h.right - k.right); });
    dogru(r < 2, '1. perde boş tele bitişik: ' + r);
    await p.context().close();
  });

  await test('T16 telefon 390 px: taşma yok, alt çubuk, dokunma hedefleri, sap kaydırma', async () => {
    const p = await sayfa({ vp: { width: 390, height: 844 }, touch: true });
    const tgit = async v => { if (['ana', 'dersler', 'akort', 'ritim'].includes(v)) await git(p, v); else { await p.click('#dahaBtn'); await p.click(`#dahaSayfa [data-git="${v}"]`); } };
    esit(await p.locator('#ray button:visible').count(), 5, 'alt çubukta 5 düğme');
    for (const v of ['ana', 'dersler', 'akort', 'sap', 'makam', 'ritim', 'kulak', 'defter', 'ayar']) {
      await tgit(v); esit(await p.isVisible(`#v-${v}`), true, v); const w = await p.evaluate(() => document.documentElement.scrollWidth); dogru(w <= 390, v + ' taşma ' + w);
      const k = await p.$$eval('.btn, #ray button, .hucre, .secenekler button', e => e.filter(x => x.offsetParent && x.getBoundingClientRect().width).filter(x => { const r = x.getBoundingClientRect(); return r.width < 44 || r.height < 36; }).map(x => x.className + ':' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)));
      esit(k.length, 0, v + ' küçük hedef ' + k.join(','));
    }
    const ray = await p.evaluate(() => document.querySelector('#ray').getBoundingClientRect().bottom); esit(Math.round(ray), 844, 'alt çubuk');
    await tgit('sap'); await p.$eval('#sapKaydir', e => { e.value = 1000; e.dispatchEvent(new Event('input', { bubbles: true })); });
    dogru(await p.evaluate(() => document.querySelector('#sapKap').scrollLeft > 500), 'sap kaydı');
    await p.context().close();
  });

  await test('T17 service worker önbelleği', async () => {
    const p = await sayfa();
    await p.waitForFunction(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && r.active; }, null, { timeout: 8000 });
    await p.waitForFunction(async () => (await (await caches.open('tezene-3.0.0')).keys()).length >= 9, null, { timeout: 8000 });
    await p.context().close();
  });

  await test('T18 yedek: dışa aktarılır, yanlış dosya reddedilir, doğru yedek geri yüklenir', async () => {
    const p = await sayfa({ hash: '#defter' });
    await p.fill('#esAd', 'Yedek testi'); await p.click('#esEkle');
    const [ind] = await Promise.all([p.waitForEvent('download'), p.click('#yedekAl')]); const yol = await ind.path();
    const v = JSON.parse(fs.readFileSync(yol, 'utf8')); esit(v.tur, 'tezene-yedek'); esit(v.defter.eserler.length, 1);
    const yanlis = path.join(os.tmpdir(), 'tezene_yanlis.json'); fs.writeFileSync(yanlis, '{"x":1}');
    await p.setInputFiles('#yedekYukle', yanlis); await p.waitForTimeout(200); dogru(/değil/.test(await p.textContent('#yedekMsj')));
    await p.click('#esTablo button[data-a="sil"]'); esit(await p.locator('#esTablo tbody tr[data-id]').count(), 0);
    const iyi = path.join(os.tmpdir(), 'tezene_iyi.json'); fs.copyFileSync(yol, iyi);
    await p.setInputFiles('#yedekYukle', iyi); await p.waitForTimeout(300); esit(await p.locator('#esTablo tbody tr[data-id]').count(), 1);
    await p.context().close();
  });

  await test('T19 ilk açılış: karşılama, Kolay mod gizlemeleri, Profesyonele geçiş', async () => {
    const p = await sayfa({ ilk: true });
    esit(await p.isVisible('#karsilama'), true); esit(await p.isVisible('#anaIcerik'), false);
    await p.click('[data-ilk="kolay"]');
    esit(await p.getAttribute('html', 'data-mod'), 'kolay'); esit(await p.isVisible('#devamKart'), true);
    esit(await p.isVisible('#ray button[data-git="makam"]'), false, 'Makam gizli');
    await git(p, 'akort'); esit(await p.isVisible('#akHedef button[data-h="krom"]'), false, 'kromatik gizli');
    await git(p, 'ayar'); esit(await p.isVisible('#ayA4'), false, 'ahenk gizli'); esit(await p.isVisible('.kolay-yalniz'), true);
    await p.click('#ayMod button[data-mod="pro"]'); esit(await p.isVisible('#ayA4'), true); esit(await p.isVisible('#ray button[data-git="makam"]'), true);
    await p.reload(); await p.waitForFunction(() => window.Tezene); esit(await p.evaluate(() => Tezene.st.mod), 'pro');
    await p.context().close();
  });

  await test('T20 ders: ana sayfadan aç, yanlış/doğru cevap, bitir; ilerleme ve günlük görev', async () => {
    const p = await sayfa({ hash: '#ana' });
    dogru(/İlk derse başla/.test(await p.textContent('#devamKart')));
    await p.click('#devamKart [data-ders]'); esit(await p.isVisible('#v-ders'), true); esit(await p.textContent('#dersAd'), 'Bağlamayı tanıyalım');
    esit(await p.isEnabled('#adimIleri'), true); await p.click('#adimIleri'); await p.click('#adimIleri');
    esit(await p.isEnabled('#adimIleri'), false, 'soru cevaplanmadan geçilmez');
    await p.click('.secenek-liste button[data-i="2"]'); esit(await p.isEnabled('#adimIleri'), false); dogru(/bir daha/.test(await p.textContent('#soruGb')));
    await p.click('.secenek-liste button[data-i="0"]'); esit(await p.isEnabled('#adimIleri'), true); await p.click('#adimIleri');
    await p.click('.secenek-liste button[data-i="1"]'); await p.click('#adimIleri');
    dogru(/Ders tamamlandı/.test(await p.textContent('#dersAdim')));
    esit(await p.evaluate(() => Tezene.Ilerleme.biten()), 1);
    await p.click('#dersAdim [data-git="dersler"]'); dogru(/1\/15/.test(await p.textContent('#dersOzet')));
    await git(p, 'ana'); dogru(/Oturuş/.test(await p.textContent('#devamKart')), 'sıradaki ders'); dogru(await p.locator('#gorevler .gorev.bitti').count() >= 1, 'günlük ders görevi');
    await p.reload(); await p.waitForFunction(() => window.Tezene); esit(await p.evaluate(() => Tezene.Ilerleme.biten()), 1);
    // yarıda bırakılan ders kaldığı adımdan açılır
    await p.click('#devamKart [data-ders]'); await p.click('#adimIleri'); await git(p, 'ana');
    dogru(/Derse devam et/.test(await p.textContent('#devamKart'))); await p.click('#devamKart [data-ders]');
    dogru(/Adım 2\/4/.test(await p.textContent('#dersUst')), await p.textContent('#dersUst'));
    await p.context().close();
  });

  await test('T21 ders mikrofon adımı: sahte La duyulur, ilk hedef geçer; mikrofonsuz geçiş kaydedilir', async () => {
    const p = await sayfa({ hash: '#ana' });
    await p.evaluate(() => { location.hash = ''; }); await p.evaluate(() => Tezene.Ders);
    await git(p, 'dersler'); await p.click('[data-ders="d05"]'); await p.click('#adimIleri'); await p.click('#adimIleri');
    esit(await p.textContent('#chNot'), 'La'); dogru(/Alt · boş/.test(await p.textContent('#chYer')));
    dogru(await p.locator('.adim .mini-sap').count() === 1, 'mini sap');
    await p.click('#chBasla'); await p.waitForSelector('#chSira span.tamam', { timeout: 8000 });
    esit(await p.textContent('#chNot'), 'Si'); esit(await p.isEnabled('#adimIleri'), false);
    await p.click('#chAtla'); esit(await p.isEnabled('#adimIleri'), true);
    await p.click('#adimIleri'); dogru(/1 adımı atladınız/.test(await p.textContent('#dersAdim')));
    esit(await p.evaluate(() => Tezene.Dinleyici.akim), null, 'mikrofon kapandı');
    await p.context().close();
  });

  await test('T22 günlük akort görevi: alt tel akortlu algılanınca işaretlenir', async () => {
    const p = await sayfa({ hash: '#akort' });
    await p.click('#akHedef button[data-h="0"]');
    await p.evaluate(() => { Tezene.st.ince = 10; }); // sahte mikrofon +10 sent: ince ayarla La tam akortlu olur
    await p.click('#akBasla'); await p.waitForFunction(() => Tezene.Ilerleme.bugun().akort.includes(0), null, { timeout: 8000 });
    await git(p, 'ana'); dogru(/\(1\/3\)/.test(await p.textContent('#gorevler')), await p.textContent('#gorevler'));
    await p.context().close();
  });

  await test('T23 egzersiz: tempo kaydı, rekor, metronomla çal', async () => {
    const p = await sayfa({ hash: '#dersler' });
    await p.click('#dersSekme button[data-s="egz"]'); esit(await p.locator('.egz').count(), 8);
    await p.fill('#egzBpm-e3', '84'); await p.click('.egz[data-e="e3"] button[data-eg="kaydet"]');
    dogru(/84 bpm/.test(await p.textContent('.egz[data-e="e3"]')));
    await p.fill('#egzBpm-e3', '300'); await p.click('.egz[data-e="e3"] button[data-eg="cal"]');
    esit(await p.evaluate(() => [Tezene.Met.acik, Tezene.st.met.bpm, Tezene.st.met.usul].join()), 'true,300,sofyan');
    esit(await p.getAttribute('.egz[data-e="e3"] button[data-eg="cal"]', 'aria-pressed'), 'true');
    await p.click('.egz[data-e="e3"] button[data-eg="cal"]'); esit(await p.evaluate(() => Tezene.Met.acik), false);
    await p.fill('#egzBpm-e3', '999'); await p.click('.egz[data-e="e3"] button[data-eg="kaydet"]'); esit(await p.evaluate(() => Tezene.Ilerleme.v.egz.e3.length), 1, 'geçersiz tempo kaydedilmez');
    await git(p, 'ana'); dogru(/84/.test(await p.textContent('#istatistik')));
    await p.context().close();
  });

  await test('T24 kayıtlar: kaydet, yeniden yüklemede kalır, sil', async () => {
    const p = await sayfa({ hash: '#defter' });
    dogru(/Henüz kayıt yok/.test(await p.textContent('#skListe')));
    await p.click('#skKayit'); await p.waitForTimeout(1400); await p.click('#skKayit');
    await p.waitForSelector('#skListe li[data-id] audio', { timeout: 5000 });
    await p.reload(); await p.waitForFunction(() => window.Tezene); await p.waitForSelector('#skListe li[data-id]', { timeout: 5000 });
    dogru(/^blob:/.test(await p.getAttribute('#skListe li[data-id] a[download]', 'href')));
    await p.click('#skListe button[data-k="sil"]'); await p.waitForFunction(() => !document.querySelector('#skListe li[data-id]'));
    await p.context().close();
  });

  await test('T25 telefonda Daha menüsü: açılır, Escape ile kapanır, bölüme gider', async () => {
    const p = await sayfa({ vp: { width: 390, height: 844 }, touch: true });
    await p.click('#dahaBtn'); esit(await p.isVisible('#dahaSayfa'), true); await p.keyboard.press('Escape'); esit(await p.isVisible('#dahaSayfa'), false);
    await p.click('#dahaBtn'); await p.click('#dahaSayfa [data-git="kulak"]'); esit(await p.isVisible('#v-kulak'), true); esit(await p.getAttribute('#dahaBtn', 'aria-current'), 'page');
    await p.context().close();
  });

  await test('T28 geri tuşu: önceki bölüme döner; Daha menüsünü kapatır, uygulamadan çıkmaz', async () => {
    const p = await sayfa({ vp: { width: 390, height: 844 }, touch: true, hash: '#ana' });
    await git(p, 'dersler'); await git(p, 'akort');
    await p.goBack(); await p.waitForFunction(() => Tezene.st.v === 'dersler'); esit(await p.isVisible('#v-dersler'), true);
    await p.goBack(); await p.waitForFunction(() => Tezene.st.v === 'ana');
    await p.click('#dahaBtn'); esit(await p.isVisible('#dahaSayfa'), true);
    await p.goBack(); await p.waitForTimeout(200); esit(await p.isVisible('#dahaSayfa'), false); esit(await p.evaluate(() => Tezene.st.v), 'ana', 'menü kapanır, bölüm değişmez');
    await p.click('#dahaBtn'); await p.click('#dahaSayfa [data-git="kulak"]'); await p.goBack(); await p.waitForFunction(() => Tezene.st.v === 'ana');
    esit(await p.evaluate(() => Tezene.yerelUygulama()), false, 'tarayıcıda yerel uygulama sanılmaz');
    await p.context().close();
  });

  await test('T26 hızlanan tempo: ölçü başlarında hedefe kadar artar', async () => {
    const p = await sayfa({ hash: '#ritim' });
    await p.selectOption('#usulSec', '2_4'); await p.fill('#htBas', '200'); await p.fill('#htHedef', '208'); await p.fill('#htArtis', '4'); await p.fill('#htOlcu', '1');
    await p.click('#htBasla'); await p.waitForFunction(() => /Hedefe ulaşıldı: 208/.test(document.querySelector('#htDurum').textContent), null, { timeout: 6000 });
    dogru(/Hedefe ulaşıldı/.test(await p.textContent('#htDurum'))); await p.click('#htBasla'); esit(await p.evaluate(() => Tezene.Met.acik), false);
    await p.context().close();
  });

  await tarayici.close();

  // Ritim ölçümü: 120 bpm tık sesi çalan sahte mikrofonla
  const tikWav = path.join(os.tmpdir(), 'tezene_tik120.wav');
  { const sr = 48000, n = sr * 6, b = Buffer.alloc(44 + n * 2);
    b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
    for (let i = 0; i < n; i++) { const t = (i % (sr / 2)) / sr; const v = t < 0.04 ? Math.sin(2 * Math.PI * 330 * t) * Math.exp(-t * 60) * 0.8 : 0; b.writeInt16LE(Math.round(v * 30000), 44 + i * 2); }
    fs.writeFileSync(tikWav, b); }
  const t2 = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + tikWav] });
  await test('T27 zamanlama testi: düzenli vuruşlar yüksek isabet alır', async () => {
    const ctx = await t2.newContext({ viewport: { width: 1280, height: 800 }, permissions: ['microphone'] }); const p = await ctx.newPage();
    await p.addInitScript(() => localStorage.setItem('tezene_ayar', JSON.stringify({ mod: 'pro', met: { bpm: 120, usul: '2_4' } })));
    await p.goto(URL_ + '#ritim'); await p.waitForFunction(() => window.Tezene);
    await p.click('#ztBasla'); await p.waitForSelector('#ztSonuc .zt-ozet', { timeout: 15000 });
    const y = parseInt((await p.textContent('#ztSonuc .zt-ozet b')).replace('%', ''), 10); dogru(y >= 75, 'isabet %' + y);
    await ctx.close();
  });
  await t2.close(); srv.close();
  console.log(`\n${gecen} geçti, ${kalan.length} kaldı` + (kalan.length ? ': ' + kalan.join(', ') : ''));
  console.log(kalan.length ? 'BAŞARISIZ' : 'HEPSİ GEÇTİ'); process.exit(kalan.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
