#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const dir = path.join(__dirname, '..', 'dist', 'storybook', 'ui-kit');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(dir, req.url);

  // For SPA routing, serve index.html for root or no extension
  if (req.url === '/' || req.url === '' || !path.extname(req.url)) {
    filePath = path.join(dir, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // For SPA, try to serve index.html for client-side routing
        fs.readFile(path.join(dir, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const mime = mimeTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Serving Storybook at http://localhost:${port}`);
  console.log(`Open your browser to http://localhost:${port}`);
});
