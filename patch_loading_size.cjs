const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target2 = `  if (!isAppReady) {
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

const replacement2 = `  if (!isAppReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black select-none pointer-events-none">
        <div className="relative overflow-hidden flex items-center">
          <span className="font-cinzel font-bold text-3xl sm:text-4xl md:text-5xl tracking-[0.22em] gold-metallic-text uppercase leading-none">
            CLASSICO
          </span>
        </div>
        <span className="block font-signature text-xl sm:text-2xl md:text-3xl text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-4px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
          The Best
        </span>
        <div className="flex gap-2 mt-8 items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#bf953f] animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }}></div>
        </div>
      </div>
    );
  }`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/App.tsx', content);
