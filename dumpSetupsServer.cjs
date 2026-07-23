const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
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
      fs.writeFileSync('setups_dump.json', body);
      console.log('Data successfully saved to setups_dump.json');
      res.writeHead(200);
      res.end('OK');
      setTimeout(() => process.exit(0), 1000);
    });
  }
});

server.listen(9998, () => {
  console.log('Listening on 9998 for setups dump...');
});
