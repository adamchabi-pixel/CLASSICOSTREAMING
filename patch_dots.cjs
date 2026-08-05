const fs = require('fs');

// Patch index.html
let indexContent = fs.readFileSync('index.html', 'utf8');

const indexTargetDots = `<div style="display:flex;gap:8px;margin-top:32px;">
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;animation-delay:0.15s;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;animation-delay:0.3s;"></div>
        </div>`;

const indexReplacementDots = `<div style="display:flex;gap:8px;margin-top:32px;">
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1.5s infinite both;animation-delay:0ms;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1.5s infinite both;animation-delay:300ms;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:illuminate 1.5s infinite both;animation-delay:600ms;"></div>
        </div>`;

indexContent = indexContent.replace(indexTargetDots, indexReplacementDots);

const indexTargetKeyframes = `@keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); opacity: 0.5; } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); opacity: 1; } }`;
const indexReplacementKeyframes = `@keyframes illuminate { 0%, 100% { opacity: 0.2; box-shadow: none; } 50% { opacity: 1; box-shadow: 0 0 10px rgba(252, 246, 186, 0.8); background-color: #fcf6ba; } }`;

indexContent = indexContent.replace(indexTargetKeyframes, indexReplacementKeyframes);
fs.writeFileSync('index.html', indexContent);


// Patch src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const appTargetDots = `<div className="flex gap-2 mt-8 items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }}></div>
        </div>`;

const appReplacementDots = `<div className="flex gap-2 mt-8 items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#bf953f]" style={{ animation: "illuminate 1.5s infinite both", animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f]" style={{ animation: "illuminate 1.5s infinite both", animationDelay: "300ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f]" style={{ animation: "illuminate 1.5s infinite both", animationDelay: "600ms" }}></div>
        </div>
        <style>
          {\`
            @keyframes illuminate {
              0%, 100% { opacity: 0.2; box-shadow: none; }
              50% { opacity: 1; box-shadow: 0 0 10px rgba(252, 246, 186, 0.8); background-color: #fcf6ba; }
            }
          \`}
        </style>`;

appContent = appContent.replace(appTargetDots, appReplacementDots);
fs.writeFileSync('src/App.tsx', appContent);
