/* Tezene – Bağlama atölyesi. Bağımlılıksız, çevrimdışı. */
(() => {
'use strict';
const SURUM = '3.0.0';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const K = 1200 / 53;
const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
const kimlik = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const ikon = (ad) => `<svg aria-hidden="true"><use href="#i-${ad}"/></svg>`;

/* ───────── Müzik modeli ───────── */
const PERDE_53_KOMA = [4, 5, 8, 9, 13, 17, 18, 22, 27, 31, 35, 36, 39, 40, 44, 48, 49];
const PERDE_HAZIR = { '53': PERDE_53_KOMA.map(k => +(k * K).toFixed(2)), '12': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100] };
const TEL_AD = ['Alt', 'Orta', 'Üst'];
const DUZENLER = [
  { id: 'baglama', ad: 'Bağlama düzeni', t: [0, -9, -31] },
  { id: 'bozuk', ad: 'Bozuk (kara) düzen', t: [0, -31, -9] },
  { id: 'misket', ad: 'Misket düzeni', t: [0, -31, -13] },
  { id: 'famustezat', ad: 'Fa müstezat', t: [0, -31, -18] },
  { id: 'domustezat', ad: 'Do müstezat', t: [0, -40, -9] },
  { id: 'abdal', ad: 'Abdal düzeni', t: [0, 0, -9] }
];
const MAKAMLAR = [
  { id: 'rast', ad: 'Rast', a: [9, 8, 5, 9, 9, 8, 5], g: 5, y: 'Rast beşlisi + Rast dörtlüsü' },
  { id: 'ussak', ad: 'Uşşak', a: [8, 5, 9, 9, 4, 9, 9], g: 4, y: 'Uşşak dörtlüsü + Buselik beşlisi' },
  { id: 'bayati', ad: 'Bayati', a: [8, 5, 9, 9, 4, 9, 9], g: 4, y: 'Uşşak dörtlüsü + Buselik beşlisi; seyri Uşşak’tan farklı' },
  { id: 'huseyni', ad: 'Hüseyni', a: [8, 5, 9, 9, 8, 5, 9], g: 5, y: 'Hüseyni beşlisi + Uşşak dörtlüsü' },
  { id: 'hicaz', ad: 'Hicaz', a: [5, 12, 5, 9, 8, 5, 9], g: 4, y: 'Hicaz dörtlüsü + Rast beşlisi' },
  { id: 'kurdi', ad: 'Kürdi', a: [4, 9, 9, 9, 4, 9, 9], g: 4, y: 'Kürdi dörtlüsü + Buselik beşlisi' },
  { id: 'saba', ad: 'Saba', a: [8, 5, 5, 13, 4, 9, 9], g: 3, y: 'Saba dörtlüsü üzerine kurulu' },
  { id: 'karcigar', ad: 'Karcığar', a: [8, 5, 9, 5, 12, 5, 9], g: 4, y: 'Uşşak dörtlüsü + Hicaz beşlisi' },
  { id: 'nihavend', ad: 'Nihavend', a: [9, 4, 9, 9, 4, 9, 9], g: 5, y: 'Buselik beşlisi + Kürdi dörtlüsü; tizde Hicaz dörtlüsü de kullanılır' },
  { id: 'buselik', ad: 'Buselik', a: [9, 4, 9, 9, 4, 9, 9], g: 5, y: 'Buselik beşlisi + Kürdi dörtlüsü' },
  { id: 'cargah', ad: 'Çargah', a: [9, 9, 4, 9, 9, 9, 4], g: 5, y: 'Çargah beşlisi + Çargah dörtlüsü' },
  { id: 'zirguleli', ad: 'Zirgüleli Hicaz', a: [5, 12, 5, 9, 5, 12, 5], g: 0, y: 'Zirgüleli Hicaz beşlisi + Hicaz dörtlüsü' }
];
const USULLER = [
  { id: '2_4', ad: '2/4', g: [2] }, { id: 'semai', ad: '3/4 · Semai', g: [3] }, { id: 'sofyan', ad: '4/4 · Sofyan', g: [2, 2] },
  { id: 'turkaksagi', ad: '5/8 · Türk aksağı', g: [2, 3] }, { id: '6_8', ad: '6/8', g: [3, 3] }, { id: 'devrihindi', ad: '7/8 · Devr-i hindi', g: [3, 2, 2] },
  { id: 'aksak9', ad: '9/8 · Aksak', g: [2, 2, 2, 3] }, { id: 'curcuna', ad: '10/8 · Curcuna', g: [3, 2, 2, 3] }, { id: 'zeybek', ad: '9/4 · Zeybek', g: [2, 2, 2, 3] },
  { id: 'ozel', ad: 'Özel gruplama', g: null }
];
const ARALIKLAR = [
  { k: 4, ad: 'Bakiye', s: '4 koma' }, { k: 5, ad: 'Küçük mücennep', s: '5 koma' }, { k: 8, ad: 'Büyük mücennep', s: '8 koma' },
  { k: 9, ad: 'Tanini', s: '9 koma' }, { k: 12, ad: 'Artık ikili', s: '12 koma' }, { k: 13, ad: 'Küçük üçlü', s: '13 koma' },
  { k: 17, ad: 'Büyük üçlü', s: '17 koma' }, { k: 22, ad: 'Tam dörtlü', s: '22 koma' }, { k: 31, ad: 'Tam beşli', s: '31 koma' }, { k: 53, ad: 'Oktav', s: '53 koma' }
];
const ARALIK_SEVIYE = { kolay: [9, 17, 22, 31, 53], orta: [5, 9, 13, 17, 22, 31], zor: ARALIKLAR.map(a => a.k) };
const DURUMLAR = [['ogreniyor', 'Öğreniyorum'], ['calisiyor', 'Çalışıyorum'], ['hazir', 'Hazır']];

/* ───────── Durum ───────── */
const VARS = () => ({
  duzen: 'baglama', teller: [0, -9, -31], ozelDuzen: [],
  a4: 440, trans: 0, ince: 0,
  perdeHazir: '53', perdeOct: PERDE_HAZIR['53'].map(c => ({ c, on: true })), perdeSayi: 29, sap: 'uzun',
  makam: '', karar: 0,
  isim: 'tr', oktav: false, perdeNo: true, notGoster: true, solak: false, tema: 'koyu', zoom: 1,
  ses: { vol: 80, parlak: 55, sure: 50, yanki: 25 },
  met: { bpm: 90, usul: 'aksak9', ozel: '', ses: 'tik', vol: 70 },
  egz: { mod: 'perde', makam: 'ussak', seviye: 'kolay', yon: 'cik', rekor: 0 },
  ak: { hedef: 'oto', sistem: '53' },
  ozelMakam: [], v: 'ana', mod: null, ders: ''
});
const GORUNUMLER = ['ana', 'dersler', 'ders', 'akort', 'sap', 'makam', 'ritim', 'kulak', 'defter', 'ayar'];
const sayi = (v, a, b, d) => (typeof v === 'number' && isFinite(v) && v >= a && v <= b) ? v : d;
const bool = (v, d) => typeof v === 'boolean' ? v : d;
const sec = (v, list, d) => list.includes(v) ? v : d;
const metin = (v, n, d) => typeof v === 'string' ? v.slice(0, n) : d;
const normTel = t => Array.isArray(t) && t.length === 3 && t.every(x => Number.isInteger(x) && x >= -106 && x <= 53) ? t.slice() : null;
function normDurum(s) {
  const o = VARS(); if (!s || typeof s !== 'object') return o; const d = VARS();
  o.ozelDuzen = Array.isArray(s.ozelDuzen) ? s.ozelDuzen.slice(0, 30).map(x => x && normTel(x.t) ? { id: metin(x.id, 30, kimlik()), ad: metin(x.ad, 30, 'Düzen'), t: normTel(x.t) } : null).filter(Boolean) : [];
  o.duzen = metin(s.duzen, 30, d.duzen); o.teller = normTel(s.teller) || d.teller;
  o.a4 = sayi(s.a4, 380, 480, 440); o.trans = Math.round(sayi(s.trans, -12, 12, 0)); o.ince = Math.round(sayi(s.ince, -50, 50, 0));
  o.perdeHazir = sec(s.perdeHazir, ['53', '12', 'ozel'], '53');
  if (Array.isArray(s.perdeOct)) { const p = s.perdeOct.slice(0, 60).filter(x => x && typeof x.c === 'number' && x.c > 5 && x.c < 1195).map(x => ({ c: +x.c.toFixed(2), on: x.on !== false })); if (p.length) o.perdeOct = p.sort((a, b) => a.c - b.c); }
  o.perdeSayi = Math.round(sayi(s.perdeSayi, 8, 45, 29)); o.sap = sec(s.sap, ['kisa', 'uzun'], 'uzun');
  o.ozelMakam = Array.isArray(s.ozelMakam) ? s.ozelMakam.slice(0, 40).map(x => x && Array.isArray(x.a) && x.a.length >= 2 && x.a.length <= 16 && x.a.every(n => Number.isInteger(n) && n > 0 && n <= 30) ? { id: metin(x.id, 30, kimlik()), ad: metin(x.ad, 40, 'Dizi'), a: x.a.slice() } : null).filter(Boolean) : [];
  o.makam = typeof s.makam === 'string' && (s.makam === '' || MAKAMLAR.some(m => m.id === s.makam) || o.ozelMakam.some(m => m.id === s.makam)) ? s.makam : '';
  o.karar = Math.round(sayi(s.karar, -53, 53, 0));
  o.isim = sec(s.isim, ['tr', 'harf'], 'tr'); o.oktav = bool(s.oktav, false); o.perdeNo = bool(s.perdeNo, true); o.notGoster = bool(s.notGoster, true);
  o.solak = bool(s.solak, false); o.tema = sec(s.tema, ['oto', 'acik', 'koyu'], 'koyu'); o.zoom = sayi(s.zoom, 0.5, 2.5, 1);
  const ss = s.ses || {}; for (const k of ['vol', 'parlak', 'sure', 'yanki']) o.ses[k] = Math.round(sayi(ss[k], 0, 100, d.ses[k]));
  const m = s.met || {};
  o.met.bpm = Math.round(sayi(m.bpm, 30, 300, 90)); o.met.usul = sec(m.usul, USULLER.map(u => u.id), 'aksak9');
  o.met.ozel = metin(m.ozel, 40, ''); o.met.ses = sec(m.ses, ['tik', 'tok', 'dum'], 'tik'); o.met.vol = Math.round(sayi(m.vol, 0, 100, 70));
  const e = s.egz || {};
  o.egz.mod = sec(e.mod, ['perde', 'aralik'], 'perde'); o.egz.makam = metin(e.makam, 30, 'ussak');
  o.egz.seviye = sec(e.seviye, ['kolay', 'orta', 'zor'], 'kolay'); o.egz.yon = sec(e.yon, ['cik', 'in', 'bir'], 'cik'); o.egz.rekor = Math.round(sayi(e.rekor, 0, 1e6, 0));
  const a = s.ak || {}; o.ak.hedef = sec(a.hedef, ['oto', '0', '1', '2', 'krom'], 'oto'); o.ak.sistem = sec(a.sistem, ['53', '12'], '53');
  o.mod = sec(s.mod, ['kolay', 'pro'], null); o.ders = metin(s.ders, 10, '');
  o.v = sec(s.v, GORUNUMLER, 'ana'); if (o.v === 'ders') o.v = 'dersler';
  return o;
}
let st = normDurum(LS.get('tezene_ayar', null));
let kayitZ = 0, bekleyen = false;
function hemenKaydet() { clearTimeout(kayitZ); bekleyen = false; if (!LS.set('tezene_ayar', st)) bildir('Ayarlar kaydedilemedi: tarayıcı depolaması kapalı olabilir.'); }
function kaydet() { clearTimeout(kayitZ); bekleyen = true; kayitZ = setTimeout(hemenKaydet, 150); }
window.addEventListener('pagehide', () => { if (bekleyen) hemenKaydet(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && bekleyen) hemenKaydet(); });

/* ───────── Nota adları ───────── */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const ust = n => String(n).split('').map(d => SUP[+d]).join('');
const DOGAL = [['Do', 'C', 0], ['Re', 'D', 9], ['Mi', 'E', 18], ['Fa', 'F', 22], ['Sol', 'G', 31], ['La', 'A', 40], ['Si', 'B', 49]];
const YAZIM = { Do: { 4: '#', 5: '♭' }, Re: { 4: '♭', 5: '♭' }, Fa: { 4: '#', 5: '#' }, Sol: { 4: '#', 5: '#' }, La: { 4: '♭', 5: '♭' } };
function notaAdiK(k) {
  const doK = k + 40; const okt = 4 + Math.floor(doK / 53); const r = mod(doK, 53);
  let i = DOGAL.length - 1; while (DOGAL[i][2] > r) i--;
  const alt = DOGAL[i], ustN = i + 1 < DOGAL.length ? DOGAL[i + 1] : ['Do', 'C', 53], o = r - alt[2], ara = ustN[2] - alt[2];
  let n, d, w = 0;
  if (o === 0) { n = alt; d = 0; }
  else { const t = ara === 9 && (o === 4 || o === 5) ? YAZIM[alt[0]][o] : (o <= ara / 2 ? '#' : '♭'); if (t === '#') { n = alt; d = o; } else { n = ustN; d = o - ara; if (ustN[2] === 53) w = 1; } }
  const ad = st.isim === 'harf' ? n[1] : n[0];
  const isaret = d > 0 ? '#' + ust(d) : d < 0 ? '♭' + ust(-d) : '';
  return { ad, isaret, okt: okt + w, metin: ad + isaret };
}
function notaAdi(c, oktavla) {
  const k = Math.round(c / K); const n = notaAdiK(k); const sapma = c - k * K; const o = oktavla == null ? st.oktav : oktavla;
  return { ...n, k, sapma, tam: n.metin + (o ? n.okt : ''), html: esc(n.metin) + (o ? `<sub>${n.okt}</sub>` : '') };
}
const AD12 = { tr: ['La', 'La#', 'Si', 'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#'], harf: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] };
function notaAdi12(c) { const s = Math.round(c / 100); return { metin: AD12[st.isim][mod(s, 12)], okt: 4 + Math.floor((s + 9) / 12), sapma: c - s * 100, hedef: s * 100 }; }
const frekans = c => st.a4 * Math.pow(2, (c + st.trans * 100 + st.ince) / 1200);
const sentF = f => 1200 * Math.log2(f / st.a4) - st.trans * 100 - st.ince;
const hz = f => f.toFixed(f < 100 ? 2 : 1).replace('.', ',');

function perdeler() {
  const oct = st.perdeOct.filter(p => p.on).map(p => p.c).sort((a, b) => a - b); const out = [];
  for (let o = 0; o < 5 && out.length < st.perdeSayi; o++) { for (const c of oct) { if (out.length >= st.perdeSayi) break; out.push(o * 1200 + c); } if (out.length < st.perdeSayi) out.push((o + 1) * 1200); }
  return out;
}
function sapSayisi(sap) {
  const sinir = sap === 'kisa' ? 1200 + 9 * K + 1 : 1200 + 35 * K + 1; const oct = st.perdeOct.filter(p => p.on).map(p => p.c); let n = 0;
  for (let o = 0; o < 3; o++) { for (const c of oct) if (o * 1200 + c <= sinir) n++; if ((o + 1) * 1200 <= sinir) n++; }
  return clamp(n, 8, 45);
}
const tumMakamlar = () => MAKAMLAR.concat(st.ozelMakam.map(m => ({ ...m, g: 0, y: 'Kendi diziniz', ozel: true })));
const makamBul = id => tumMakamlar().find(m => m.id === id) || null;
function diziK(m, karar) { const out = [karar]; let t = karar; for (const a of m.a) { t += a; out.push(t); } return out; }
function makamSinif(m, karar) { const r = new Map(); diziK(m, karar).forEach((k, i) => { const pc = mod(k, 53); if (!r.has(pc)) r.set(pc, i === 0 ? 'k' : (m.g && i === m.g - 1 ? 'g' : 'm')); }); return r; }
function sapSesleri() { const p = perdeler(), out = []; for (let t = 0; t < 3; t++) { const a = st.teller[t] * K; out.push({ c: a, tel: t, p: 0 }); p.forEach((c, i) => out.push({ c: a + c, tel: t, p: i + 1 })); } return out; }
function eksikSesler(m, karar) {
  const var_ = new Set(); for (const s of sapSesleri()) { const k = Math.round(s.c / K); if (Math.abs(s.c - k * K) <= 8) var_.add(mod(k, 53)); }
  return diziK(m, karar).filter(k => !var_.has(mod(k, 53)));
}
const duzenListesi = () => DUZENLER.concat(st.ozelDuzen);
const duzenAdi = () => { const d = duzenListesi().find(x => x.id === st.duzen); return d ? d.ad : 'Özel düzen'; };
const duzenSecenek = () => duzenListesi().map(d => [d.id, d.ad]).concat(duzenListesi().some(d => d.id === st.duzen) ? [] : [[st.duzen, 'Özel düzen (kaydedilmedi)']]);
function kararSecenekleri() {
  const set = new Set(); for (const s of sapSesleri()) { const k = Math.round(s.c / K); if (Math.abs(s.c - k * K) <= 8) set.add(mod(k, 53)); }
  const list = [...set].map(pc => pc > 21 ? pc - 53 : pc); const kr = mod(st.karar + 31, 53) - 31; if (!list.includes(kr)) list.push(kr);
  return list.sort((a, b) => a - b).map(k => [k, notaAdi(k * K, false).metin]);
}

