const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We will change the dots to have the bright glow natively, and just animate opacity/scale
    // Let's replace the inline styles and keyframes
    
    // Replace in index.html
    if (filePath === 'index.html') {
        content = content.replace(/<div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1\.5s infinite;animation-delay:0s;"><\/div>/g, '<div style="width:8px;height:8px;border-radius:50%;background-color:#fcf6ba;box-shadow:0 0 10px rgba(252,246,186,0.8);animation:illuminate 1.5s infinite ease-in-out;animation-delay:0s;"></div>');
        content = content.replace(/<div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1\.5s infinite;animation-delay:0\.2s;"><\/div>/g, '<div style="width:8px;height:8px;border-radius:50%;background-color:#fcf6ba;box-shadow:0 0 10px rgba(252,246,186,0.8);animation:illuminate 1.5s infinite ease-in-out;animation-delay:0.2s;"></div>');
        content = content.replace(/<div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1\.5s infinite;animation-delay:0\.4s;"><\/div>/g, '<div style="width:8px;height:8px;border-radius:50%;background-color:#fcf6ba;box-shadow:0 0 10px rgba(252,246,186,0.8);animation:illuminate 1.5s infinite ease-in-out;animation-delay:0.4s;"></div>');
        
        content = content.replace(/@keyframes illuminate \{[^\}]+\}/, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }');
    }
    
    // Replace in App.tsx
    if (filePath === 'src/App.tsx') {
        content = content.replace(/<div className="w-2 h-2 rounded-full bg-\[#bf953f\]" style=\{\{ animation: "illuminate 1\.5s infinite", animationDelay: "0s" \}\}><\/div>/g, '<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out", animationDelay: "0s" }}></div>');
        content = content.replace(/<div className="w-2 h-2 rounded-full bg-\[#bf953f\]" style=\{\{ animation: "illuminate 1\.5s infinite", animationDelay: "0\.2s" \}\}><\/div>/g, '<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out", animationDelay: "0.2s" }}></div>');
        content = content.replace(/<div className="w-2 h-2 rounded-full bg-\[#bf953f\]" style=\{\{ animation: "illuminate 1\.5s infinite", animationDelay: "0\.4s" \}\}><\/div>/g, '<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out", animationDelay: "0.4s" }}></div>');
        
        content = content.replace(/@keyframes illuminate \{[^\}]+\}/, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }');
    }
    
    fs.writeFileSync(filePath, content);
}

patchFile('index.html');
patchFile('src/App.tsx');
