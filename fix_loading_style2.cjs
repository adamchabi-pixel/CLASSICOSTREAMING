const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

// The style tag is currently in head.
const styleTagRegex = /<style>.*?<\/style>/is;
const match = file.match(styleTagRegex);
if (match) {
   let styleContent = match[0];
   // scope it to #root > div
   styleContent = styleContent.replace(/span:first-child/g, '#startup-screen span:first-child');
   styleContent = styleContent.replace(/span:nth-child\(2\)/g, '#startup-screen > span:nth-child(2)');
   file = file.replace(match[0], styleContent);
   
   // add id="startup-screen" to the main div
   file = file.replace('<div style="display:flex;', '<div id="startup-screen" style="display:flex;');
   fs.writeFileSync('index.html', file);
   console.log("Fixed style scoping in index.html");
}
