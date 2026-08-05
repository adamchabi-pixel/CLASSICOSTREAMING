import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target_state = '''  const [adClicks, setAdClicks] = useState(() => {
    try {
      const saved = localStorage.getItem('classico_ad_clicks_' + movieId);
      if (saved) {
        const data = JSON.parse(saved);
        if (Date.now() - data.time < 4 * 60 * 60 * 1000) return data.clicks;
      }
    } catch(e) {}
    return 0;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('classico_ad_clicks_' + movieId);
      if (saved) {
        const data = JSON.parse(saved);
        if (Date.now() - data.time < 4 * 60 * 60 * 1000) {
          setAdClicks(data.clicks);
          return;
        }
      }
    } catch(e) {}
    setAdClicks(0);
  }, [movieId]);'''

replacement_state = '''  const [adClicks, setAdClicks] = useState(0);'''

target_bfcache = '''        // Sync adClicks in case it wasn't updated before BFCache snapshot
        try {
          const saved = localStorage.getItem('classico_ad_clicks_' + movieId);
          if (saved) {
            const data = JSON.parse(saved);
            if (Date.now() - data.time < 4 * 60 * 60 * 1000) {
              setAdClicks(data.clicks);
            }
          }
        } catch(e) {}'''
replacement_bfcache = ''''''

target_btn = '''            <a
              href="https://omg10.com/4/11192957"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                // target="_blank" évite le piège du bouton retour (redirect chain)
              }}
              className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
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

replacement_btn = '''            <a
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
            </a>'''


if target_state in content:
    content = content.replace(target_state, replacement_state)
else:
    print("State not found")

if target_bfcache in content:
    content = content.replace(target_bfcache, replacement_bfcache)
else:
    print("BFCache not found")

if target_btn in content:
    content = content.replace(target_btn, replacement_btn)
else:
    print("Btn not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