/* ───────── Ses motoru (yalnız referans sesleri ve metronom) ───────── */
const Ses = {
  ctx: null, cache: new Map(), log: [], aktif: {},
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    let c; try { c = new AC({ latencyHint: 'interactive' }); } catch (e) { return null; }
    this.ctx = c;
    this.bus = c.createGain();
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70;
    const govde = c.createBiquadFilter(); govde.type = 'peaking'; govde.frequency.value = 230; govde.Q.value = 1.1; govde.gain.value = 4;
    const parlak = c.createBiquadFilter(); parlak.type = 'peaking'; parlak.frequency.value = 2600; parlak.Q.value = 0.8; parlak.gain.value = 3;
    this.islak = c.createGain(); const yanki = c.createConvolver(); yanki.buffer = this.ir(1.9);
    this.cikis = c.createGain(); this.metBus = c.createGain();
    const komp = c.createDynamicsCompressor(); komp.threshold.value = -14; komp.ratio.value = 4;
    this.bus.connect(hp); hp.connect(govde); govde.connect(parlak); parlak.connect(this.cikis); parlak.connect(yanki); yanki.connect(this.islak); this.islak.connect(this.cikis);
    this.metBus.connect(this.cikis); this.cikis.connect(komp); komp.connect(c.destination);
    this.uygula(); if (c.state === 'suspended') c.resume().catch(() => {});
    return c;
  },
  uygula() { if (!this.ctx) return; this.cikis.gain.value = st.ses.vol / 100 * 0.9; this.islak.gain.value = st.ses.yanki / 100 * 0.55; this.metBus.gain.value = st.met.vol / 100; },
  ir(sn) { const c = this.ctx, n = Math.floor(sn * c.sampleRate), b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); } return b; },
  gurultu() { if (this._g) return this._g; const c = this.ctx, n = Math.floor(c.sampleRate * 0.05), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); return (this._g = b); },
  ks(f) { // Karplus–Strong telli ses
    const c = this.ctx, sr = c.sampleRate, s = st.ses, anahtar = f.toFixed(1) + '|' + s.parlak + '|' + s.sure;
    if (this.cache.has(anahtar)) return this.cache.get(anahtar);
    const sS = 0.5 - 0.38 * (s.parlak / 100), N = Math.max(2, Math.floor(sr / f - sS)), T60 = 0.6 + (s.sure / 100) * 4.2;
    const len = Math.floor(Math.min(6, T60 * 0.9 + 0.2) * sr), b = c.createBuffer(1, len, sr), d = b.getChannelData(0), rho = Math.pow(10, -3 / (T60 * f));
    const a = 0.12 + 0.85 * (s.parlak / 100); let lp = 0; const tel = new Float32Array(N);
    for (let i = 0; i < N; i++) { lp += a * ((Math.random() * 2 - 1) - lp); tel[i] = lp; }
    const pk = Math.max(1, Math.floor(N * 0.13)); for (let i = N - 1; i >= pk; i--) tel[i] -= 0.6 * tel[i - pk];
    let tepe = 0; for (let i = 0; i < len; i++) { const v = i < N ? tel[i] : rho * ((1 - sS) * d[i - N] + sS * (i - N - 1 >= 0 ? d[i - N - 1] : 0)); d[i] = v; const m = Math.abs(v); if (m > tepe) tepe = m; }
    const kz = tepe > 0 ? 0.9 / tepe : 1, fade = Math.floor(sr * 0.05); for (let i = 0; i < len; i++) d[i] *= kz * (i > len - fade ? (len - i) / fade : 1);
    const v = { buf: b, hiz: f * (N + sS) / sr }; this.cache.set(anahtar, v); if (this.cache.size > 200) this.cache.delete(this.cache.keys().next().value); return v;
  },
  cal(c, kanal, ops = {}) {
    const f = frekans(c); this.log.push({ f, c, kanal, t: performance.now() }); if (this.log.length > 300) this.log.shift();
    const ctx = this.init(); if (!ctx) return; const t = ctx.currentTime + 0.004;
    if (kanal && this.aktif[kanal]) this.aktif[kanal](t);
    const g = ctx.createGain(); g.gain.value = 0.45; g.connect(this.bus);
    const k = this.ks(f), src = ctx.createBufferSource(); src.buffer = k.buf; src.playbackRate.value = k.hiz; src.connect(g); src.start(t);
    const src2 = ctx.createBufferSource(), g2 = ctx.createGain(); src2.buffer = k.buf; src2.playbackRate.value = k.hiz * Math.pow(2, 3.5 / 1200); g2.gain.value = 0.7; src2.connect(g2); g2.connect(g); src2.start(t);
    if (ops.sure) g.gain.setTargetAtTime(0, t + ops.sure, 0.08);
    if (kanal) this.aktif[kanal] = tt => { try { g.gain.cancelScheduledValues(tt); g.gain.setTargetAtTime(0, tt, 0.03); src.stop(tt + 0.3); src2.stop(tt + 0.3); } catch (e) {} };
  },
  tik(t, seviye) {
    const ctx = this.ctx, tur = st.met.ses, g = ctx.createGain(); g.connect(this.metBus); const vol = [0.35, 0.6, 0.9][seviye];
    if (tur === 'tik') { const o = ctx.createOscillator(); o.frequency.value = [880, 1320, 1760][seviye]; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); o.connect(g); o.start(t); o.stop(t + 0.06); }
    else if (tur === 'tok') { const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(); s.buffer = this.gurultu(); bp.type = 'bandpass'; bp.Q.value = 9; bp.frequency.value = [1200, 1800, 2500][seviye]; g.gain.setValueAtTime(vol * 2.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); s.connect(bp); bp.connect(g); s.start(t); s.stop(t + 0.06); }
    else if (seviye > 0) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.14); g.gain.setValueAtTime(vol * 1.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); o.start(t); o.stop(t + 0.24); }
    else { const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(); s.buffer = this.gurultu(); hp.type = 'highpass'; hp.frequency.value = 2500; g.gain.setValueAtTime(vol * 1.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04); s.connect(hp); hp.connect(g); s.start(t); s.stop(t + 0.05); }
  }
};

/* ───────── Perde algılama (YIN) ───────── */
function perdeAlgila(buf, sr) {
  const n = buf.length; let rms = 0; for (let i = 0; i < n; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / n); if (rms < 0.008) return null;
  const maxTau = Math.min(Math.floor(sr / 50), Math.floor(n / 2)), minTau = Math.max(2, Math.floor(sr / 1500)), W = n - maxTau, d = new Float32Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) { let s = 0; for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; } d[tau] = s; }
  const cm = new Float32Array(maxTau + 1); cm[0] = 1; let top = 0; for (let tau = 1; tau <= maxTau; tau++) { top += d[tau]; cm[tau] = top > 0 ? d[tau] * tau / top : 1; }
  let tau = -1; for (let t = minTau; t <= maxTau; t++) { if (cm[t] < 0.12) { while (t + 1 <= maxTau && cm[t + 1] < cm[t]) t++; tau = t; break; } }
  if (tau < 0) { let en = minTau; for (let t = minTau; t <= maxTau; t++) if (cm[t] < cm[en]) en = t; if (cm[en] > 0.35) return null; tau = en; }
  let ince = tau; if (tau > 1 && tau < maxTau) { const a = cm[tau - 1], b = cm[tau], c = cm[tau + 1], p = (a - c) / (2 * (a - 2 * b + c)); if (isFinite(p) && Math.abs(p) < 1) ince = tau + p; }
  return { f: sr / ince, guven: 1 - cm[tau], rms };
}

