const fs = require('fs');

function fixIndex() {
    let content = fs.readFileSync('index.html', 'utf8');
    
    // Just find the <style> and replace up to </style>
    const styleStart = content.indexOf('<style>');
    const styleEnd = content.indexOf('</style>') + 8;
    
    const newStyle = `<style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Pinyon+Script&display=swap');
          @keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }
          @media (min-width: 640px) {
             span:first-child { font-size: 2.25rem !important; }
             span:nth-child(2) { font-size: 1.5rem !important; margin-top:-4px !important; }
          }
          @media (min-width: 768px) {
             span:first-child { font-size: 3rem !important; }
             span:nth-child(2) { font-size: 1.875rem !important; margin-top:-4px !important; }
          }
        </style>`;
        
    content = content.substring(0, styleStart) + newStyle + content.substring(styleEnd);
    fs.writeFileSync('index.html', content);
}

function fixApp() {
    let content = fs.readFileSync('src/App.tsx', 'utf8');
    
    const styleStart = content.indexOf('<style>');
    const styleEnd = content.indexOf('</style>') + 8;
    
    const newStyle = `<style>
          {\`
            @keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }
          \`}
        </style>`;
        
    content = content.substring(0, styleStart) + newStyle + content.substring(styleEnd);
    fs.writeFileSync('src/App.tsx', content);
}

fixIndex();
fixApp();
