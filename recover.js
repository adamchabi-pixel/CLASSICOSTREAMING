const fs = require('fs');
const content = fs.readFileSync('vite_app.js', 'utf8');
const match = content.match(/sourceMappingURL=data:application\/json;base64,(.*)$/);
if (match) {
  const jsonStr = Buffer.from(match[1], 'base64').toString('utf8');
  const sm = JSON.parse(jsonStr);
  const appSrc = sm.sourcesContent[0];
  fs.writeFileSync('src/App.tsx.recovered', appSrc);
  console.log('Recovered successfully!');
} else {
  console.log('No sourcemap found in vite_app.js');
}
