// Yerel önizleme sunucusu: node sunucu.js [port]
// Telefonda denemek için aynı Wi-Fi'deki telefondan http://<bilgisayar-IP>:<port> açılabilir
// (mikrofon/akort için tarayıcılar https veya localhost ister).
const http = require('http'), fs = require('fs'), path = require('path');
const KOK = __dirname, PORT = +process.argv[2] || 8080;
const TUR = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
function sunucu() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const dosya = path.normalize(path.join(KOK, p));
    if (!dosya.startsWith(KOK + path.sep) || /[\\/](tests|node_modules)[\\/]/.test(dosya.slice(KOK.length))) { res.writeHead(403); return res.end(); }
    fs.readFile(dosya, (err, veri) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Bulunamadı'); }
      res.writeHead(200, { 'Content-Type': TUR[path.extname(dosya)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(veri);
    });
  });
}
if (require.main === module) sunucu().listen(PORT, () => console.log(`Tezene: http://localhost:${PORT}`));
module.exports = { sunucu };
