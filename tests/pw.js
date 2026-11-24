// Playwright'ı bul: önce yerel kurulum, yoksa komşu MenüGo klasöründeki kurulum.
const path = require('path');
const adaylar = ['playwright', path.join(__dirname, '..', '..', '..', 'menugo-son-hal', 'node_modules', 'playwright'), path.join(__dirname, '..', '..', '..', 'menugo-devir', 'node_modules', 'playwright')];
for (const a of adaylar) { try { module.exports = require(a); return; } catch (e) { /* sıradaki */ } }
throw new Error('Playwright bulunamadı. saz klasöründe: npm install playwright && npx playwright install chromium');
