const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        fs.writeFileSync('frontend_dump.json', body);
        console.log('Data successfully saved to frontend_dump.json');
      } catch(e) {
        console.error('Error writing file', e);
      }
      res.writeHead(200);
      res.end('OK');
      
      // Fechar servidor após receber os dados
      setTimeout(() => process.exit(0), 1000);
    });
  }
});

server.listen(9999, () => {
  console.log('Listening on 9999 for frontend dump...');
});
