/* Servidor estatico minimo, sem dependencias.
   Uso:  node server.js        -> http://localhost:8080
   A camera do navegador so libera em http://localhost ou em https. */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORTA = process.env.PORT || 8080;
const RAIZ  = __dirname;

const TIPOS = {
  '.html':'text/html; charset=utf-8',
  '.js'  :'text/javascript; charset=utf-8',
  '.css' :'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png' :'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon'
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let arquivo = path.join(RAIZ, url === '/' ? 'index.html' : url);

  // impede sair da pasta do projeto
  if (!arquivo.startsWith(RAIZ)) { res.writeHead(403).end('403'); return; }

  fs.readFile(arquivo, (erro, dados) => {
    if (erro) { res.writeHead(404, {'Content-Type':'text/plain'}).end('404 - nao encontrado'); return; }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(dados);
  });
}).listen(PORTA, () => {
  console.log('AR Explorer rodando em http://localhost:' + PORTA);
});