/* ───────── Yardımcılar ───────── */
let bildirimZ = 0;
function bildir(m) { const b = $('#bildirim'); b.textContent = m; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(bildirimZ); bildirimZ = setTimeout(() => { b.hidden = true; }, 2800); }
function secenekler(el, list, deger) { el.innerHTML = list.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(deger) ? ' selected' : ''}>${esc(t)}</option>`).join(''); }
function sekmeSec(el, attr, deger) { $$('button', el).forEach(b => b.setAttribute('aria-checked', b.dataset[attr] === String(deger))); }
const koyuMu = () => st.tema === 'koyu' || (st.tema === 'oto' && matchMedia('(prefers-color-scheme: dark)').matches);
function temaUygula() { const k = koyuMu(); document.documentElement.dataset.theme = k ? 'dark' : 'light'; const m = $('meta[name=theme-color]'); if (m) m.content = k ? '#120e0b' : '#f2ede6'; Strob.renkler = null; Strob.ciz(); }
function ozetGuncelle() {
  $('#duzenOzet').innerHTML = `<b>${esc(duzenAdi())}</b>${[2, 1, 0].map(t => esc(notaAdi(st.teller[t] * K, false).metin)).join(' · ')} · La ${String(st.a4).replace('.', ',')} Hz`;
}
function duzenSec(id) { const d = duzenListesi().find(x => x.id === id); if (!d) return; st.duzen = id; st.teller = d.t.slice(); kaydet(); yenile(); }

/* ───────── STROB (akort göstergesi) ───────── */
const Strob = {
  a: [0, 0, 0], sapma: null, aktif: false, son: 0, raf: 0, renkler: null,
  renk() { if (this.renkler) return this.renkler; const s = getComputedStyle(document.documentElement); const g = k => s.getPropertyValue(k).trim(); return (this.renkler = { zemin: g('--zemin'), yuzey: g('--yuzey2'), cizgi: g('--cizgi2'), etiket: g('--etiket'), etiketYazi: g('--etiket-yazi'), yesil: g('--yesil'), kirmizi: g('--kirmizi'), silik: g('--silik'), yazi: g('--yazi') }); },
  boyut() { const cv = $('#strob'); if (!cv) return; const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.round(r.width * dpr); if (w > 0 && cv.width !== w) { cv.width = w; cv.height = w; } },
  ciz() {
    const cv = $('#strob'); if (!cv || st.v !== 'akort') return; const x = cv.getContext('2d'); const W = cv.width, R = W / 2, r = this.renk();
    x.clearRect(0, 0, W, W); x.save(); x.translate(R, R);
    // plak
    x.beginPath(); x.arc(0, 0, R * 0.985, 0, Math.PI * 2); x.fillStyle = '#0b0b0c'; x.fill();
    x.lineWidth = Math.max(1, W / 900); x.strokeStyle = 'rgba(255,255,255,0.035)';
    for (let rr = R * 0.47; rr < R * 0.97; rr += R * 0.012) { x.beginPath(); x.arc(0, 0, rr, 0, Math.PI * 2); x.stroke(); }
    // strob halkaları: dış kaba, orta, iç ince
    const durgun = this.sapma != null && Math.abs(this.sapma) <= 3, canli = this.sapma != null;
    const halkalar = [[0.90, 72, 0.045], [0.78, 60, 0.04], [0.66, 48, 0.035]];
    halkalar.forEach(([rad, n, uz], i) => {
      x.save(); x.rotate(this.a[i]);
      x.fillStyle = !canli ? r.silik : durgun ? r.yesil : (i === 0 ? r.etiket : i === 1 ? r.etiket : r.yazi);
      x.globalAlpha = canli ? (i === 2 ? 0.9 : 1) : 0.45;
      const bw = (2 * Math.PI * rad * R / n) * 0.48;
      for (let j = 0; j < n; j++) { x.rotate(2 * Math.PI / n); x.fillRect(-bw / 2, -rad * R - uz * R / 2, bw, uz * R); }
      x.restore();
    });
    x.globalAlpha = 1;
    // etiket
    x.beginPath(); x.arc(0, 0, R * 0.44, 0, Math.PI * 2); x.fillStyle = r.etiket; x.fill();
    x.beginPath(); x.arc(0, 0, R * 0.40, 0, Math.PI * 2); x.strokeStyle = 'rgba(27,20,6,0.35)'; x.lineWidth = Math.max(1, W / 500); x.stroke();
    x.fillStyle = r.etiketYazi; x.textAlign = 'center'; x.textBaseline = 'middle';
    const hedef = st.ak.hedef === 'oto' ? 'Otomatik' : st.ak.hedef === 'krom' ? (st.ak.sistem === '53' ? 'Kromatik · 53' : 'Kromatik · 12') : TEL_AD[+st.ak.hedef] + ' tel · ' + notaAdi(st.teller[+st.ak.hedef] * K, false).metin;
    x.font = `700 ${Math.round(R * 0.075)}px system-ui, -apple-system, "Segoe UI", sans-serif`; x.fillText(hedef, 0, -R * 0.2);
    x.font = `600 ${Math.round(R * 0.058)}px system-ui, -apple-system, "Segoe UI", sans-serif`; x.globalAlpha = 0.75;
    x.fillText(`La ${String(st.a4).replace('.', ',')} Hz` + (st.trans ? ` · ${st.trans > 0 ? '+' : ''}${st.trans}` : ''), 0, R * 0.2); x.globalAlpha = 1;
    x.restore();
    // sabit okuma işareti (saat 12)
    x.save(); x.translate(R, 0); x.beginPath(); x.moveTo(-R * 0.035, 0); x.lineTo(R * 0.035, 0); x.lineTo(0, R * 0.06); x.closePath(); x.fillStyle = r.yazi; x.fill(); x.restore();
  },
  dongu(t) {
    const dt = this.son ? Math.min(0.05, (t - this.son) / 1000) : 0; this.son = t;
    if (this.sapma != null) { const s = clamp(this.sapma, -60, 60); this.a[0] += s * 0.012 * dt; this.a[1] += s * 0.03 * dt; this.a[2] += s * 0.08 * dt; }
    this.ciz(); if (this.aktif) this.raf = requestAnimationFrame(tt => this.dongu(tt));
  },
  baslat() { if (this.aktif) return; this.aktif = true; this.son = 0; this.raf = requestAnimationFrame(t => this.dongu(t)); },
  durdur() { this.aktif = false; cancelAnimationFrame(this.raf); this.sapma = null; this.ciz(); }
};

/* ───────── İLERLEME (dersler, egzersizler, günlük görevler) ───────── */
const MF = window.TEZENE_MUFREDAT || { seviyeler: [], dersler: [], egzersizler: [] };
const gunAnahtar = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const Ilerleme = {
  v: null,
  yukle() {
    const x = LS.get('tezene_ilerleme', null), o = { dersler: {}, egz: {}, gun: {} };
    if (x && typeof x === 'object') {
      if (x.dersler && typeof x.dersler === 'object') for (const d of MF.dersler) { const r = x.dersler[d.id]; if (r && typeof r === 'object') o.dersler[d.id] = { adim: Math.round(sayi(r.adim, 0, d.adimlar.length, 0)), bitti: typeof r.bitti === 'number' ? r.bitti : null, atlanan: Array.isArray(r.atlanan) ? r.atlanan.filter(Number.isInteger).slice(0, 30) : [] }; }
      if (x.egz && typeof x.egz === 'object') for (const e of MF.egzersizler) { const r = x.egz[e.id]; if (Array.isArray(r)) o.egz[e.id] = r.filter(k => k && typeof k.ts === 'number' && Number.isInteger(k.bpm) && k.bpm >= 20 && k.bpm <= 400).slice(-200); }
      if (x.gun && typeof x.gun === 'object') for (const [g, r] of Object.entries(x.gun).slice(-400)) { if (/^\d{4}-\d\d-\d\d$/.test(g) && r && typeof r === 'object') o.gun[g] = { akort: Array.isArray(r.akort) ? r.akort.filter(t => [0, 1, 2].includes(t)) : [], ders: r.ders === true, egz: r.egz === true, met: sayi(r.met, 0, 864e5, 0) }; }
    }
    this.v = o;
  },
  sakla() { LS.set('tezene_ilerleme', this.v); },
  bugun() { const g = gunAnahtar(); return this.v.gun[g] || (this.v.gun[g] = { akort: [], ders: false, egz: false, met: 0 }); },
  akortTel(t) { const b = this.bugun(); if (!b.akort.includes(t)) { b.akort.push(t); this.sakla(); if (b.akort.length === 3) bildir('Bugünün görevi tamam: üç tel de akortlu.'); } },
  dersAdim(id, adim) { const r = this.v.dersler[id] || (this.v.dersler[id] = { adim: 0, bitti: null, atlanan: [] }); r.adim = Math.max(r.adim, adim); this.bugun().ders = true; this.sakla(); },
  dersBitir(id) { const r = this.v.dersler[id] || (this.v.dersler[id] = { adim: 0, bitti: null, atlanan: [] }); r.bitti = r.bitti || Date.now(); r.adim = (MF.dersler.find(d => d.id === id) || { adimlar: [] }).adimlar.length; this.bugun().ders = true; this.sakla(); },
  atla(id, i) { const r = this.v.dersler[id] || (this.v.dersler[id] = { adim: 0, bitti: null, atlanan: [] }); if (!r.atlanan.includes(i)) r.atlanan.push(i); this.sakla(); },
  egzKaydet(id, bpm) { (this.v.egz[id] = this.v.egz[id] || []).push({ ts: Date.now(), bpm }); this.bugun().egz = true; this.sakla(); },
  metEkle(ms) { if (ms > 0) { this.bugun().met += ms; this.sakla(); } },
  biten() { return MF.dersler.filter(d => this.v.dersler[d.id] && this.v.dersler[d.id].bitti).length; },
  siradaki() { return MF.dersler.find(d => !(this.v.dersler[d.id] && this.v.dersler[d.id].bitti)) || null; },
  seviye() { const s = this.siradaki(); return s ? s.sv : MF.seviyeler.length; },
  enIyi(id) { const l = this.v.egz[id] || []; return l.length ? Math.max(...l.map(k => k.bpm)) : null; },
  seri() {
    const gunler = new Set(Object.entries(this.v.gun).filter(([, r]) => r.akort.length || r.ders || r.egz || r.met >= 60000).map(([g]) => g));
    Defter.v.oturumlar.forEach(o => gunler.add(gunAnahtar(new Date(o.bas))));
    const d = new Date(); if (!gunler.has(gunAnahtar(d))) d.setDate(d.getDate() - 1);
    let n = 0; while (gunler.has(gunAnahtar(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
};

/* ───────── PLATFORM: Android uygulaması (Capacitor), ekranı açık tutma, dosya verme ───────── */
const yerelUygulama = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
// Tarayıcıda dosyayı indirir; Android uygulamasında indirme bağlantısı çalışmadığı için paylaşım menüsüyle verir.
async function dosyaVer(blob, ad) {
  if (yerelUygulama()) {
    const P = window.Capacitor.Plugins || {};
    if (!P.Filesystem || !P.Share) throw new Error('Dosya paylaşımı bu sürümde kullanılamıyor.');
    const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
    const temiz = ad.replace(/[\\/:*?"<>|]+/g, '').trim() || 'tezene-dosya';
    const w = await P.Filesystem.writeFile({ path: temiz, data: b64, directory: 'CACHE' });
    try { await P.Share.share({ title: temiz, files: [w.uri] }); } catch (e) { if (!/cancel/i.test(String(e && e.message || e))) throw e; }
    return 'paylasildi';
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'indirildi';
}
// Akort, ders ve metronom sırasında ekranın kararmasını önler (destekleyen tarayıcılarda).
const Uyanik = {
  nedenler: new Set(), kilit: null, istek: null,
  async guncelle() {
    try {
      if (this.nedenler.size && !this.kilit && !this.istek && navigator.wakeLock && document.visibilityState === 'visible') {
        this.istek = navigator.wakeLock.request('screen'); this.kilit = await this.istek; this.istek = null;
        this.kilit.addEventListener('release', () => { this.kilit = null; });
        if (!this.nedenler.size) this.guncelle();
      } else if (!this.nedenler.size && this.kilit) { const k = this.kilit; this.kilit = null; await k.release(); }
    } catch (e) { this.istek = null; }
  },
  ac(n) { this.nedenler.add(n); this.guncelle(); },
  kapat(n) { this.nedenler.delete(n); this.guncelle(); }
};
document.addEventListener('visibilitychange', () => Uyanik.guncelle());

/* ───────── DİNLEYİCİ (ortak mikrofon) ───────── */
function mikHata(e) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'Bu tarayıcı mikrofona erişemiyor. Uygulamayı https:// ya da localhost adresinden açın.';
  if (e && e.name === 'NotAllowedError') return 'Mikrofon izni verilmedi. Adres çubuğundaki site ayarlarından izin verip yeniden deneyin.';
  if (e && e.name === 'NotFoundError') return 'Mikrofon bulunamadı. Bir mikrofon bağlayıp yeniden deneyin.';
  return 'Mikrofon açılamadı. Başka bir uygulama kullanıyor olabilir.';
}
const Dinleyici = {
  akim: null, an: null, buf: null, aboneler: new Map(), sayac: 0, zaman: 0, acilis: null,
  async ac() {
    if (this.akim) return;
    if (this.acilis) return this.acilis;
    this.acilis = (async () => {
      const ctx = Ses.init(); if (!ctx) throw new Error('Tarayıcı ses işlemeyi desteklemiyor.');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error(mikHata());
      let akim; try { akim = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { throw new Error(mikHata(e)); }
      this.akim = akim; const src = ctx.createMediaStreamSource(akim); this.an = ctx.createAnalyser(); this.an.fftSize = 4096; src.connect(this.an); this.buf = new Float32Array(this.an.fftSize);
      Uyanik.ac('mik');
      this.zaman = setInterval(() => { if (!this.an) return; this.an.getFloatTimeDomainData(this.buf); const t = Ses.ctx.currentTime; this.aboneler.forEach(fn => { try { fn(this.buf, Ses.ctx.sampleRate, t); } catch (e) { /* abone hatası diğerlerini durdurmaz */ } }); }, 10);
    })();
    try { await this.acilis; } finally { this.acilis = null; }
  },
  abone(fn) { const id = ++this.sayac; this.aboneler.set(id, fn); return id; },
  birak(id) { this.aboneler.delete(id); if (!this.aboneler.size) this.kapat(); },
  kapat() { clearInterval(this.zaman); if (this.akim) this.akim.getTracks().forEach(t => t.stop()); this.akim = null; this.an = null; this.aboneler.clear(); Uyanik.kapat('mik'); }
};
// Belirli aralıklarla perde ölçen yardımcı abone
function perdeDinle(fn, aralik = 40) { let son = 0; return Dinleyici.abone((buf, sr, t) => { if (t - son < aralik / 1000) return; son = t; fn(perdeAlgila(buf, sr), t); }); }

/* ───────── RİTİM ÖLÇER (mikrofonla zamanlama) ───────── */
function ritimOlc(o, cb) {
  // o: {bpm, g, olcu, vur:'hepsi'|'grup', tol}; cb: {vurus(i, seviye, sayim), sonuc(r), hata(m)}
  const ctx = Ses.init(); if (!ctx) { cb.hata('Tarayıcı ses çalamıyor.'); return { durdur() {} }; }
  let bitti = false, abone = null; const zamanlar = [];
  const desen = []; o.g.forEach((n, gi) => { for (let j = 0; j < n; j++) desen.push(j === 0 ? (gi === 0 ? 2 : 1) : 0); });
  const ara = 60 / o.bpm, L = desen.length, bas = ctx.currentTime + 0.5, sayimSon = bas + L * ara, toplam = L * (1 + o.olcu);
  const beklenen = []; for (let i = L; i < toplam; i++) { const s = desen[i % L]; if (o.vur !== 'grup' || s > 0) beklenen.push(bas + i * ara); }
  let sessiz = false, taban = 0.004, onceki = 0, sonVurus = -1;
  const planlar = [];
  const sesli = i => !(sessiz && i >= L);
  for (let i = 0; i < toplam; i++) {
    const t = bas + i * ara, s = desen[i % L];
    planlar.push(setTimeout(() => { if (bitti) return; if (sesli(i)) Ses.tik(ctx.currentTime + 0.005, s); cb.vurus(i % L, s, i < L, sessiz && i >= L); }, Math.max(0, (t - ctx.currentTime) * 1000 - 5)));
  }
  // Sayım ölçüsünde tık sesi mikrofona karışıyor mu? Karışıyorsa ölçülen ölçülerde tık susar, ışıkla devam edilir.
  planlar.push(setTimeout(() => { const say = zamanlar.filter(z => z < sayimSon - 0.02).length; if (say >= Math.ceil(L * 0.6)) { sessiz = true; cb.uyari && cb.uyari('Tık sesi mikrofona karışıyor; ölçüm sırasında metronom yalnız ışıkla gösterilecek. Kulaklık takarsanız sesli çalışır.'); } zamanlar.length = 0; }, Math.max(0, (sayimSon - ctx.currentTime) * 1000 - 15)));
  planlar.push(setTimeout(() => bitir(), Math.max(0, (bas + toplam * ara + 0.35 - ctx.currentTime) * 1000)));
  Dinleyici.ac().then(() => {
    if (bitti) return;
    const n = Math.floor(ctx.sampleRate * 0.01);
    abone = Dinleyici.abone((buf, sr, t) => {
      let s = 0; for (let i = buf.length - n; i < buf.length; i++) s += buf[i] * buf[i]; const rms = Math.sqrt(s / n);
      const esik = Math.max(0.02, taban * 5);
      if (rms > esik && onceki <= esik && t - sonVurus > 0.09) { sonVurus = t; zamanlar.push(t - 0.005); }
      else if (rms < esik) taban = taban * 0.95 + rms * 0.05;
      onceki = rms;
    });
  }).catch(e => { if (!bitti) { bitti = true; planlar.forEach(clearTimeout); cb.hata(e.message); } });
  function bitir() {
    if (bitti) return; bitti = true; if (abone) Dinleyici.birak(abone);
    const farklar = beklenen.map(e => { let en = null; for (const z of zamanlar) { const d = z - e; if (Math.abs(d) <= ara * 0.45 && (en == null || Math.abs(d) < Math.abs(en))) en = d; } return en; });
    const bulunan = farklar.filter(d => d != null).sort((a, b) => a - b), medyan = bulunan.length ? bulunan[bulunan.length >> 1] : 0;
    const tol = o.tol || (st.mod === 'pro' ? 0.05 : 0.08);
    const izler = farklar.map(d => d != null && Math.abs(d - medyan) <= tol);
    const sap = bulunan.map(d => d - medyan), std = sap.length ? Math.sqrt(sap.reduce((a, d) => a + d * d, 0) / sap.length) : 0;
    cb.sonuc({ isabet: beklenen.length ? izler.filter(Boolean).length / beklenen.length : 0, medyan, std, izler, vurus: zamanlar.length, sessiz });
  }
  return { durdur() { if (bitti) return; bitti = true; planlar.forEach(clearTimeout); if (abone) Dinleyici.birak(abone); } };
}

/* ───────── DEPO (kayıtlar için IndexedDB) ───────── */
const Depo = {
  db: null, bellek: [], kalici: true,
  ac() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      let r; try { r = indexedDB.open('tezene', 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('kayitlar')) r.result.createObjectStore('kayitlar', { keyPath: 'id' }); };
      r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error);
    }).catch(e => { this.kalici = false; throw e; });
  },
  async islem(tur, fn) { const db = await this.ac(); return new Promise((res, rej) => { const tx = db.transaction('kayitlar', tur), s = tx.objectStore('kayitlar'); const r = fn(s); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); }); },
  async hepsi() { try { const l = await this.islem('readonly', s => s.getAll()); return (l || []).sort((a, b) => b.ts - a.ts); } catch (e) { return this.bellek.slice().sort((a, b) => b.ts - a.ts); } },
  async koy(k) { try { await this.islem('readwrite', s => s.put(k)); } catch (e) { this.kalici = false; this.bellek = this.bellek.filter(x => x.id !== k.id).concat(k); } },
  async sil(id) { try { await this.islem('readwrite', s => s.delete(id)); } catch (e) { /* bellekte */ } this.bellek = this.bellek.filter(x => x.id !== id); }
};

/* ───────── AKORT ───────── */
const Akort = {
  acik: false, abone: 0, son: [], sonZaman: 0, sonuc: null, tamamSay: 0, tamamTel: null,
  async ac() {
    const h = $('#akHata'); h.hidden = true;
    try { await Dinleyici.ac(); } catch (e) { h.textContent = e.message; h.hidden = false; return; }
    this.acik = true; this.son = []; this.abone = perdeDinle(r => this.olc(r));
    $('#akBasla span').textContent = 'Dinlemeyi durdur'; $('#akBasla').classList.remove('birincil'); $('#akDurum').textContent = 'Dinleniyor. Bir tele vurun.'; $('#akDurum').className = 'okuma-durum';
    Strob.baslat();
  },
  kapat() {
    this.acik = false; if (this.abone) Dinleyici.birak(this.abone); this.abone = 0;
    $('#akBasla span').textContent = 'Dinlemeye başla'; $('#akBasla').classList.add('birincil');
    $('#akDurum').textContent = 'Dinlemeye başlayın, sonra tele vurun.'; $('#akDurum').className = 'okuma-durum';
    ['#akNot', '#akSent', '#akHz'].forEach(s => { $(s).textContent = '—'; }); $('#akOkt').textContent = ''; $('#akSent').className = ''; $('#akDurumNokta').className = 'durum-nokta';
    Strob.durdur(); akortHedefYaz();
  },
  olc(r) {
    const simdi = performance.now();
    if (!r || r.f < 50 || r.f > 1500) { if (simdi - this.sonZaman > 900 && Strob.sapma != null) { Strob.sapma = null; $('#akDurumNokta').className = 'durum-nokta'; } return; }
    this.son.push(r.f); if (this.son.length > 5) this.son.shift(); this.sonZaman = simdi;
    this.goster([...this.son].sort((a, b) => a - b)[this.son.length >> 1]);
  },
  goster(f) {
    const c = sentF(f); let ad, okt, sapma, hedefC, tel = null;
    const tele = t => { let fark = c - st.teller[t] * K; const ok = Math.round(fark / 1200); fark -= ok * 1200; return { t, fark, ok }; };
    if (st.ak.hedef !== 'krom') {
      const x = st.ak.hedef === 'oto' ? [0, 1, 2].map(tele).sort((a, b) => Math.abs(a.fark) - Math.abs(b.fark))[0] : tele(+st.ak.hedef);
      const n = notaAdi(st.teller[x.t] * K, false); tel = x.t; ad = n.metin; okt = n.okt + x.ok; sapma = x.fark; hedefC = st.teller[x.t] * K + x.ok * 1200;
    }
    else if (st.ak.sistem === '12') { const n = notaAdi12(c); ad = n.metin; okt = n.okt; sapma = n.sapma; hedefC = n.hedef; }
    else { const n = notaAdi(c, false); ad = n.metin; okt = n.okt; sapma = n.sapma; hedefC = n.k * K; }
    $$('#akTablo tbody tr').forEach(tr => tr.classList.toggle('aktif', tel != null && tr.dataset.tel === String(tel)));
    Strob.sapma = sapma;
    const s = Math.round(sapma), tamam = Math.abs(sapma) <= 5, uzak = Math.abs(sapma) > 25;
    $('#akNot').textContent = ad; $('#akOkt').textContent = okt;
    const se = $('#akSent'); se.textContent = (s > 0 ? '+' : s < 0 ? '−' : '') + Math.abs(s); se.className = tamam ? 'tamam' : uzak ? 'uzak' : '';
    $('#akHz').textContent = hz(f); $('#akHedefHz').textContent = hz(frekans(hedefC));
    const d = $('#akDurum'); d.textContent = tamam ? 'Akortlu' : s > 0 ? `${s} sent tiz · teli biraz gevşetin` : `${-s} sent pes · teli biraz gerin`; d.className = 'okuma-durum' + (tamam ? ' tamam' : uzak ? ' uzak' : '');
    $('#akDurumNokta').className = 'durum-nokta' + (tamam ? ' tamam' : uzak ? ' uzak' : '');
    this.sonuc = { f, ad, sapma };
    // Günlük görev: bir tel ~0,3 sn boyunca akortlu kalırsa işaretlenir
    if (tamam && tel != null && tel === this.tamamTel) { if (++this.tamamSay === 8) Ilerleme.akortTel(tel); } else { this.tamamTel = tamam ? tel : null; this.tamamSay = tamam ? 1 : 0; }
  }
};
function akortHedefYaz() { const t = st.ak.hedef; $('#akHedefHz').textContent = (t === 'oto' || t === 'krom') ? '—' : hz(frekans(st.teller[+t] * K)); }
function akortCiz() {
  $('#akDuzenAd').innerHTML = `<b>${esc(duzenAdi())}</b> · La ${String(st.a4).replace('.', ',')} Hz`;
  sekmeSec($('#akHedef'), 'h', st.ak.hedef);
  $$('#akHedef button').forEach(b => { if (/^\d$/.test(b.dataset.h)) b.textContent = TEL_AD[+b.dataset.h] + ' · ' + notaAdi(st.teller[+b.dataset.h] * K, false).metin; });
  $('#akSistem').value = st.ak.sistem; $('#akSistem').disabled = st.ak.hedef !== 'krom';
  secenekler($('#akDuzen'), duzenSecenek(), st.duzen);
  $('#akRef').disabled = !/^\d$/.test(st.ak.hedef);
  $('#akTablo tbody').innerHTML = [2, 1, 0].map(t => `<tr data-tel="${t}" class="${st.ak.hedef === String(t) ? 'aktif' : ''}"><td>${TEL_AD[t]} tel</td><td><b>${esc(notaAdi(st.teller[t] * K, true).tam)}</b></td><td class="sayi">${hz(frekans(st.teller[t] * K))} Hz</td></tr>`).join('');
  akortHedefYaz(); Strob.boyut(); Strob.ciz();
}
function akortBaglan() {
  $('#akBasla').addEventListener('click', () => Akort.acik ? Akort.kapat() : Akort.ac());
  $('#akHedef').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.ak.hedef = b.dataset.h; Akort.son = []; kaydet(); akortCiz(); });
  $('#akSistem').addEventListener('change', e => { st.ak.sistem = e.target.value; kaydet(); });
  $('#akDuzen').addEventListener('change', e => duzenSec(e.target.value));
  $('#akRef').addEventListener('click', () => { if (/^\d$/.test(st.ak.hedef)) Ses.cal(st.teller[+st.ak.hedef] * K, 'ref', { sure: 2.5 }); });
  window.addEventListener('resize', () => { Strob.boyut(); Strob.ciz(); });
}

/* ───────── SAP (perde haritası; ses çıkarmaz) ───────── */
const Sap = {
  kaydirma: 0, secili: null, p: [],
  ciz() {
    const p = perdeler(); this.p = p;
    const kapW = $('#sapKap').clientWidth || 800, S = clamp(kapW * 2.4, 1500, 2800) * st.zoom, minW = 52, x = c => 1 - Math.pow(2, -c / 1200);
    const w = p.map((c, i) => Math.max(minW, S * (x(c) - x(i ? p[i - 1] : 0))));
    const mk = makamBul(st.makam), sinif = mk ? makamSinif(mk, st.karar) : null;
    const rol = c => { if (!sinif) return ''; const n = notaAdi(c); return Math.abs(n.sapma) <= 8 ? (sinif.get(mod(n.k, 53)) || '') : ''; };
    let h = '<div class="cetvel">' + w.map((ww, i) => `<span style="width:${ww}px">${st.perdeNo ? i + 1 : ''}</span>`).join('') + '</div>';
    for (const t of [2, 1, 0]) {
      h += `<div class="tel-sira" data-tel="${t}">`;
      p.forEach((c, i) => {
        const ses = st.teller[t] * K + c, n = notaAdi(ses), r = rol(ses);
        const sec_ = this.secili && this.secili.t === t && this.secili.p === i + 1 ? ' sec' : '';
        const goster = st.notGoster || r;
        h += `<button class="hucre${r ? ' ms' : ''}${sec_}" data-tel="${t}" data-p="${i + 1}" style="width:${w[i]}px" aria-label="${esc(TEL_AD[t] + ' tel, ' + (i + 1) + '. perde, ' + n.tam)}">${r ? `<i class="nokta ${r}"></i>` : ''}${goster ? `<span class="isim">${n.html}</span>` : ''}</button>`;
      });
      h += '</div>';
    }
    $('#sap').innerHTML = h; $('#sap').style.width = w.reduce((a, b) => a + b, 0) + 'px';
    let s = '<div class="sabit-ust">boş</div>';
    for (const t of [2, 1, 0]) { const c = st.teller[t] * K, n = notaAdi(c), r = rol(c); s += `<button class="sabit-hucre${this.secili && this.secili.t === t && this.secili.p === 0 ? ' sec' : ''}" data-tel="${t}" data-p="0" aria-label="${esc(TEL_AD[t] + ' tel boş, ' + n.tam)}"><b>${n.html}</b><small>${TEL_AD[t]}</small>${r ? `<i class="nokta ${r}"></i>` : ''}</button>`; }
    $('#sapSabit').innerHTML = s;
    $('.sap-cerceve').classList.toggle('solak', st.solak);
    $('#lejant').hidden = !mk;
    $('#sapOzet').innerHTML = mk ? `<b>${esc(mk.ad)}</b> · karar ${esc(notaAdi(st.karar * K, false).metin)}` : `${esc(duzenAdi())}`;
    this.konum(this.kaydirma); this.bilgi();
  },
  konum(px) {
    const kap = $('#sapKap'), max = Math.max(0, kap.scrollWidth - kap.clientWidth);
    this.kaydirma = clamp(px, 0, max); if (Math.abs(kap.scrollLeft - this.kaydirma) > 0.5) kap.scrollLeft = this.kaydirma;
    this.cubuk();
  },
  cubuk() {
    const kap = $('#sapKap'), max = Math.max(0, kap.scrollWidth - kap.clientWidth); this.kaydirma = kap.scrollLeft;
    const r = $('#sapKaydir'); r.value = max ? Math.round(kap.scrollLeft / max * 1000) : 0; r.disabled = !max;
  },
  bilgi() {
    const el = $('#perdeBilgi'), s = this.secili;
    if (!s || s.p > this.p.length) { el.innerHTML = '<p class="soluk">Ayrıntısını görmek için sapta bir perdeye dokunun.</p>'; return; }
    const c = st.teller[s.t] * K + (s.p ? this.p[s.p - 1] : 0), n = notaAdi(c, true), bos = s.p ? this.p[s.p - 1] : 0;
    const mk = makamBul(st.makam); let rozet = '';
    if (mk && Math.abs(n.sapma) <= 8) { const r = makamSinif(mk, st.karar).get(mod(n.k, 53)); if (r) rozet = `<span class="rozet ${r}">${r === 'k' ? 'Karar' : r === 'g' ? 'Güçlü' : 'Dizi sesi'} · ${esc(mk.ad)}</span>`; else rozet = `<span class="soluk">${esc(mk.ad)} dizisinde yok</span>`; }
    const komaB = bos / K;
    el.innerHTML = `<div class="pb-ad">${esc(n.metin)}<sub>${n.okt}</sub></div>
      <div class="pb-veriler"><span>Tel<b>${TEL_AD[s.t]}</b></span><span>Perde<b>${s.p ? s.p + '.' : 'boş'}</b></span><span class="pro">Boş tele göre<b>${Math.abs(komaB - Math.round(komaB)) < 0.05 ? Math.round(komaB) + ' koma' : komaB.toFixed(1).replace('.', ',') + ' koma'}</b></span><span class="pro">Sent<b>${Math.round(bos)}</b></span><span class="pro">Frekans<b>${hz(frekans(c))} Hz</b></span>${Math.abs(n.sapma) > 3 ? `<span class="pro">53 komadan sapma<b>${n.sapma > 0 ? '+' : '−'}${Math.abs(Math.round(n.sapma))} sent</b></span>` : ''}</div>
      <div>${rozet}</div>`;
  },
  baglan() {
    const kap = $('#sapKap'); let surukle = null;
    kap.addEventListener('scroll', () => this.cubuk(), { passive: true });
    kap.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { surukle = null; return; } surukle = { x: e.clientX, k: kap.scrollLeft, hareket: false, id: e.pointerId }; });
    kap.addEventListener('pointermove', e => { if (!surukle || surukle.id !== e.pointerId) return; const dx = e.clientX - surukle.x; if (Math.abs(dx) > 6) surukle.hareket = true; if (surukle.hareket) this.konum(surukle.k + (st.solak ? dx : -dx)); });
    const bitir = () => { setTimeout(() => { surukle = null; }, 0); };
    kap.addEventListener('pointerup', bitir); kap.addEventListener('pointercancel', bitir);
    const tikla = e => { const b = e.target.closest('.hucre, .sabit-hucre'); if (!b) return; if (surukle && surukle.hareket) return; this.secili = { t: +b.dataset.tel, p: +b.dataset.p }; $$('.hucre.sec, .sabit-hucre.sec').forEach(x => x.classList.remove('sec')); b.classList.add('sec'); this.bilgi(); };
    $('.sap-cerceve').addEventListener('click', tikla);
    kap.addEventListener('wheel', e => { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0); if (!d) return; e.preventDefault(); this.konum(this.kaydirma + (st.solak ? -d : d)); }, { passive: false });
    $('#sapKaydir').addEventListener('input', e => this.konum(e.target.value / 1000 * Math.max(0, kap.scrollWidth - kap.clientWidth)));
    $('#zoomArti').addEventListener('click', () => { st.zoom = clamp(+(st.zoom + 0.2).toFixed(1), 0.5, 2.5); kaydet(); this.ciz(); });
    $('#zoomEksi').addEventListener('click', () => { st.zoom = clamp(+(st.zoom - 0.2).toFixed(1), 0.5, 2.5); kaydet(); this.ciz(); });
    let rz = 0; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (st.v === 'sap') this.ciz(); }, 120); });
    $('#sapDuzen').addEventListener('change', e => duzenSec(e.target.value));
    $('#sapMakam').addEventListener('change', e => { st.makam = e.target.value; kaydet(); sapCiz(); });
    $('#sapKarar').addEventListener('change', e => { st.karar = +e.target.value; kaydet(); sapCiz(); });
  }
};
function sapCiz() {
  st.karar = mod(st.karar + 31, 53) - 31;
  secenekler($('#sapDuzen'), duzenSecenek(), st.duzen);
  secenekler($('#sapMakam'), [['', 'Seçilmedi']].concat(tumMakamlar().map(m => [m.id, m.ad])), st.makam);
  secenekler($('#sapKarar'), kararSecenekleri(), st.karar);
  Sap.ciz();
}

/* ───────── MAKAM ───────── */
let diziZaman = [];
function diziCal(m, yon) {
  diziZaman.forEach(clearTimeout); diziZaman = []; let d = diziK(m, st.karar); if (yon === 'in') d = d.slice().reverse();
  d.forEach((k, i) => diziZaman.push(setTimeout(() => Ses.cal(k * K, 'dizi'), i * 520)));
}
function makamCiz() {
  secenekler($('#mkKarar'), kararSecenekleri(), mod(st.karar + 31, 53) - 31);
  const ara = ($('#mkAra').value || '').trim().toLocaleLowerCase('tr');
  const hepsi = tumMakamlar(), liste = hepsi.filter(m => !ara || m.ad.toLocaleLowerCase('tr').includes(ara));
  $('#mkListe').innerHTML = liste.length ? liste.map(m => {
    const no = 'TZ-' + String(hepsi.indexOf(m) + 1).padStart(2, '0');
    const d = diziK(m, st.karar), eksik = new Set(eksikSesler(m, st.karar).map(k => mod(k, 53))), toplam = m.a.reduce((a, b) => a + b, 0);
    let dz = ''; d.forEach((k, i) => {
      const cls = (i === 0 || (i === d.length - 1 && toplam === 53)) ? ' k' : (m.g && i === m.g - 1 ? ' g' : '');
      dz += `<span class="n${cls}${eksik.has(mod(k, 53)) ? ' yok' : ''}"${eksik.has(mod(k, 53)) ? ' title="Sapta bu perde yok"' : ''}>${esc(notaAdi(k * K, false).metin)}</span>`;
      if (i < m.a.length) dz += `<span class="a">${m.a[i]}</span>`;
    });
    const uyari = [];
    if (eksik.size) uyari.push(`Sapta karşılığı yok: ${[...new Set(d.filter(k => eksik.has(mod(k, 53))).map(k => notaAdi(k * K, false).metin))].join(', ')}. Ayarlar › Perdeler’den ekleyebilirsiniz.`);
    if (toplam !== 53) uyari.push(`Aralık toplamı ${toplam} koma; oktav 53 komadır.`);
    const secili = st.makam === m.id;
    return `<li class="mk${secili ? ' secili' : ''}" data-id="${esc(m.id)}"><span class="mk-no">${no}</span>
      <div><h3>${esc(m.ad)}</h3><span class="mk-yapi">${esc(m.y)}${m.g ? ` · güçlü ${m.g}. derece` : ''}</span></div>
      <div class="dizi">${dz}</div>
      <div class="mk-islem"><button class="btn ikon" data-a="cik" aria-label="${esc(m.ad)} dizisini çıkıcı dinle" title="Çıkıcı dinle">${ikon('yukari')}</button><button class="btn ikon" data-a="in" aria-label="${esc(m.ad)} dizisini inici dinle" title="İnici dinle">${ikon('asagi')}</button><button class="btn${secili ? ' birincil' : ''}" data-a="sap">${secili ? 'Sapta açık' : 'Sapta göster'}</button>${m.ozel ? `<button class="btn ikon tehlike" data-a="sil" aria-label="${esc(m.ad)} dizisini sil">${ikon('sil')}</button>` : ''}</div>
      ${uyari.map(u => `<p class="mk-uyari">${esc(u)}</p>`).join('')}</li>`;
  }).join('') : '<li class="bos">Bu adla eşleşen makam yok.</li>';
}
function makamBaglan() {
  $('#mkKarar').addEventListener('change', e => { st.karar = +e.target.value; kaydet(); makamCiz(); });
  $('#mkAra').addEventListener('input', makamCiz);
  $('#mkListe').addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return; const m = makamBul(b.closest('.mk').dataset.id); if (!m) return;
    if (b.dataset.a === 'cik' || b.dataset.a === 'in') diziCal(m, b.dataset.a);
    else if (b.dataset.a === 'sap') { st.makam = m.id; kaydet(); git('sap'); }
    else if (b.dataset.a === 'sil') { if (!confirm(`“${m.ad}” dizisi silinsin mi?`)) return; st.ozelMakam = st.ozelMakam.filter(x => x.id !== m.id); if (st.makam === m.id) st.makam = ''; kaydet(); makamCiz(); }
  });
  $('#mkEkle').addEventListener('click', () => {
    const ad = $('#mkYeniAd').value.trim(), msj = $('#mkEkleMsj'), a = $('#mkYeniAra').value.trim().split(/[\s,;+]+/).filter(Boolean).map(Number);
    if (!ad) { msj.textContent = 'Diziye bir ad verin.'; return; }
    if (a.length < 2 || a.length > 16 || !a.every(n => Number.isInteger(n) && n > 0 && n <= 30)) { msj.textContent = 'Aralıklar 1 ile 30 arasında tam sayı olmalı; 2 ile 16 aralık girin.'; return; }
    if (st.ozelMakam.length >= 40) { msj.textContent = 'En çok 40 dizi eklenebilir.'; return; }
    st.ozelMakam.push({ id: 'oz_' + kimlik(), ad: ad.slice(0, 40), a }); kaydet(); $('#mkYeniAd').value = ''; $('#mkYeniAra').value = '';
    const t = a.reduce((x, y) => x + y, 0); msj.textContent = `“${ad}” eklendi` + (t !== 53 ? `; aralık toplamı ${t} koma (oktav 53).` : '.'); makamCiz();
  });
}

/* ───────── METRONOM ───────── */
const Met = {
  acik: false, i: 0, sonraki: 0, zaman: 0, vurus: 0, tapler: [], d: [],
  gruplar() { const u = USULLER.find(x => x.id === st.met.usul); if (u && u.g) return u.g; const g = (st.met.ozel || '').split(/[+\s,]+/).filter(Boolean).map(Number); return g.length && g.every(n => Number.isInteger(n) && n >= 1 && n <= 9) && g.reduce((a, b) => a + b, 0) <= 32 ? g : [4]; },
  desen() { const out = []; this.gruplar().forEach((n, gi) => { for (let j = 0; j < n; j++) out.push(j === 0 ? (gi === 0 ? 2 : 1) : 0); }); return out; },
  hiz: null, basZaman: 0, sayacZ: 0,
  baslat() { const ctx = Ses.init(); if (!ctx) { bildir('Bu tarayıcı ses çalamıyor.'); return; } if (Zt.aktif) Zt.durdur(); this.acik = true; this.i = 0; this.d = this.desen(); this.sonraki = ctx.currentTime + 0.08; clearInterval(this.zaman); this.zaman = setInterval(() => this.planla(), 25); this.planla(); this.basZaman = Date.now(); Uyanik.ac('met'); clearInterval(this.sayacZ); this.sayacZ = setInterval(() => this.sureYaz(), 10000); metArayuz(); },
  durdur() { const egz = this.egz; this.acik = false; this.hiz = null; this.egz = null; if (egz && st.v === 'dersler') egzCizListe(); clearInterval(this.zaman); clearInterval(this.sayacZ); this.sureYaz(); Uyanik.kapat('met'); $$('#vuruslar i').forEach(s => s.classList.remove('simdi')); metArayuz(); htArayuz(); },
  sureYaz() { if (this.basZaman) { Ilerleme.metEkle(Date.now() - this.basZaman); this.basZaman = this.acik ? Date.now() : 0; } },
  planla() {
    const ctx = Ses.ctx;
    while (this.sonraki < ctx.currentTime + 0.12) {
      if (this.i >= this.d.length) this.i = 0; const i = this.i, t = this.sonraki;
      if (i === 0 && this.hiz) { // hızlanan tempo: ölçü başlarında
        const h = this.hiz; h.olcu++; if (h.olcu > 1 && (h.olcu - 1) % h.her === 0 && st.met.bpm < h.hedef) { const y = Math.min(h.hedef, st.met.bpm + h.artis); setTimeout(() => { bpmAyarla(y); htArayuz(); }, Math.max(0, (t - ctx.currentTime) * 1000)); st.met.bpm = y; }
      }
      Ses.tik(t, this.d[i]);
      setTimeout(() => this.isik(i), Math.max(0, (t - ctx.currentTime) * 1000)); this.sonraki += 60 / st.met.bpm; this.i = (i + 1) % this.d.length;
    }
  },
  isik(i) { if (!this.acik) return; this.vurus++; $$('#vuruslar i').forEach((s, j) => s.classList.toggle('simdi', j === i)); const n = $('#metMini .nabiz'); n.classList.remove('vur'); void n.offsetWidth; n.classList.add('vur'); },
  yenidenDesen() { this.d = this.desen(); if (this.i >= this.d.length) this.i = 0; ritimCiz(); }
};
function metArayuz() {
  const b = $('#metBasla'); b.innerHTML = Met.acik ? `${ikon('dur')}<span>Durdur</span>` : `${ikon('oynat')}<span>Başlat</span>`; b.classList.toggle('birincil', !Met.acik);
  const m = $('#metMini'); m.hidden = !Met.acik || st.v === 'ritim'; $('b', m).textContent = st.met.bpm;
}
function ritimCiz() {
  $('#bpmDeger').textContent = st.met.bpm; $('#bpmKaydir').value = st.met.bpm;
  secenekler($('#usulSec'), USULLER.map(u => [u.id, u.ad]), st.met.usul);
  $('#usulOzel').value = st.met.ozel; $('#usulOzel').disabled = st.met.usul !== 'ozel';
  $('#metSes').value = st.met.ses; $('#metVol').value = st.met.vol;
  const g = Met.gruplar(); $('#usulAd').innerHTML = `<b>${esc((USULLER.find(u => u.id === st.met.usul) || {}).ad || '')}</b> · ${g.join('+')}`;
  $('#vuruslar').innerHTML = Met.desen().map(s => `<i class="s${s}"></i>`).join(''); metArayuz();
}
function bpmAyarla(v) { st.met.bpm = clamp(Math.round(v), 30, 300); kaydet(); $('#bpmDeger').textContent = st.met.bpm; $('#bpmKaydir').value = st.met.bpm; metArayuz(); }
function ritimBaglan() {
  $('#metBasla').addEventListener('click', () => Met.acik ? Met.durdur() : Met.baslat());
  $('#metMini').addEventListener('click', () => Met.durdur());
  $('#bpmKaydir').addEventListener('input', e => bpmAyarla(+e.target.value));
  $('#bpmArti').addEventListener('click', () => bpmAyarla(st.met.bpm + 1));
  $('#bpmEksi').addEventListener('click', () => bpmAyarla(st.met.bpm - 1));
  $('#usulSec').addEventListener('change', e => { st.met.usul = e.target.value; kaydet(); Met.yenidenDesen(); });
  $('#usulOzel').addEventListener('input', e => { st.met.ozel = e.target.value.slice(0, 40); kaydet(); Met.yenidenDesen(); });
  $('#metSes').addEventListener('change', e => { st.met.ses = e.target.value; kaydet(); });
  $('#metVol').addEventListener('input', e => { st.met.vol = +e.target.value; kaydet(); Ses.uygula(); });
  $('#metTap').addEventListener('click', () => { const t = performance.now(); Met.tapler = Met.tapler.filter(x => t - x < 2500); Met.tapler.push(t); if (Met.tapler.length >= 2) { const a = Met.tapler.slice(-5); bpmAyarla(60000 / ((a[a.length - 1] - a[0]) / (a.length - 1))); } else bildir('Tempoya göre birkaç kez dokunun.'); });
  document.addEventListener('keydown', e => { if (st.v !== 'ritim' || e.code !== 'Space' || e.repeat) return; if (e.target.closest && e.target.closest('input, select, textarea, button')) return; e.preventDefault(); Met.acik ? Met.durdur() : Met.baslat(); });
  // Hızlanan tempo
  $('#htBasla').addEventListener('click', () => {
    if (Met.hiz) { Met.durdur(); return; }
    const oku = (id, a, b, d) => { const v = Math.round(+$(id).value); return v >= a && v <= b ? v : d; };
    const bas = oku('#htBas', 30, 300, 70), hedef = oku('#htHedef', 30, 300, 120), artis = oku('#htArtis', 1, 30, 4), her = oku('#htOlcu', 1, 32, 4);
    if (hedef <= bas) { bildir('Hedef tempo başlangıçtan büyük olmalı.'); return; }
    bpmAyarla(bas); Met.baslat(); Met.hiz = { hedef, artis, her, olcu: 0 }; htArayuz();
  });
  $('#ztBasla').addEventListener('click', () => Zt.aktif ? Zt.durdur() : Zt.baslat());
}
function htArayuz() {
  const b = $('#htBasla'); if (!b) return; const h = Met.hiz;
  b.innerHTML = h ? `${ikon('dur')}<span>Durdur</span>` : `${ikon('oynat')}<span>Hızlanan tempoyu başlat</span>`;
  $('#htDurum').textContent = h ? (st.met.bpm >= h.hedef ? `Hedefe ulaşıldı: ${st.met.bpm}` : `Şu an ${st.met.bpm} · hedef ${h.hedef}`) : '';
}
// Zamanlama testi (Ritim bölümü)
const Zt = {
  aktif: null,
  baslat() {
    if (Met.acik) Met.durdur();
    const s = $('#ztSonuc'), g = Met.gruplar();
    s.innerHTML = `<div class="vuruslar" id="ztVurus">${Met.desen().map(x => `<i class="s${x}"></i>`).join('')}</div><p class="not" id="ztDurum">Hazırlık ölçüsü: dinleyin, çalmayın.</p><p class="not" id="ztUyari"></p>`;
    $('#ztBasla').innerHTML = `${ikon('dur')}<span>Testi durdur</span>`;
    this.aktif = ritimOlc({ bpm: st.met.bpm, g, olcu: 4 }, {
      vurus: (i, sv, sayim, sessiz) => { $$('#ztVurus i').forEach((x, j) => x.classList.toggle('simdi', j === i)); const d = $('#ztDurum'); if (d) d.textContent = sayim ? 'Hazırlık ölçüsü: dinleyin, çalmayın.' : sessiz ? 'Şimdi çalın (metronom ışıkla gösteriliyor).' : 'Şimdi her tıkta tele vurun.'; },
      uyari: m => { const u = $('#ztUyari'); if (u) u.textContent = m; },
      hata: m => { this.aktif = null; $('#ztBasla').innerHTML = `${ikon('hedef')}<span>Testi başlat</span>`; s.innerHTML = `<p class="hata">${esc(m)}</p>`; },
      sonuc: r => { this.aktif = null; $('#ztBasla').innerHTML = `${ikon('hedef')}<span>Yeniden dene</span>`; s.innerHTML = ritimSonucHtml(r); }
    });
  },
  durdur() { if (this.aktif) this.aktif.durdur(); this.aktif = null; $('#ztBasla').innerHTML = `${ikon('hedef')}<span>Testi başlat</span>`; $('#ztSonuc').innerHTML = ''; }
};
function ritimSonucHtml(r) {
  if (!r.vurus) return `<p class="hata">Hiç vuruş duyulmadı. Mikrofonun sazı duyduğundan emin olun ve tele daha net vurun.</p>`;
  const yuzde = Math.round(r.isabet * 100), ms = Math.round(r.medyan * 1000);
  return `<div class="zt-ozet"><div><b>%${yuzde}</b><span>isabet</span></div><div><b>${Math.round(r.std * 1000)} ms</b><span>dağılım (düşük iyi)</span></div><div><b>${Math.abs(ms)} ms</b><span>ortalama ${ms >= 0 ? 'geç' : 'erken'} (cihaz gecikmesi dahil)</span></div></div>
    <div class="zt-izler" aria-label="Vuruş başına sonuç">${r.izler.map(x => `<i class="${x ? 'isabet' : 'kacti'}"></i>`).join('')}</div>
    <p class="not">${yuzde >= 85 ? 'Çok düzenli. Tempoyu biraz artırmayı deneyin.' : yuzde >= 60 ? 'İyi gidiyor. Aynı tempoda birkaç kez daha deneyin.' : 'Tempoyu düşürüp sayarak yeniden deneyin.'}</p>`;
}

/* ───────── KULAK ───────── */
const Egz = { soru: null, dogru: 0, yanlis: 0, seri: 0, cevaplandi: false };
function egzCiz() {
  sekmeSec($('#egzMod'), 'm', st.egz.mod); const a = $('#egzAyar');
  if (st.egz.mod === 'perde') {
    if (!makamBul(st.egz.makam)) st.egz.makam = 'ussak';
    a.innerHTML = `<label class="alan"><span class="etiket">Makam</span><select id="egzMakam"></select></label><label class="alan"><span class="etiket">Karar</span><select id="egzKararSec"></select></label>`;
    secenekler($('#egzMakam'), tumMakamlar().map(m => [m.id, m.ad]), st.egz.makam); secenekler($('#egzKararSec'), kararSecenekleri(), mod(st.karar + 31, 53) - 31);
  } else {
    a.innerHTML = `<label class="alan"><span class="etiket">Seviye</span><select id="egzSeviye"><option value="kolay">Kolay · 5 aralık</option><option value="orta">Orta · 6 aralık</option><option value="zor">Zor · 10 aralık</option></select></label><label class="alan"><span class="etiket">Yön</span><select id="egzYon"><option value="cik">Çıkıcı</option><option value="in">İnici</option><option value="bir">Birlikte</option></select></label>`;
    $('#egzSeviye').value = st.egz.seviye; $('#egzYon').value = st.egz.yon;
  }
  skorGoster();
}
function skorGoster() { $('#egzDogru').textContent = Egz.dogru; $('#egzYanlis').textContent = Egz.yanlis; $('#egzSeri').textContent = Egz.seri; $('#egzRekor').textContent = st.egz.rekor; }
function egzYeni() {
  Egz.cevaplandi = false; const secEl = $('#egzSecenek'), soru = $('#egzSoru'); soru.className = 'soru';
  if (st.egz.mod === 'perde') {
    const m = makamBul(st.egz.makam) || MAKAMLAR[1], d = diziK(m, st.karar), i = Math.floor(Math.random() * d.length);
    Egz.soru = { tur: 'perde', d, cevap: i, cal: () => Ses.cal(d[i] * K, 'egz') };
    soru.textContent = `${m.ad} dizisinden bir ses çalındı. Hangisi?`;
    secEl.innerHTML = d.map((k, j) => `<button data-i="${j}">${esc(notaAdi(k * K, false).metin)}${j === d.length - 1 && mod(k - d[0], 53) === 0 ? '<small>tiz karar</small>' : `<small>${j + 1}. derece</small>`}</button>`).join('');
  } else {
    const liste = ARALIK_SEVIYE[st.egz.seviye], k = liste[Math.floor(Math.random() * liste.length)], alt = st.karar - Math.floor(Math.random() * 10), yon = st.egz.yon;
    const iki = yon === 'in' ? [alt + k, alt] : [alt, alt + k];
    Egz.soru = { tur: 'aralik', cevap: k, cal: () => { if (yon === 'bir') { Ses.cal(iki[0] * K, 'e1'); Ses.cal(iki[1] * K, 'e2'); } else { Ses.cal(iki[0] * K, 'e1', { sure: 0.7 }); setTimeout(() => Ses.cal(iki[1] * K, 'e2'), 750); } } };
    soru.textContent = 'İki ses arasındaki aralık hangisi?';
    secEl.innerHTML = ARALIKLAR.filter(a => liste.includes(a.k)).map(a => `<button data-i="${a.k}">${esc(a.ad)}<small>${esc(a.s)}</small></button>`).join('');
  }
  $('#egzTekrar').disabled = false; Egz.soru.cal();
}
function egzCevap(v) {
  if (!Egz.soru || Egz.cevaplandi) return; Egz.cevaplandi = true; const dogru = v === Egz.soru.cevap, soru = $('#egzSoru');
  $$('#egzSecenek button').forEach(b => { const i = +b.dataset.i; if (i === Egz.soru.cevap) b.classList.add('dogru'); else if (i === v) b.classList.add('yanlis'); });
  if (dogru) { Egz.dogru++; Egz.seri++; if (Egz.seri > st.egz.rekor) { st.egz.rekor = Egz.seri; kaydet(); } soru.textContent = 'Doğru. Sıradaki soru için “Yeni soru”.'; soru.className = 'soru dogru'; }
  else { Egz.yanlis++; Egz.seri = 0; const ad = Egz.soru.tur === 'perde' ? notaAdi(Egz.soru.d[Egz.soru.cevap] * K, false).metin : ARALIKLAR.find(a => a.k === Egz.soru.cevap).ad; soru.textContent = `Doğrusu ${ad}. Tekrar dinleyip karşılaştırın.`; soru.className = 'soru yanlis'; }
  skorGoster();
}
function egzBaglan() {
  $('#egzMod').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.egz.mod = b.dataset.m; kaydet(); Egz.soru = null; $('#egzSecenek').innerHTML = ''; $('#egzTekrar').disabled = true; $('#egzSoru').className = 'soru'; $('#egzSoru').textContent = '“Yeni soru” ile başlayın.'; egzCiz(); });
  $('#egzAyar').addEventListener('change', e => { const id = e.target.id; if (id === 'egzMakam') st.egz.makam = e.target.value; if (id === 'egzKararSec') st.karar = +e.target.value; if (id === 'egzSeviye') st.egz.seviye = e.target.value; if (id === 'egzYon') st.egz.yon = e.target.value; kaydet(); });
  $('#egzYeni').addEventListener('click', egzYeni);
  $('#egzTekrar').addEventListener('click', () => Egz.soru && Egz.soru.cal());
  $('#egzKarar').addEventListener('click', () => Ses.cal(st.karar * K, 'egzk', { sure: 1.2 }));
  $('#egzSecenek').addEventListener('click', e => { const b = e.target.closest('button'); if (b) egzCevap(+b.dataset.i); });
}

/* ───────── DEFTER (repertuvar, çalışma süresi, kayıt) ───────── */
const Defter = {
  v: { eserler: [], oturumlar: [] }, kr: null, krZ: 0,
  yukle() { this.v = this.norm(LS.get('tezene_defter_v2', null)); const k = LS.get('tezene_kr', null); this.kr = k && typeof k.bas === 'number' && k.bas <= Date.now() && Date.now() - k.bas < 864e5 ? { bas: k.bas, eser: metin(k.eser, 30, '') } : null; },
  norm(v) {
    const o = { eserler: [], oturumlar: [] }; if (!v || typeof v !== 'object') return o;
    if (Array.isArray(v.eserler)) o.eserler = v.eserler.slice(0, 300).filter(e => e && typeof e.id === 'string' && typeof e.ad === 'string' && e.ad.trim()).map(e => ({ id: e.id.slice(0, 30), ad: e.ad.slice(0, 80), makam: metin(e.makam, 30, ''), duzen: metin(e.duzen, 30, ''), bpm: Number.isInteger(e.bpm) && e.bpm >= 30 && e.bpm <= 300 ? e.bpm : null, durum: sec(e.durum, DURUMLAR.map(d => d[0]), 'ogreniyor'), ts: typeof e.ts === 'number' ? e.ts : Date.now() }));
    if (Array.isArray(v.oturumlar)) o.oturumlar = v.oturumlar.slice(0, 2000).filter(x => x && typeof x.bas === 'number' && typeof x.sure === 'number' && x.sure > 0 && x.sure < 864e5).map(x => ({ id: metin(x.id, 30, kimlik()), eser: metin(x.eser, 30, ''), bas: x.bas, sure: Math.round(x.sure) }));
    return o;
  },
  sakla() { if (!LS.set('tezene_defter_v2', this.v)) bildir('Defter kaydedilemedi: tarayıcı depolaması dolu ya da kapalı.'); },
  baslat() { this.kr = { bas: Date.now(), eser: $('#krEser').value }; LS.set('tezene_kr', this.kr); krArayuz(); },
  bitir() {
    const k = this.kr; this.kr = null; LS.set('tezene_kr', null); if (!k) return; const sure = Date.now() - k.bas;
    if (sure < 5000) bildir('5 saniyeden kısa çalışma kaydedilmedi.');
    else { this.v.oturumlar.unshift({ id: kimlik(), eser: k.eser, bas: k.bas, sure }); this.v.oturumlar = this.v.oturumlar.slice(0, 2000); this.sakla(); bildir(`${sureYazi(sure, true)} çalışma kaydedildi.`); }
    krArayuz(); defterCiz();
  }
};
function sureYazi(ms, uzun) { const s = Math.floor(ms / 1000), sa = Math.floor(s / 3600), dk = Math.floor(s % 3600 / 60), sn = s % 60; if (uzun) return sa ? `${sa} sa ${dk} dk` : dk ? `${dk} dk ${sn} sn` : `${sn} sn`; return `${sa}:${String(dk).padStart(2, '0')}:${String(sn).padStart(2, '0')}`; }
function haftaBasi() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
function krArayuz() {
  const k = Defter.kr, b = $('#krBasla'); b.innerHTML = k ? `${ikon('dur')}<span>Bitir ve kaydet</span>` : `${ikon('oynat')}<span>Başlat</span>`; b.classList.toggle('birincil', !k);
  $('#krEser').disabled = !!k; if (k) $('#krEser').value = k.eser;
  const yaz = () => { $('#krSure').textContent = sureYazi(Defter.kr ? Date.now() - Defter.kr.bas : 0); }; yaz();
  $('#krSure').classList.toggle('calisiyor', !!k); clearInterval(Defter.krZ); if (k) Defter.krZ = setInterval(yaz, 500);
}
const kayitUrl = new Map();
async function kayitlarCiz() {
  const ul = $('#skListe'); ul.innerHTML = '<li class="yukleniyor">Kayıtlar yükleniyor</li>';
  const l = await Depo.hepsi();
  $('#skBilgi').textContent = Depo.kalici ? 'Mikrofonla çalışınızı kaydedin; kayıtlar bu cihazda saklanır. Yedeğe dahil değildir; saklamak istediklerinizi indirin.' : 'Tarayıcı kalıcı depolamaya izin vermiyor; kayıtlar yalnız bu oturumda durur. Saklamak için indirin.';
  ul.innerHTML = l.length ? l.map(k => {
    if (!kayitUrl.has(k.id)) kayitUrl.set(k.id, URL.createObjectURL(k.blob));
    const u = kayitUrl.get(k.id), uz = (k.tur || '').includes('ogg') ? 'ogg' : (k.tur || '').includes('mp4') ? 'm4a' : 'webm';
    return `<li data-id="${esc(k.id)}"><span class="kayit-ad"><b>${esc(k.ad)}</b><small>${sureYazi(k.sure, true)} · ${new Date(k.ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</small></span>
      <button class="btn ikon" data-k="ad" aria-label="${esc(k.ad)} kaydını yeniden adlandır" title="Yeniden adlandır">${ikon('kalem')}</button><a class="btn ikon" href="${u}" download="${esc(k.ad.replace(/[^\wçğıöşüÇĞİÖŞÜ\- ]+/g, '').trim() || 'tezene-kayit')}.${uz}" aria-label="${esc(k.ad)} kaydını indir" title="İndir">${ikon('indir')}</a><button class="btn ikon tehlike" data-k="sil" aria-label="${esc(k.ad)} kaydını sil" title="Sil">${ikon('sil')}</button>
      <audio controls preload="metadata" src="${u}"></audio></li>`;
  }).join('') : '<li class="bos">Henüz kayıt yok. “Kaydı başlat” ile ilk kaydınızı alın, sonra dinleyip kendinizi değerlendirin.</li>';
}
function defterCiz() {
  kayitlarCiz();
  const v = Defter.v, eserAdi = id => (v.eserler.find(e => e.id === id) || {}).ad;
  const hafta = v.oturumlar.filter(o => o.bas >= haftaBasi()).reduce((a, o) => a + o.sure, 0);
  $('#dfHafta').innerHTML = hafta ? `Bu hafta <b>${sureYazi(hafta, true)}</b>` : 'Bu hafta henüz çalışma yok';
  const sec_ = Defter.kr ? Defter.kr.eser : $('#krEser').value;
  secenekler($('#krEser'), [['', 'Serbest çalışma']].concat(v.eserler.map(e => [e.id, e.ad])), sec_);
  secenekler($('#esMakam'), [['', '—']].concat(tumMakamlar().map(m => [m.id, m.ad])), $('#esMakam').value || '');
  secenekler($('#esDuzen'), [['', '—']].concat(duzenListesi().map(d => [d.id, d.ad])), $('#esDuzen').value || '');
  const toplam = id => v.oturumlar.filter(o => o.eser === id).reduce((a, o) => a + o.sure, 0);
  $('#esTablo tbody').innerHTML = v.eserler.length ? v.eserler.map(e => `<tr data-id="${esc(e.id)}"><td><b>${esc(e.ad)}</b></td><td>${esc((makamBul(e.makam) || {}).ad || '—')}</td><td>${esc((duzenListesi().find(d => d.id === e.duzen) || {}).ad || '—')}</td>
    <td class="sayi">${e.bpm ? `<button class="btn kucuk" data-a="met" title="Metronomu bu tempoya ayarla">${e.bpm}</button>` : '—'}</td>
    <td><select class="durum-sec" data-a="durum" aria-label="${esc(e.ad)} durumu">${DURUMLAR.map(([k, t]) => `<option value="${k}"${e.durum === k ? ' selected' : ''}>${t}</option>`).join('')}</select></td>
    <td class="sayi">${toplam(e.id) ? sureYazi(toplam(e.id), true) : '—'}</td><td class="sayi"><button class="btn ikon tehlike" data-a="sil" aria-label="${esc(e.ad)} eserini sil">${ikon('sil')}</button></td></tr>`).join('')
    : '<tr><td colspan="7" class="bos">Repertuvarınız boş. Çalıştığınız eserleri ekleyin; süreleri burada birikir.</td></tr>';
  const ot = v.oturumlar.slice(0, 12);
  $('#otListe').innerHTML = ot.length ? ot.map(o => `<li><span>${esc(eserAdi(o.eser) || 'Serbest çalışma')}<br><small>${new Date(o.bas).toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></span><b>${sureYazi(o.sure, true)}</b><button class="btn ikon tehlike" data-sil="${esc(o.id)}" aria-label="Çalışma kaydını sil">${ikon('sil')}</button></li>`).join('')
    : '<li class="bos">Kronometreyi başlatıp bitirdiğinizde çalışmalarınız burada listelenir.</li>';
  krArayuz();
}
function defterBaglan() {
  $('#krBasla').addEventListener('click', () => Defter.kr ? Defter.bitir() : Defter.baslat());
  $('#esEkle').addEventListener('click', () => {
    const ad = $('#esAd').value.trim(), h = $('#esHata'), bpmS = $('#esBpm').value.trim(), bpm = bpmS ? Math.round(+bpmS) : null; h.hidden = true;
    if (!ad) { h.textContent = 'Eser adını yazın.'; h.hidden = false; return; }
    if (bpmS && !(bpm >= 30 && bpm <= 300)) { h.textContent = 'Tempo 30 ile 300 arasında olmalı ya da boş bırakılmalı.'; h.hidden = false; return; }
    if (Defter.v.eserler.length >= 300) { h.textContent = 'En çok 300 eser eklenebilir.'; h.hidden = false; return; }
    Defter.v.eserler.unshift({ id: kimlik(), ad: ad.slice(0, 80), makam: $('#esMakam').value, duzen: $('#esDuzen').value, bpm, durum: 'ogreniyor', ts: Date.now() });
    Defter.sakla(); $('#esAd').value = ''; $('#esBpm').value = ''; defterCiz();
  });
  $('#esAd').addEventListener('keydown', e => { if (e.key === 'Enter') $('#esEkle').click(); });
  $('#esTablo').addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return; const id = b.closest('tr').dataset.id, es = Defter.v.eserler.find(x => x.id === id); if (!es) return;
    if (b.dataset.a === 'met') { bpmAyarla(es.bpm); git('ritim'); }
    if (b.dataset.a === 'sil') { if (!confirm(`“${es.ad}” repertuvardan silinsin mi? Çalışma kayıtları “Serbest çalışma” olarak kalır.`)) return; Defter.v.eserler = Defter.v.eserler.filter(x => x.id !== id); Defter.v.oturumlar.forEach(o => { if (o.eser === id) o.eser = ''; }); Defter.sakla(); defterCiz(); }
  });
  $('#esTablo').addEventListener('change', e => { const s = e.target.closest('select[data-a=durum]'); if (!s) return; const es = Defter.v.eserler.find(x => x.id === s.closest('tr').dataset.id); if (es) { es.durum = s.value; Defter.sakla(); } });
  $('#otListe').addEventListener('click', e => { const b = e.target.closest('button[data-sil]'); if (!b) return; if (!confirm('Bu çalışma kaydı silinsin mi?')) return; Defter.v.oturumlar = Defter.v.oturumlar.filter(o => o.id !== b.dataset.sil); Defter.sakla(); defterCiz(); });
  // Kayıtlar: mikrofonla kayıt, IndexedDB'de kalıcı
  let kaydedici = null, abone = 0, parcalar = [], bas = 0, z = 0;
  $('#skKayit').addEventListener('click', async () => {
    if (kaydedici) { kaydedici.stop(); return; }
    if (typeof MediaRecorder === 'undefined') { bildir('Bu tarayıcı ses kaydını desteklemiyor.'); return; }
    try { await Dinleyici.ac(); } catch (e) { bildir(e.message); return; }
    abone = Dinleyici.abone(() => {}); parcalar = [];
    try { kaydedici = new MediaRecorder(Dinleyici.akim); } catch (e) { Dinleyici.birak(abone); bildir('Kayıt başlatılamadı.'); return; }
    kaydedici.ondataavailable = e => { if (e.data && e.data.size) parcalar.push(e.data); };
    kaydedici.onstop = async () => {
      clearInterval(z); const tur = kaydedici.mimeType || 'audio/webm', sure = performance.now() - bas; kaydedici = null; Dinleyici.birak(abone);
      $('#skKayit').innerHTML = `${ikon('kayit')}<span>Kaydı başlat</span>`; $('#skKayit').classList.add('birincil'); $('#skDurum').textContent = '';
      if (sure < 800 || !parcalar.length) { bildir('Kayıt çok kısa olduğu için saklanmadı.'); return; }
      const d = new Date(), k = { id: kimlik(), ad: 'Kayıt · ' + d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), ts: Date.now(), sure: Math.round(sure), tur, blob: new Blob(parcalar, { type: tur }) };
      await Depo.koy(k); kayitlarCiz(); bildir('Kayıt saklandı.');
    };
    kaydedici.start(500); bas = performance.now(); $('#skKayit').innerHTML = `${ikon('dur')}<span>Kaydı bitir</span>`; $('#skKayit').classList.remove('birincil');
    z = setInterval(() => { $('#skDurum').innerHTML = `<span class="kayit-nokta"></span> ${sureYazi(performance.now() - bas)}`; }, 500);
  });
  $('#skListe').addEventListener('click', async e => {
    const b = e.target.closest('button[data-k]'); if (!b) return; const id = b.closest('li').dataset.id, l = await Depo.hepsi(), k = l.find(x => x.id === id); if (!k) return;
    if (b.dataset.k === 'ad') { const ad = prompt('Kaydın yeni adı:', k.ad); if (ad && ad.trim()) { k.ad = ad.trim().slice(0, 60); await Depo.koy(k); kayitlarCiz(); } }
    if (b.dataset.k === 'sil') { if (!confirm(`“${k.ad}” silinsin mi? Bu geri alınamaz.`)) return; await Depo.sil(id); if (kayitUrl.has(id)) { URL.revokeObjectURL(kayitUrl.get(id)); kayitUrl.delete(id); } kayitlarCiz(); }
  });
  // Yedek
  $('#yedekAl').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ tur: 'tezene-yedek', surum: 3, tarih: new Date().toISOString(), ayar: st, defter: Defter.v, ilerleme: Ilerleme.v })], { type: 'application/json' });
    dosyaVer(blob, 'tezene-yedek-' + new Date().toISOString().slice(0, 10) + '.json')
      .then(s => { $('#yedekMsj').textContent = s === 'paylasildi' ? 'Yedek dosyası paylaşım menüsüne verildi; “Dosyalara kaydet” ile saklayabilirsiniz.' : 'Yedek dosyası indirildi.'; })
      .catch(e => { $('#yedekMsj').textContent = 'Yedek verilemedi: ' + (e && e.message || e); });
  });
  $('#yedekYukle').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return; const msj = $('#yedekMsj');
    if (f.size > 3 * 1024 * 1024) { msj.textContent = 'Dosya çok büyük (en çok 3 MB).'; return; }
    try {
      const v = JSON.parse(await f.text()); if (!v || v.tur !== 'tezene-yedek') throw new Error('Bu dosya bir Tezene yedeği değil.');
      if (!confirm('Mevcut ayarlar ve defter, yedektekilerle değiştirilsin mi?')) return;
      st = normDurum(v.ayar); hemenKaydet(); Defter.v = Defter.norm(v.defter); Defter.sakla(); if (v.ilerleme) { LS.set('tezene_ilerleme', v.ilerleme); Ilerleme.yukle(); } temaUygula(); modUygula(); yenile(); msj.textContent = 'Yedek yüklendi.';
    } catch (err) { msj.textContent = 'Yedek okunamadı: ' + (err.message || err); }
  });
}

/* ───────── ORTAK: perde bulma ve mini sap ───────── */
function perdeBul(tel, k) { const h = k * K - st.teller[tel] * K; if (Math.abs(h) < 6) return 0; const i = perdeler().findIndex(c => Math.abs(c - h) < 6); return i >= 0 ? i + 1 : null; }
function notaYeri(n) { const p = perdeBul(n.tel, n.k); return p == null ? 'sapta yok' : TEL_AD[n.tel] + ' · ' + (p ? p + '. perde' : 'boş'); }
function notaCipleri(notlar) { return `<div class="nota-dizi">${notlar.map(n => `<span>${esc(notaAdi(n.k * K, false).metin)}<small>${esc(notaYeri(n))}</small></span>`).join('')}</div>`; }
function miniSap(notlar) {
  const yer = notlar.map((n, i) => ({ ...n, p: perdeBul(n.tel, n.k), sira: i + 1 })), enCok = Math.max(5, ...yer.map(y => y.p || 0)) + 1;
  const hucre = (t, p) => { const y = yer.filter(x => x.tel === t && x.p === p); return `<div class="ms-h${p === 0 ? ' bos' : ''}">${y.length ? `<i class="nokta" title="${esc(notaAdi(y[0].k * K, false).metin)}">${esc(notaAdi(y[0].k * K, false).metin)}</i>` : ''}${p && t === 0 ? `<small>${p}</small>` : ''}</div>`; };
  let govde = ''; for (const t of [2, 1, 0]) { govde += '<div class="ms-satir">'; for (let p = 0; p <= enCok; p++) govde += hucre(t, p); govde += '</div>'; }
  const eksik = yer.filter(y => y.p == null);
  return `<div class="mini-sap" role="img" aria-label="${esc('Sapta: ' + yer.map(y => notaAdi(y.k * K, false).metin + ' ' + notaYeri(y)).join(', '))}"><div class="ms-etiket">${[2, 1, 0].map(t => `<span>${TEL_AD[t]}</span>`).join('')}</div><div class="ms-govde">${govde}</div></div>${eksik.length ? `<p class="hata">Sazınızın perde ayarında karşılığı olmayan ses: ${esc(eksik.map(y => notaAdi(y.k * K, false).metin).join(', '))}. Ayarlar › Perdeler’den ekleyebilirsiniz.</p>` : ''}`;
}
const baglamaSvg = cls => `<svg class="baglama-cizim ${cls || ''}" viewBox="0 0 640 200" aria-hidden="true"><use href="#i-baglama"/></svg>`;

/* ───────── ANA SAYFA ───────── */
function gununEgzersizi() { const uygun = MF.egzersizler.filter(e => e.sv <= Ilerleme.seviye()), g = new Date(); const n = Math.floor(new Date(g.getFullYear(), g.getMonth(), g.getDate()).getTime() / 864e5); return uygun.length ? uygun[n % uygun.length] : MF.egzersizler[0]; }
function anaCiz() {
  const h = new Date().getHours();
  $('#anaSelam').textContent = h >= 5 && h < 12 ? 'Günaydın' : h < 18 && h >= 12 ? 'İyi günler' : h >= 18 && h < 23 ? 'İyi akşamlar' : 'İyi geceler';
  $('#anaTarih').textContent = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const ilk = !st.mod; $('#karsilama').hidden = !ilk; $('#anaIcerik').hidden = ilk; if (ilk) return;
  // Kaldığın yerden devam
  const d = Ilerleme.siradaki(), biten = Ilerleme.biten(), top = MF.dersler.length;
  if (d) {
    const r = Ilerleme.v.dersler[d.id], basladi = r && r.adim > 0, sv = MF.seviyeler.find(s => s.sv === d.sv) || {};
    $('#devamKart').innerHTML = `<div><div class="devam-ust">Seviye ${d.sv} · ${esc(sv.ad || '')} · Ders ${MF.dersler.indexOf(d) + 1}/${top}</div><h2>${esc(d.ad)}</h2><p>${esc(d.ozet)} · yaklaşık ${d.dk} dk</p>
      ${adimCubuguHtml(d, r ? r.adim : 0)}
      <div class="dugmeler"><button class="btn birincil buyuk" data-ders="${d.id}">${ikon('oynat')}<span>${basladi ? 'Derse devam et' : biten ? 'Sıradaki derse başla' : 'İlk derse başla'}</span></button><button class="btn buyuk" data-git="dersler">Tüm dersler</button></div></div>${baglamaSvg()}`;
  } else {
    $('#devamKart').innerHTML = `<div><div class="devam-ust">Tüm seviyeler tamamlandı</div><h2>${top} dersin hepsini bitirdiniz</h2><p>Şimdi egzersizlerde temponuzu artırın ya da dersleri tekrar edin.</p><div class="dugmeler"><button class="btn birincil buyuk" data-git="dersler" data-sekme="egz">Egzersizlere git</button></div></div>${baglamaSvg()}`;
  }
  // Bugünün çalışması
  const b = Ilerleme.bugun(), e = gununEgzersizi(), gorevler = [
    { ad: 'Sazınızı akort edin', ac: b.akort.length >= 3 ? 'Üç tel de akortlu.' : `Üç teli de yeşile getirin (${b.akort.length}/3).`, bitti: b.akort.length >= 3, btn: `<button class="btn kucuk" data-git="akort">Akort</button>` },
    d ? { ad: `Ders: ${d.ad}`, ac: b.ders ? 'Bugün derste ilerlediniz.' : 'Bir adım bile ilerlemek yeter.', bitti: b.ders, btn: `<button class="btn kucuk" data-ders="${d.id}">Aç</button>` } : null,
    { ad: `Egzersiz: ${e.ad}`, ac: b.egz ? 'Bugün bir egzersiz tempoyla kaydedildi.' : e.ac, bitti: b.egz, btn: `<button class="btn kucuk" data-git="dersler" data-sekme="egz">Aç</button>` },
    st.mod === 'pro' ? { ad: 'Metronomla 5 dakika', ac: `Bugün ${Math.floor(b.met / 60000)} dk metronomla çalıştınız.`, bitti: b.met >= 300000, btn: `<button class="btn kucuk" data-git="ritim">Metronom</button>` } : null
  ].filter(Boolean);
  $('#gorevler').innerHTML = gorevler.map(g => `<li class="gorev${g.bitti ? ' bitti' : ''}"><span class="tik" aria-hidden="true">${ikon('tamam')}</span><div><b>${esc(g.ad)}</b><small>${esc(g.ac)}</small></div>${g.bitti ? '<span class="gizli-metin">tamamlandı</span>' : g.btn}</li>`).join('');
  $('#gunlukOzet').textContent = `${gorevler.filter(g => g.bitti).length}/${gorevler.length} tamam`;
  // Gelişim
  const hafta = Defter.v.oturumlar.filter(o => o.bas >= haftaBasi()).reduce((a, o) => a + o.sure, 0);
  const enIyi = MF.egzersizler.map(x => Ilerleme.enIyi(x.id)).filter(Boolean), seri = Ilerleme.seri();
  $('#istatistik').innerHTML = [
    ['alev', seri ? `${seri} gün` : '0 gün', 'çalışma serisi'],
    ['ders', `${biten}/${top}`, 'tamamlanan ders'],
    ['saat', hafta ? sureYazi(hafta, true) : '0 dk', 'bu hafta (kronometre)'],
    ['ritim', enIyi.length ? `${Math.max(...enIyi)}` : '—', 'en yüksek egzersiz temposu']
  ].map(([i, v, a]) => `<div class="ist">${ikon(i)}<b>${esc(v)}</b><span>${esc(a)}</span></div>`).join('');
  $('#seviyeCubuk').innerHTML = MF.seviyeler.map(s => { const l = MF.dersler.filter(x => x.sv === s.sv), t = l.filter(x => Ilerleme.v.dersler[x.id] && Ilerleme.v.dersler[x.id].bitti).length; return `<div class="sv-satir"><span>${esc(s.ad)}</span><div class="cubuk" role="progressbar" aria-label="${esc(s.ad)} seviyesi" aria-valuemin="0" aria-valuemax="${l.length}" aria-valuenow="${t}"><i style="width:${l.length ? t / l.length * 100 : 0}%"></i></div><span>${t}/${l.length}</span></div>`; }).join('');
}
function adimCubuguHtml(d, adim) { return `<div class="adim-cubugu" aria-hidden="true">${d.adimlar.map((_, i) => `<i class="${i < adim ? 'tamam' : ''}"></i>`).join('')}</div>`; }

/* ───────── DERSLER ve EGZERSİZLER ───────── */
let dersSekmesi = 'ders';
function derslerCiz() {
  $$('#dersSekme button').forEach(b => b.setAttribute('aria-selected', b.dataset.s === dersSekmesi));
  $('#dersListe').hidden = dersSekmesi !== 'ders'; $('#egzListe').hidden = dersSekmesi !== 'egz';
  $('#dersOzet').innerHTML = `<b>${Ilerleme.biten()}/${MF.dersler.length}</b> ders tamamlandı`;
  const sirada = Ilerleme.siradaki();
  $('#dersListe').innerHTML = MF.seviyeler.map(s => {
    const l = MF.dersler.filter(d => d.sv === s.sv), t = l.filter(d => Ilerleme.v.dersler[d.id] && Ilerleme.v.dersler[d.id].bitti).length;
    return `<section><div class="sv-grup-ust"><div><h2>Seviye ${s.sv} · ${esc(s.ad)}</h2><p>${esc(s.ozet)}</p></div><div class="cubuk" role="progressbar" aria-label="${esc(s.ad)}" aria-valuemin="0" aria-valuemax="${l.length}" aria-valuenow="${t}"><i style="width:${t / l.length * 100}%"></i></div></div>
      <ol class="ders-satirlar">${l.map(d => { const r = Ilerleme.v.dersler[d.id], bitti = r && r.bitti, yari = r && !bitti && r.adim > 0, no = MF.dersler.indexOf(d) + 1;
        return `<li><button class="ders-btn${bitti ? ' bitti' : yari || d === sirada ? ' devam-ediyor' : ''}" data-ders="${d.id}"><span class="ders-no">${bitti ? ikon('tamam') : no}</span><div><b>${esc(d.ad)}</b><small>${esc(d.ozet)}${yari ? ` · ${r.adim}/${d.adimlar.length} adım` : ''}${bitti ? ' · tamamlandı' : ''}</small></div><span class="sure-etiket">${d.dk} dk</span></button></li>`; }).join('')}</ol></section>`;
  }).join('');
  egzCizListe();
}
function egzNotlari(e) { if (e.notlar === 'tum') return [{ tel: 0, k: 0 }].concat(perdeler().filter(c => c <= 1200.5).map(c => ({ tel: 0, k: Math.round(c / K) }))); return e.notlar; }
function egzCizListe() {
  $('#egzListe').innerHTML = MF.egzersizler.map(e => {
    const l = Ilerleme.v.egz[e.id] || [], en = Ilerleme.enIyi(e.id), son = l[l.length - 1], calisiyor = Met.acik && Met.egz === e.id;
    const tavan = Math.max(e.hedef, en || 0), gecmis = l.slice(-12);
    return `<article class="kart egz" data-e="${e.id}"><div class="egz-ust"><div><h3>${esc(e.ad)}</h3><p>${esc(e.ac)}</p></div><span class="rozet sv">Seviye ${e.sv}</span></div>
      ${notaCipleri(egzNotlari(e))}
      <div class="egz-veri"><span>En iyi <b>${en ? en + ' bpm' : '—'}</b></span><span>Hedef <b>${e.hedef} bpm</b></span><span>Son <b>${son ? new Date(son.ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '—'}</b></span></div>
      ${gecmis.length ? `<div class="egz-gecmis" role="img" aria-label="Son ${gecmis.length} kaydın temposu: ${gecmis.map(k => k.bpm).join(', ')}">${gecmis.map(k => `<i style="height:${Math.max(8, k.bpm / tavan * 100)}%" title="${k.bpm} bpm"></i>`).join('')}</div>` : '<p class="not">Henüz kayıt yok. Metronomla çalın, temiz çaldığınız tempoyu kaydedin.</p>'}
      <div class="egz-kontrol"><label class="gizli-metin" for="egzBpm-${e.id}">${esc(e.ad)} temposu</label><input id="egzBpm-${e.id}" type="number" min="30" max="300" inputmode="numeric" value="${son ? son.bpm : e.bas}">
        <button class="btn${calisiyor ? ' birincil' : ''}" data-eg="cal" aria-pressed="${calisiyor}">${calisiyor ? ikon('dur') + '<span>Durdur</span>' : ikon('oynat') + '<span>Metronomla çal</span>'}</button>
        <button class="btn" data-eg="kaydet">${ikon('tamam')}<span>Bu tempoda temiz çaldım</span></button></div></article>`;
  }).join('');
}
function derslerBaglan() {
  $('#dersSekme').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; dersSekmesi = b.dataset.s; derslerCiz(); });
  $('#egzListe').addEventListener('click', e => {
    const b = e.target.closest('button[data-eg]'); if (!b) return; const kart = b.closest('.egz'), ex = MF.egzersizler.find(x => x.id === kart.dataset.e); if (!ex) return;
    const v = Math.round(+$(`#egzBpm-${ex.id}`).value);
    if (!(v >= 30 && v <= 300)) { bildir('Tempo 30 ile 300 arasında olmalı.'); return; }
    if (b.dataset.eg === 'cal') { if (Met.acik && Met.egz === ex.id) Met.durdur(); else { st.met.usul = ex.usul; bpmAyarla(v); Met.baslat(); Met.egz = ex.id; } egzCizListe(); }
    else { Ilerleme.egzKaydet(ex.id, v); const en = Ilerleme.enIyi(ex.id); bildir(en === v && (Ilerleme.v.egz[ex.id] || []).length > 1 ? `Yeni rekor: ${v} bpm` : `${ex.ad}: ${v} bpm kaydedildi.`); egzCizListe(); }
  });
}

/* ───────── DERS OYNATICI ───────── */
const Ders = { d: null, i: 0, tamam: false, temiz: null };
function dersAc(id, adim) {
  const d = MF.dersler.find(x => x.id === id); if (!d) return;
  const r = Ilerleme.v.dersler[id]; Ders.d = d; Ders.i = adim != null ? adim : (r && !r.bitti ? Math.min(r.adim, d.adimlar.length - 1) : 0);
  st.ders = id; git('ders');
}
function dersTemizle() { if (Ders.temiz) { try { Ders.temiz(); } catch (e) { /* yok say */ } Ders.temiz = null; } }
function dersCiz() {
  const d = Ders.d || MF.dersler.find(x => x.id === st.ders); if (!d) { git('dersler'); return; } Ders.d = d;
  $('#dersAd').textContent = d.ad;
  adimCiz();
}
function adimCiz() {
  dersTemizle(); const d = Ders.d, n = d.adimlar.length, el = $('#dersAdim'), sv = MF.seviyeler.find(s => s.sv === d.sv) || {};
  $('#dersUst').textContent = `Seviye ${d.sv} · ${sv.ad || ''} · ${Ders.i < n ? `Adım ${Ders.i + 1}/${n}` : 'Tamamlandı'}`;
  $('#adimCubugu').innerHTML = d.adimlar.map((_, i) => `<i class="${i < Ders.i ? 'tamam' : i === Ders.i ? 'simdi' : ''}"></i>`).join('');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  if (Ders.i >= n) { // bitiş ekranı
    const sonraki = MF.dersler[MF.dersler.indexOf(d) + 1], r = Ilerleme.v.dersler[d.id] || { atlanan: [] };
    el.innerHTML = `<h2>Ders tamamlandı</h2><p>“${esc(d.ad)}” dersini bitirdiniz.${r.atlanan.length ? ` Mikrofonlu ${r.atlanan.length} adımı atladınız; istediğiniz zaman dersi açıp tekrar deneyebilirsiniz.` : ''}</p>${baglamaSvg()}
      <div class="dugmeler">${sonraki ? `<button class="btn birincil buyuk" data-ders="${sonraki.id}">${ikon('oynat')}<span>Sonraki ders: ${esc(sonraki.ad)}</span></button>` : ''}<button class="btn buyuk" data-git="dersler">Derslere dön</button><button class="btn buyuk" data-ders-bastan="${d.id}">Dersi tekrarla</button></div>`;
    $('.ders-alt').hidden = true; return;
  }
  $('.ders-alt').hidden = false;
  const a = d.adimlar[Ders.i], pro = st.mod === 'pro' && a.pro ? `<p class="pro-not"><b>Teknik not.</b> ${esc(a.pro)}</p>` : '';
  const ps = (a.p || []).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
  Ders.tamam = a.t === 'metin' || a.t === 'dinle';
  if (a.t === 'metin') el.innerHTML = `<h2>${esc(a.b)}</h2>${ps}${a.cizim === 'baglama' ? baglamaSvg() : ''}${a.sap ? miniSap(a.sap) : ''}${pro}`;
  else if (a.t === 'dinle') {
    el.innerHTML = `<h2>${esc(a.b)}</h2>${ps}${notaCipleri(a.notlar.map(k => ({ tel: 0, k })))}<div class="dugmeler"><button class="btn birincil" id="dinleBtn">${ikon('ses')}<span>Dinle</span></button></div>${pro}`;
    $('#dinleBtn').addEventListener('click', () => { const z = a.notlar.map((k, i) => setTimeout(() => Ses.cal(k * K, 'ders'), i * 600)); Ders.temiz = () => z.forEach(clearTimeout); });
  }
  else if (a.t === 'soru') soruAdim(a, el);
  else if (a.t === 'cal' || a.t === 'akort') calAdim(a, el, ps, pro);
  else if (a.t === 'ritim') ritimAdim(a, el, ps, pro);
  dersDugmeleri();
}
function dersDugmeleri() {
  const ileri = $('#adimIleri'), son = Ders.i === Ders.d.adimlar.length - 1;
  ileri.disabled = !Ders.tamam; $('span', ileri).textContent = son ? 'Dersi bitir' : 'Devam';
}
function adimTamam() { Ders.tamam = true; dersDugmeleri(); }
function adimAtla() { Ilerleme.atla(Ders.d.id, Ders.i); adimTamam(); bildir('Adım atlandı; ders sonunda tekrar deneyebilirsiniz.'); }
function soruAdim(a, el) {
  el.innerHTML = `<h2>${esc(a.s)}</h2><div class="secenek-liste">${a.o.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('')}</div><p class="geri-bildirim" id="soruGb" aria-live="polite"></p>`;
  $('.secenek-liste', el).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || Ders.tamam) return; const i = +b.dataset.i, gb = $('#soruGb');
    if (i === a.d) { b.classList.add('dogru'); gb.className = 'geri-bildirim iyi'; gb.textContent = 'Doğru. ' + (a.a || ''); adimTamam(); }
    else { b.classList.add('yanlis'); b.disabled = true; gb.className = 'geri-bildirim kotu'; gb.textContent = 'Tam değil, bir daha deneyin.'; }
  });
}
function calAdim(a, el, ps, pro) {
  const akort = a.t === 'akort', hedefler = akort ? [0, 1, 2].map(t => ({ tel: t, k: st.teller[t] })) : a.hedef;
  const tol = akort ? 8 : (a.tol || (st.mod === 'pro' ? 20 : 30)), GEREK = akort ? 8 : 6;
  let j = 0, tut = 0, abone = 0;
  el.innerHTML = `<h2>${esc(a.b)}</h2>${ps}<div class="cal-hedef"><span class="buyuk-not" id="chNot"></span><div class="ch-bilgi"><span id="chYer"></span><span id="chDuyulan">Mikrofon kapalı</span></div></div>
    <div class="dinleme-cubugu" aria-hidden="true"><i id="chTut"></i></div>${akort ? '' : miniSap(hedefler.filter((h, i) => hedefler.findIndex(x => x.tel === h.tel && x.k === h.k) === i))}
    <div class="cal-sira" id="chSira">${hedefler.map(h => `<span>${esc(notaAdi(h.k * K, false).metin)}</span>`).join('')}</div>
    <div class="dugmeler"><button class="btn birincil" id="chBasla">${ikon('mik')}<span>Dinlemeye başla</span></button><button class="btn" id="chRef">${ikon('ses')}<span>Hedef sesi</span></button><button class="btn" id="chAtla">Mikrofon olmadan geç</button></div>
    <p class="hata" id="chHata" hidden></p>${!akort && hedefler.some(h => perdeBul(h.tel, h.k) == null) ? `<p class="hata">Bu adımdaki bazı sesler sazınızın perde ayarında yok; bu adımı geçebilirsiniz.</p>` : ''}${pro}`;
  const yaz = () => {
    const h = hedefler[j]; if (!h) return; $('#chNot').textContent = notaAdi(h.k * K, false).metin;
    $('#chYer').innerHTML = akort ? `<b>${TEL_AD[h.tel]} tel</b> boşta, ${hz(frekans(h.k * K))} Hz` : `<b>${esc(notaYeri(h))}</b>`;
    $$('#chSira span').forEach((s, i) => { s.className = i < j ? 'tamam' : i === j ? 'simdi' : ''; });
  };
  yaz();
  const bitir = () => { if (abone) { Dinleyici.birak(abone); abone = 0; } };
  Ders.temiz = bitir;
  $('#chRef').addEventListener('click', () => { const h = hedefler[j]; if (h) Ses.cal(h.k * K, 'ders', { sure: 1.6 }); });
  $('#chAtla').addEventListener('click', () => { bitir(); adimAtla(); $('#chDuyulan').textContent = 'Atlandı.'; });
  $('#chBasla').addEventListener('click', async () => {
    if (abone) { bitir(); $('#chBasla').innerHTML = `${ikon('mik')}<span>Dinlemeye başla</span>`; $('#chDuyulan').textContent = 'Mikrofon kapalı'; return; }
    try { await Dinleyici.ac(); } catch (e) { const hh = $('#chHata'); hh.textContent = e.message; hh.hidden = false; return; }
    $('#chBasla').innerHTML = `${ikon('dur')}<span>Dinlemeyi durdur</span>`; $('#chDuyulan').textContent = 'Dinleniyor. Sesi çalın.';
    abone = perdeDinle(r => {
      const h = hedefler[j]; if (!h) return;
      if (!r || r.f < 50 || r.f > 1500) { tut = Math.max(0, tut - 1); $('#chTut').style.width = tut / GEREK * 100 + '%'; return; }
      const c = sentF(r.f); let fark = c - h.k * K; fark -= Math.round(fark / 1200) * 1200;
      const duy = $('#chDuyulan'); duy.textContent = `Duyulan: ${notaAdi(c, false).metin}` + (Math.abs(fark) <= tol ? ' · doğru' : fark > 0 ? (akort ? ' · tiz, teli biraz gevşetin' : ' · biraz tiz') : (akort ? ' · pes, teli biraz gerin' : ' · biraz pes'));
      tut = Math.abs(fark) <= tol ? tut + 1 : 0; $('#chTut').style.width = Math.min(1, tut / GEREK) * 100 + '%';
      if (tut >= GEREK) {
        tut = 0; if (akort) Ilerleme.akortTel(h.tel); j++; yaz();
        if (j >= hedefler.length) { bitir(); $('#chBasla').disabled = true; $('#chAtla').disabled = true; $('#chNot').textContent = '✓'; $('#chYer').innerHTML = '<b>Hepsi doğru</b>'; $('#chDuyulan').textContent = 'Harika, devam edebilirsiniz.'; $('#chTut').style.width = '100%'; adimTamam(); }
      }
    });
  });
}
function ritimAdim(a, el, ps, pro) {
  let olcer = null;
  const desen = []; a.g.forEach((n, gi) => { for (let k = 0; k < n; k++) desen.push(k === 0 ? (gi === 0 ? 2 : 1) : 0); });
  el.innerHTML = `<h2>${esc(a.b)}</h2>${ps}<p class="not">Tempo ${a.bpm} · ${a.g.join('+')} · önce bir hazırlık ölçüsü, sonra ${a.olcu} ölçü. Kulaklık kullanmanız ölçümü iyileştirir.</p>
    <div class="vuruslar" id="rvVurus" style="justify-content:flex-start">${desen.map(s => `<i class="s${s}"></i>`).join('')}</div><p class="not" id="rvDurum"></p><p class="not" id="rvUyari"></p><div class="zt-sonuc" id="rvSonuc"></div>
    <div class="dugmeler"><button class="btn birincil" id="rvBasla">${ikon('hedef')}<span>Başla</span></button><button class="btn" id="rvAtla">Mikrofon olmadan geç</button></div>${pro}`;
  const sinir = st.mod === 'pro' ? 0.75 : 0.6;
  Ders.temiz = () => { if (olcer) olcer.durdur(); };
  $('#rvAtla').addEventListener('click', () => { if (olcer) olcer.durdur(); adimAtla(); });
  $('#rvBasla').addEventListener('click', () => {
    if (olcer) { olcer.durdur(); olcer = null; $('#rvBasla').innerHTML = `${ikon('hedef')}<span>Başla</span>`; return; }
    $('#rvSonuc').innerHTML = ''; $('#rvBasla').innerHTML = `${ikon('dur')}<span>Durdur</span>`;
    olcer = ritimOlc({ bpm: a.bpm, g: a.g, olcu: a.olcu, vur: a.vur }, {
      vurus: (i, s, sayim, sessiz) => { $$('#rvVurus i').forEach((x, k) => x.classList.toggle('simdi', k === i)); $('#rvDurum').textContent = sayim ? 'Hazırlık ölçüsü: dinleyin, çalmayın.' : sessiz ? 'Şimdi çalın (ışığı takip edin).' : 'Şimdi çalın.'; },
      uyari: m => { $('#rvUyari').textContent = m; },
      hata: m => { olcer = null; $('#rvBasla').innerHTML = `${ikon('hedef')}<span>Başla</span>`; $('#rvSonuc').innerHTML = `<p class="hata">${esc(m)}</p>`; },
      sonuc: r => {
        olcer = null; $('#rvDurum').textContent = ''; $('#rvSonuc').innerHTML = ritimSonucHtml(r);
        if (r.isabet >= sinir) { $('#rvBasla').disabled = true; $('#rvAtla').disabled = true; $('#rvSonuc').insertAdjacentHTML('beforeend', '<p class="geri-bildirim iyi">Geçtiniz. Devam edebilirsiniz.</p>'); adimTamam(); }
        else { $('#rvBasla').innerHTML = `${ikon('hedef')}<span>Yeniden dene</span>`; $('#rvSonuc').insertAdjacentHTML('beforeend', `<p class="geri-bildirim kotu">Geçmek için en az %${Math.round(sinir * 100)} isabet gerekiyor.</p>`); }
      }
    });
  });
}
function dersBaglan() {
  $('#adimIleri').addEventListener('click', () => {
    if (!Ders.tamam) return; const d = Ders.d, n = d.adimlar.length;
    if (Ders.i >= n - 1) { Ilerleme.dersBitir(d.id); Ders.i = n; bildir(`“${d.ad}” tamamlandı.`); }
    else { Ders.i++; Ilerleme.dersAdim(d.id, Ders.i); }
    adimCiz(); window.scrollTo(0, 0);
  });
  $('#adimGeri').addEventListener('click', () => { if (Ders.i > 0) { Ders.i--; adimCiz(); } else git('dersler'); });
  $('#dersGeri').addEventListener('click', () => git('dersler'));
}

