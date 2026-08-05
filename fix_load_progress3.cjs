const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `                 newProgressData[k] = pct;
                 if (!k.endsWith("-tv")) {
                     newProgressData[k + "-tv"] = pct;
                 }
                 if (k.endsWith("-tv")) {
                     newProgressData[k.replace("-tv", "")] = pct;
                 }`;

const replacement1 = `                 if (pct > (newProgressData[k] || 0) || !newProgressData[k]) newProgressData[k] = pct;
                 if (!k.endsWith("-tv")) {
                     if (pct > (newProgressData[k + "-tv"] || 0) || !newProgressData[k + "-tv"]) newProgressData[k + "-tv"] = pct;
                 }
                 if (k.endsWith("-tv")) {
                     if (pct > (newProgressData[k.replace("-tv", "")] || 0) || !newProgressData[k.replace("-tv", "")]) newProgressData[k.replace("-tv", "")] = pct;
                 }`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/App.tsx', content);
console.log("fixed final block");
