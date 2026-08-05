const fs = require('fs');

function patchFile(filename) {
    let file = fs.readFileSync(filename, 'utf8');
    
    // Replace JSON.parse(localStorage.getItem(X) || "{}") with (JSON.parse(localStorage.getItem(X) || "{}") || {})
    file = file.replace(/JSON\.parse\(localStorage\.getItem\((.*?)\)\s*\|\|\s*"{}"\)/g, '(JSON.parse(localStorage.getItem($1) || "{}") || {})');
    
    // Replace JSON.parse(localStorage.getItem(X)) with (JSON.parse(localStorage.getItem(X) || "null") || {})
    // But be careful not to match the ones we just replaced.
    // Since we just did a robust replace, let's just use regex for typical patterns.
    
    fs.writeFileSync(filename, file);
}

patchFile('src/components/CinemaPlayerView.tsx');
patchFile('src/App.tsx');
console.log("Patched JSON.parse fallbacks.");