/* ───────── MOD ve DAHA MENÜSÜ ───────── */
function modUygula() {
  const m = st.mod || 'kolay'; document.documentElement.dataset.mod = m;
  if (m === 'kolay' && st.ak.hedef === 'krom') st.ak.hedef = 'oto';
  ['#modRay', '#modSayfa', '#ayMod'].forEach(s => sekmeSec($(s), 'mod', st.mod || ''));
  const b = $('#ayModBilgi'); if (b) b.textContent = m === 'kolay' ? 'Kolay mod: sade anlatım ve temel araçlar. Makamlar, kromatik akort ve gelişmiş ayarlar gizlidir.' : 'Profesyonel mod: makam araçları, kromatik akort (53 koma / 12 yarım ses), teknik notlar, hızlanan tempo ve tüm ayarlar açıktır.';
}
function modSec(m) { st.mod = m; kaydet(); modUygula(); if (m === 'kolay' && st.v === 'makam') git('ana'); else yenile(); }
const Daha = {
  ac() { if (!$('#dahaSayfa').hidden) return; history.pushState({ daha: 1 }, '', location.hash); $('#dahaOrtu').hidden = false; $('#dahaSayfa').hidden = false; $('#dahaBtn').setAttribute('aria-expanded', 'true'); const f = $('#dahaSayfa button[data-git]'); if (f) f.focus(); },
  gizle() { $('#dahaOrtu').hidden = true; $('#dahaSayfa').hidden = true; $('#dahaBtn').setAttribute('aria-expanded', 'false'); },
  kapat(odak) { if ($('#dahaSayfa').hidden) return; if (history.state && history.state.daha) history.back(); $('#dahaOrtu').hidden = true; $('#dahaSayfa').hidden = true; $('#dahaBtn').setAttribute('aria-expanded', 'false'); if (odak !== false) $('#dahaBtn').focus(); }
};
function genelBaglan() {
  $('#dahaBtn').addEventListener('click', () => Daha.ac());
  $('#dahaKapat').addEventListener('click', () => Daha.kapat());
  $('#dahaOrtu').addEventListener('click', () => Daha.kapat());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') Daha.kapat(); });
  $('#dahaSayfa').addEventListener('click', e => { const b = e.target.closest('button[data-git]'); if (b) { Daha.gizle(); git(b.dataset.git, history.state && history.state.daha ? 'degistir' : undefined); } });
  window.addEventListener('popstate', () => { if (!$('#dahaSayfa').hidden) Daha.gizle(); });
  ['#modRay', '#modSayfa', '#ayMod'].forEach(s => $(s).addEventListener('click', e => { const b = e.target.closest('button[data-mod]'); if (b) modSec(b.dataset.mod); }));
  $('#karsilama').addEventListener('click', e => { const b = e.target.closest('button[data-ilk]'); if (!b) return; modSec(b.dataset.ilk); bildir(b.dataset.ilk === 'kolay' ? 'Kolay mod açık. İlk dersle başlayabilirsiniz.' : 'Profesyonel mod açık.'); });
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[download]'); if (!a || !yerelUygulama()) return; e.preventDefault(); fetch(a.href).then(r => r.blob()).then(b => dosyaVer(b, a.getAttribute('download'))).catch(er => bildir('Dosya verilemedi: ' + (er && er.message || er))); });
  // İçerikteki gezinme düğmeleri
  $('#ana').addEventListener('click', e => {
    const dd = e.target.closest('[data-ders]'); if (dd) { dersAc(dd.dataset.ders); return; }
    const db = e.target.closest('[data-ders-bastan]'); if (db) { dersAc(db.dataset.dersBastan, 0); return; }
    const g = e.target.closest('main [data-git]'); if (!g) return;
    if (g.dataset.sekme) dersSekmesi = g.dataset.sekme; git(g.dataset.git);
    if (g.dataset.odak) { const o = document.getElementById(g.dataset.odak); if (o) { o.scrollIntoView({ block: 'center' }); o.focus(); } }
  });
}

