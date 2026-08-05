import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            <a
              href="https://omg10.com/4/11192957"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                setAdClicks(newVal);
              }}
              className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
            >
              <span>Click Ad</span>
            </a>'''

replacement = '''            <a
              href="https://omg10.com/4/11192957"
              target="_self"
              onClick={(e) => {
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                // No preventDefault, let the browser naturally navigate in the same tab
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
            >
              <span>Click Ad</span>
            </a>

            {/* Dev helper to reset clicks */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem('classico_ad_clicks_' + movieId);
                setAdClicks(0);
              }}
              className="text-zinc-600 hover:text-zinc-400 text-[10px] mt-2 underline"
            >
              Reset Ad Counter (Dev Test)
            </button>'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
