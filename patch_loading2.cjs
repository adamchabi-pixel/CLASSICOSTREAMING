const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target2 = `  if (!isAppReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.22em', textTransform: 'uppercase', lineHeight: 1, background: 'linear-gradient(to bottom right, #fcd34d 20%, #d97706 50%, #fcd34d 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CLASSICO
          </span>
        </div>
        <span style={{ display: 'block', fontSize: '14px', color: '#f4ecd8', lineHeight: 1, marginTop: '-1px', userSelect: 'none', textAlign: 'center', transform: 'translateX(-3px)', filter: 'drop-shadow(0 0 4px rgba(244,236,216,0.2))', fontStyle: 'italic' }}>
          The Best
        </span>
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px' }}>
          <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
          <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></div>
          <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></div>
        </div>
        <style>
          {\`
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
          \`}
        </style>
      </div>
    );
  }`;

const replacement2 = `  if (!isAppReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black select-none pointer-events-none">
        <div className="relative overflow-hidden flex items-center">
          <span className="font-cinzel font-bold text-[17px] sm:text-lg md:text-xl tracking-[0.22em] gold-metallic-text uppercase leading-none">
            CLASSICO
          </span>
        </div>
        <span className="block font-signature text-[10px] sm:text-[12px] md:text-[14px] text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-1px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
          The Best
        </span>
        <div className="flex gap-1.5 mt-8 items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }}></div>
        </div>
      </div>
    );
  }`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/App.tsx', content);
