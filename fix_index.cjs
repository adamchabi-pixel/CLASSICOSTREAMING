const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/@keyframes illuminate \{.*?\n.*?\}\s*\}/s, '@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }');
// Let's just do a string replace, safer
content = content.replace("@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } } 30% { opacity: 1; box-shadow: 0 0 10px rgba(252, 246, 186, 0.8); background-color: #fcf6ba; } }", "@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }");
fs.writeFileSync('index.html', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace("@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }\n              30% { opacity: 1; box-shadow: 0 0 10px rgba(252, 246, 186, 0.8); background-color: #fcf6ba; }\n            }", "@keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }");
fs.writeFileSync('src/App.tsx', appContent);
