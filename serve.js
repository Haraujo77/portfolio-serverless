// A very simple static server to test the portfolio locally
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

const server = http.createServer((req, res) => {
  // Log all requests with method and URL for debugging
  console.log(`[SERVER] Received ${req.method} request for: ${req.url}`);
  
  // Special logging for JSON requests and API calls
  if (req.url.endsWith('.json')) {
    console.log(`[SERVER] JSON file requested: ${req.url}`);
  }
  
  if (req.url.startsWith('/api/')) {
    console.log(`[SERVER] WARNING: API call detected: ${req.url}`);
    console.log(`[SERVER] NOTE: API calls won't work in serverless mode. Use local JSON files instead.`);
    console.log(`[SERVER] For projects, use: js/projects.json`);
    console.log(`[SERVER] For intro text, use: js/intro.json`);
    
    // Return a helpful error for API calls
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'API not available in serverless mode',
      message: 'This is the serverless version. Please use local JSON files instead.',
      suggestion: 'Modify your fetch calls to use local JSON files like "js/projects.json" instead of "/api/projects"'
    }));
    return;
  }
  
  // Handle the root path
  let filePath = req.url === '/' ? './index.html' : '.' + req.url;
  
  // Clean up the file path to prevent directory traversal
  filePath = path.normalize(filePath);
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Map file extensions to MIME types
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon'
  };

  // Set the content type
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Check if the file exists
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If the file doesn't exist, try to serve it from the public folder
      if (err.code === 'ENOENT') {
        // Try to serve from public directory
        const publicFilePath = './public' + req.url;
        fs.readFile(publicFilePath, (err2, content2) => {
          if (err2) {
            console.log(`[SERVER] File not found: ${filePath} or ${publicFilePath}`);
            res.writeHead(404);
            res.end('File not found');
          } else {
            console.log(`[SERVER] Serving file from public directory: ${publicFilePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content2, 'utf-8');
          }
        });
      } else {
        // Server error
        console.log(`[SERVER] Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      console.log(`[SERVER] Successfully serving: ${filePath} (${contentType})`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n[SERVER] Server running at http://localhost:${PORT}/`);
  console.log(`[SERVER] Open this URL in your browser to view your site.`);
  console.log(`[SERVER] Press Ctrl+C to stop the server.\n`);
}); 