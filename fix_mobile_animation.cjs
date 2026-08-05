const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace animation string in index.html
    if (filePath === 'index.html') {
        content = content.replace(/animation:illuminate 1\.5s infinite ease-in-out/g, 'animation:illuminate 1.5s infinite ease-in-out both');
        content = content.replace(/@keyframes illuminate \{[^\}]+\}/, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }');
    }
    
    // Replace animation string in App.tsx
    if (filePath === 'src/App.tsx') {
        content = content.replace(/animation: "illuminate 1\.5s infinite ease-in-out"/g, 'animation: "illuminate 1.5s infinite ease-in-out both"');
        content = content.replace(/@keyframes illuminate \{[^\}]+\}/, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }');
    }
    
    fs.writeFileSync(filePath, content);
}

patchFile('index.html');
patchFile('src/App.tsx');
