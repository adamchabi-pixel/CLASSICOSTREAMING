const fs = require('fs');

function fixHtml() {
    let content = fs.readFileSync('index.html', 'utf8');
    content = content.replace(/@keyframes illuminate \{.*?\}/s, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }');
    // Let's make sure there is no trailing stuff
    content = content.replace(/@keyframes illuminate \{[^\}]+\} 50% \{[^\}]+\} \}/s, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }');
    // Let's just do a simpler search and replace for that exact string
    content = content.replace("@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } } 50% { opacity: 1; transform: scale(1.2); } }", "@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }");
    fs.writeFileSync('index.html', content);
}
fixHtml();

function fixApp() {
    let content = fs.readFileSync('src/App.tsx', 'utf8');
    content = content.replace("@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } } 50% { opacity: 1; transform: scale(1.2); } }", "@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }");
    fs.writeFileSync('src/App.tsx', content);
}
fixApp();
