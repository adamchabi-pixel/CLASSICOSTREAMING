const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background-color:#000;pointer-events:none;user-select:none;">
        <div style="position:relative;overflow:hidden;display:flex;align-items:center;">
          <span style="font-family:'Cinzel',serif;font-weight:700;font-size:17px;letter-spacing:0.22em;text-transform:uppercase;line-height:1;background:linear-gradient(135deg, #bf953f 0%, #fcf6ba 15%, #b38728 35%, #fbf5b7 55%, #aa771c 75%, #fcf6ba 90%, #bf953f 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0px 1px 2px rgba(0,0,0,0.5);">
            CLASSICO
          </span>
        </div>
        <span style="font-family:'Pinyon Script',cursive;display:block;font-size:10px;color:#f4ecd8;line-height:1;margin-top:-2px;user-select:none;text-align:center;transform:translateX(-3px);filter:drop-shadow(0 0 4px rgba(244,236,216,0.2));">
          The Best
        </span>
        <div style="display:flex;gap:6px;margin-top:32px;">
          <div style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1s infinite ease-in-out both;"></div>
          <div style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1s infinite ease-in-out both;animation-delay:0.15s;"></div>
          <div style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1s infinite ease-in-out both;animation-delay:0.3s;"></div>
        </div>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Pinyon+Script&display=swap');
          @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); opacity: 0.5; } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); opacity: 1; } }
          @media (min-width: 640px) {
             span:first-child { font-size: 1.125rem !important; }
             span:nth-child(2) { font-size: 12px !important; margin-top:-1px !important; }
          }
          @media (min-width: 768px) {
             span:first-child { font-size: 1.25rem !important; }
             span:nth-child(2) { font-size: 14px !important; }
          }
        </style>
      </div>`;

const replacement = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background-color:#000;pointer-events:none;user-select:none;">
        <div style="position:relative;overflow:hidden;display:flex;align-items:center;">
          <span style="font-family:'Cinzel',serif;font-weight:700;font-size:1.875rem;letter-spacing:0.22em;text-transform:uppercase;line-height:1;background:linear-gradient(135deg, #bf953f 0%, #fcf6ba 15%, #b38728 35%, #fbf5b7 55%, #aa771c 75%, #fcf6ba 90%, #bf953f 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            CLASSICO
          </span>
        </div>
        <span style="font-family:'Pinyon Script',cursive;display:block;font-size:1.25rem;color:#f4ecd8;line-height:1;margin-top:-2px;user-select:none;text-align:center;transform:translateX(-3px);filter:drop-shadow(0 0 4px rgba(244,236,216,0.2));">
          The Best
        </span>
        <div style="display:flex;gap:8px;margin-top:32px;">
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;animation-delay:0.15s;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background-color:#bf953f;animation:bounce 1s infinite ease-in-out both;animation-delay:0.3s;"></div>
        </div>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Pinyon+Script&display=swap');
          @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); opacity: 0.5; } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); opacity: 1; } }
          @media (min-width: 640px) {
             span:first-child { font-size: 2.25rem !important; }
             span:nth-child(2) { font-size: 1.5rem !important; margin-top:-4px !important; }
          }
          @media (min-width: 768px) {
             span:first-child { font-size: 3rem !important; }
             span:nth-child(2) { font-size: 1.875rem !important; margin-top:-4px !important; }
          }
        </style>
      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('index.html', content);
