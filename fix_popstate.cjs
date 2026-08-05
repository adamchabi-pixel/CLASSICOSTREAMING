const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/else if \(path === "\/collections"\) setActiveTab\("collections"\);/g, 'else if (path === "/collections") setActiveTab("collections");\n      else if (path === "/series") setActiveTab("series");');
fs.writeFileSync('src/App.tsx', content);
