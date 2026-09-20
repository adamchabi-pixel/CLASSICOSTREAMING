const fs = require('fs');

let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// Add the backdrop
const replacement1 = `  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-stone-100 flex flex-col select-none relative animate-in fade-in duration-300">
      
      {/* Background Backdrop with Gradient */}
      {movieBackdrop && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={movieBackdrop} alt="" className="w-full h-[60vh] object-cover opacity-[0.15] mask-image-gradient" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }} />
        </div>
      )}`;

content = content.replace(
  `  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-stone-100 flex flex-col select-none relative animate-in fade-in duration-300">`,
  replacement1
);

// Remove headers borders for Cast
content = content.replace(
  `            <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest border-b border-white/5 pb-3">
              Casting Principal
            </h3>`,
  `            <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest pb-1">
              Casting Principal
            </h3>`
);

// Remove header border for Sources
content = content.replace(
  `            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">`,
  `            <div className="flex items-center justify-between pb-1">
              <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
