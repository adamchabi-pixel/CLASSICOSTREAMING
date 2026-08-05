const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

// Move the style tag OUTSIDE of #root so it survives React mounting
const styleTagRegex = /<style>.*?<\/style>/is;
const match = file.match(styleTagRegex);
if (match) {
   file = file.replace(match[0], '');
   file = file.replace('</head>', match[0] + '</head>');
   fs.writeFileSync('index.html', file);
   console.log("Moved style tag in index.html");
}
