import os
import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# We need to remove the old AdGate block from the main return
target = """      {/* AdGate Overlay */}
      {adClicks < 3 && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-700/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-amber-500 mb-4 font-forum tracking-wide">Support Classico</h2>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              Classico is free and will stay that way, but our servers cost a lot to maintain. The only way we can compensate is by including three ads per movie.
              <br /><br />
              <strong className="text-white">Please disable your ad-blocker to support us.</strong> Thank you immensely!
            </p>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 w-full mb-6">
              <p className="text-rose-400 text-xs font-mono uppercase tracking-wider">
                Don't click anything on the ads, just click on the X.
              </p>
            </div>
            
            <a
              href="https://omg10.com/4/11192957"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                const newVal = adClicks + 1;
                setAdClicks(newVal);
              }}
              className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
            >
              <span>Click Ad</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Progress</span>
              <span className="text-amber-500 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded">{adClicks}/3</span>
            </div>
          </div>
          
          <button
            onClick={handleClosePlayer}
            className="absolute top-6 left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      )}"""

if target in content:
    content = content.replace(target, '')
    with open('src/components/CinemaPlayerView.tsx', 'w') as f:
        f.write(content)
    print("Old ad removed")
else:
    print("Old ad not found")

