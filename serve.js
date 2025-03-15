// A very simple static server to test the portfolio locally
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Handle admin path specifically
  if (req.url === '/admin' || req.url === '/admin.html') {
    const adminPath = path.join(__dirname, 'public', 'admin.html');
    fs.readFile(adminPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading admin page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    });
    return;
  }
  
  // Handle root path
  let filePath = req.url === '/' 
    ? path.join(__dirname, 'public', 'index.html')
    : path.join(__dirname, req.url);
  
  // Ensure paths are within the public folder
  if (!filePath.startsWith(path.join(__dirname, 'public')) && 
      !filePath.startsWith(path.join(__dirname, 'index.html'))) {
    filePath = path.join(__dirname, 'public', req.url);
  }
  
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        console.error(`File not found: ${filePath}`);
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading the page');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`To test the portfolio, open: http://localhost:${PORT}/`);
  console.log(`To access the admin interface, open: http://localhost:${PORT}/admin`);
}); 