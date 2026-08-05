const http = require('http');
http.get('http://localhost:3000/api/discover?type=movie', (res) => {
  console.log("Status:", res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
