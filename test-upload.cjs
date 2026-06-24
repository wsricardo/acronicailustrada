const http = require('http');

const data = JSON.stringify({
  filename: 'test.jpg',
  base64: 'data:image/jpeg;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
});

const req = http.request('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', err => console.error('Error:', err.message));
req.write(data);
req.end();
