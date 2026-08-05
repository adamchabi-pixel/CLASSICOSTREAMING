const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const combined = asyncData ? [...asyncData.imported, ...asyncData.all] : [].filter(m => m && !isAnimeOrAdult(m as unknown as Movie));',
  'const combined = (asyncData ? [...asyncData.imported, ...asyncData.all] : []).filter(m => m && !isAnimeOrAdult(m as unknown as Movie));'
);

fs.writeFileSync('src/App.tsx', app);
console.log("Success");