/* ───────── AYARLAR ───────── */
function ayarCiz() {
  secenekler($('#ayDuzen'), duzenSecenek(), st.duzen);
  const ts = []; for (let k = -62; k <= 22; k++) { const n = notaAdi(k * K, true); ts.push([k, n.metin + n.okt]); }
  $('#ayTeller').innerHTML = [2, 1, 0].map(t => `<label class="alan"><span class="etiket">${TEL_AD[t]} tel</span><select data-tel="${t}">${ts.map(([v, x]) => `<option value="${v}"${v === st.teller[t] ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`).join('');
  $('#ayDuzenSil').hidden = !st.ozelDuzen.some(d => d.id === st.duzen);
  $('#ayA4').value = st.a4; $('#ayTrans').value = st.trans; $('#ayInce').value = st.ince;
  $('#ayAhenkBilgi').textContent = `Alt tel boşta ${hz(frekans(st.teller[0] * K))} Hz.`;
  $('#ayPerdeHazir').value = st.perdeHazir; sekmeSec($('#aySap'), 's', st.sap); $('#ayPerdeSayi').value = st.perdeSayi;
  $('#ayPerdeler').innerHTML = st.perdeOct.map((p, i) => { const k = p.c / K, kt = Math.abs(k - Math.round(k)) < 0.02 ? Math.round(k) : k.toFixed(1).replace('.', ','); return `<label><input type="checkbox" data-i="${i}"${p.on ? ' checked' : ''}><span>${esc(notaAdi(p.c, false).metin)}<small>${kt} koma · ${Math.round(p.c)} sent</small></span><button data-sil="${i}" aria-label="${esc(notaAdi(p.c, false).metin)} perdesini sil" title="Perdeyi sil">${ikon('sil')}</button></label>`; }).join('');
  for (const [id, k] of [['sVol', 'vol'], ['sParlak', 'parlak'], ['sSure', 'sure'], ['sYanki', 'yanki']]) $('#' + id).value = st.ses[k];
  $('#gTema').value = st.tema; $('#gIsim').value = st.isim; $('#gOktav').checked = st.oktav; $('#gPerdeNo').checked = st.perdeNo; $('#gTumNot').checked = st.notGoster; $('#gSolak').checked = st.solak;
}
function perdeDegisti() { st.perdeHazir = 'ozel'; kaydet(); ayarCiz(); ozetGuncelle(); }
function ayarBaglan() {
  $('#ayDuzen').addEventListener('change', e => duzenSec(e.target.value));
  $('#ayTeller').addEventListener('change', e => { const s = e.target.closest('select[data-tel]'); if (!s) return; st.teller[+s.dataset.tel] = +s.value; st.duzen = 'ozel_gecici'; kaydet(); ayarCiz(); ozetGuncelle(); });
  $('#ayDuzenKaydet').addEventListener('click', () => { const ad = $('#ayDuzenAd').value.trim(); if (!ad) { bildir('Düzene bir ad verin.'); return; } if (st.ozelDuzen.length >= 30) { bildir('En çok 30 düzen kaydedilebilir.'); return; } const d = { id: 'dz_' + kimlik(), ad: ad.slice(0, 30), t: st.teller.slice() }; st.ozelDuzen.push(d); st.duzen = d.id; kaydet(); $('#ayDuzenAd').value = ''; ayarCiz(); ozetGuncelle(); bildir(`“${d.ad}” kaydedildi.`); });
  $('#ayDuzenSil').addEventListener('click', () => { const d = st.ozelDuzen.find(x => x.id === st.duzen); if (!d || !confirm(`“${d.ad}” düzeni silinsin mi?`)) return; st.ozelDuzen = st.ozelDuzen.filter(x => x.id !== d.id); duzenSec('baglama'); });
  const sayiAyar = (id, k, a, b) => $(id).addEventListener('change', e => { const v = parseFloat(String(e.target.value).replace(',', '.')); if (isFinite(v)) st[k] = k === 'a4' ? +clamp(v, a, b).toFixed(1) : Math.round(clamp(v, a, b)); kaydet(); ayarCiz(); ozetGuncelle(); });
  sayiAyar('#ayA4', 'a4', 380, 480); sayiAyar('#ayTrans', 'trans', -12, 12); sayiAyar('#ayInce', 'ince', -50, 50);
  $('#ayPerdeHazir').addEventListener('change', e => { const v = e.target.value; if (!PERDE_HAZIR[v]) { e.target.value = st.perdeHazir; return; } st.perdeHazir = v; st.perdeOct = PERDE_HAZIR[v].map(c => ({ c, on: true })); st.perdeSayi = sapSayisi(st.sap); kaydet(); ayarCiz(); });
  $('#ayPerdeSayi').addEventListener('change', e => { st.perdeSayi = Math.round(clamp(+e.target.value || 29, 8, 45)); kaydet(); ayarCiz(); });
  $('#aySap').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.sap = b.dataset.s; st.perdeSayi = sapSayisi(st.sap); kaydet(); ayarCiz(); });
  $('#ayPerdeler').addEventListener('change', e => { const i = e.target.dataset.i; if (i == null) return; st.perdeOct[+i].on = e.target.checked; if (!st.perdeOct.some(p => p.on)) { st.perdeOct[+i].on = true; bildir('En az bir perde açık kalmalı.'); } perdeDegisti(); });
  $('#ayPerdeler').addEventListener('click', e => { const b = e.target.closest('button[data-sil]'); if (!b) return; e.preventDefault(); if (st.perdeOct.length <= 1) { bildir('En az bir perde kalmalı.'); return; } st.perdeOct.splice(+b.dataset.sil, 1); perdeDegisti(); });
  $('#ayPerdeEkle').addEventListener('click', () => {
    const v = $('#ayPerdeYeni').value.trim().toLowerCase().replace(',', '.'), h = $('#ayPerdeHata'); h.hidden = true; const m = /^(\d+(?:\.\d+)?)\s*(k|koma|c|sent)?$/.exec(v);
    const hata = t => { h.textContent = t; h.hidden = false; };
    if (!m) return hata('Örnek: 12k (koma) ya da 250 (sent).');
    const c = +(m[2] && m[2].startsWith('k') ? +m[1] * K : +m[1]).toFixed(2);
    if (!(c > 5 && c < 1195)) return hata('Perde, boş tel ile oktav arasında olmalı (5–1195 sent).');
    if (st.perdeOct.some(p => Math.abs(p.c - c) < 5)) return hata('Bu konuma çok yakın bir perde zaten var.');
    if (st.perdeOct.length >= 60) return hata('En çok 60 perde eklenebilir.');
    st.perdeOct.push({ c, on: true }); st.perdeOct.sort((a, b) => a.c - b.c); $('#ayPerdeYeni').value = ''; perdeDegisti();
  });
  const kutu = (id, f) => $(id).addEventListener('change', e => { f(e.target.checked); kaydet(); });
  kutu('#gOktav', v => st.oktav = v); kutu('#gPerdeNo', v => st.perdeNo = v); kutu('#gTumNot', v => st.notGoster = v); kutu('#gSolak', v => st.solak = v);
  for (const [id, k] of [['sVol', 'vol'], ['sParlak', 'parlak'], ['sSure', 'sure'], ['sYanki', 'yanki']]) $('#' + id).addEventListener('input', e => { st.ses[k] = +e.target.value; kaydet(); Ses.uygula(); });
  $('#sDene').addEventListener('click', () => [0, 13, 22, 31].forEach((k, i) => setTimeout(() => Ses.cal(k * K, 'dene' + i), i * 300)));
  $('#gIsim').addEventListener('change', e => { st.isim = e.target.value; kaydet(); ayarCiz(); ozetGuncelle(); });
  $('#gTema').addEventListener('change', e => { st.tema = e.target.value; kaydet(); temaUygula(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (st.tema === 'oto') temaUygula(); });
  $('#aySifirla').addEventListener('click', () => { if (!confirm('Ayarlar varsayılana dönsün mü?')) return; const kalan = { ozelMakam: st.ozelMakam, ozelDuzen: st.ozelDuzen, egz: st.egz }; st = Object.assign(VARS(), kalan, { v: 'ayar' }); hemenKaydet(); Ses.uygula(); temaUygula(); yenile(); bildir('Ayarlar sıfırlandı.'); });
}

/* ───────── Gezinme ───────── */
const CIZ = { ana: anaCiz, dersler: derslerCiz, ders: dersCiz, akort: akortCiz, sap: sapCiz, makam: makamCiz, ritim: ritimCiz, kulak: egzCiz, defter: defterCiz, ayar: ayarCiz };
function git(v, gecmis) {
  if (!CIZ[v]) v = 'ana';
  if (v === 'makam' && st.mod !== 'pro') v = 'ana';
  if (v === 'ders' && !Ders.d && !MF.dersler.some(d => d.id === st.ders)) v = 'dersler';
  if (st.v === 'akort' && v !== 'akort' && Akort.acik) Akort.kapat();
  if (st.v === 'ders' && v !== 'ders') dersTemizle();
  if (st.v === 'ritim' && v !== 'ritim' && Zt.aktif) Zt.durdur();
  st.v = v; kaydet();
  $$('.gorunum').forEach(s => { s.hidden = s.dataset.v !== v; });
  const nav = v === 'ders' ? 'dersler' : v, birincil = ['ana', 'dersler', 'akort', 'ritim'].includes(nav);
  $$('#ray button[data-git]').forEach(b => { if (b.dataset.git === nav) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const daha = $('#dahaBtn'); if (birincil) daha.removeAttribute('aria-current'); else daha.setAttribute('aria-current', 'page');
  CIZ[v](); metArayuz(); ozetGuncelle();
  if (gecmis !== false && location.hash !== '#' + v) { if (gecmis === 'degistir') history.replaceState(null, '', '#' + v); else history.pushState(null, '', '#' + v); }
  window.scrollTo(0, 0);
}
function yenile() { ozetGuncelle(); CIZ[st.v](); }
function baslat() {
  $('#surum').textContent = SURUM; Ilerleme.yukle(); Defter.yukle(); temaUygula(); modUygula();
  Sap.baglan(); akortBaglan(); makamBaglan(); ritimBaglan(); egzBaglan(); defterBaglan(); ayarBaglan(); derslerBaglan(); dersBaglan(); genelBaglan();
  $('#ray').addEventListener('click', e => { const b = e.target.closest('button[data-git]'); if (b) git(b.dataset.git); });
  window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (CIZ[v] && v !== st.v) git(v, false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && Akort.acik) Akort.kapat(); });
  const h = location.hash.slice(1); git(CIZ[h] ? h : st.v, 'degistir');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.Tezene = { get st() { return st; }, Uyanik, dosyaVer, yerelUygulama, Ses, Sap, Met, Egz, Defter, Akort, Strob, Ilerleme, Ders, Dinleyici, Depo, Zt, ritimOlc, MF, perdeAlgila, notaAdi, notaAdi12, frekans, sentF, perdeler, perdeBul, diziK, makamBul, eksikSesler, K, SURUM, MAKAMLAR, DUZENLER };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baslat); else baslat();
})();
