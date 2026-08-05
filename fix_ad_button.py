import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            <a
              href="https://omg10.com/4/11192957"
              target="_self"
              onClick={(e) => {
                const newVal = adClicks + 1;
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
                
                // Delay state update to allow the browser to process the native navigation first.
                // If we unmount immediately, some browsers cancel the navigation.
                setTimeout(() => {
                  setAdClicks(newVal);
                }, 300);
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >
              <span>Click Ad</span>
            </a>'''

replacement = '''            <button
              onClick={(e) => {
                e.preventDefault();
                const newVal = adClicks + 1;
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
                
                // Set the state just in case it doesn't navigate instantly or for UI feedback
                setAdClicks(newVal);
                
                // Navigate in the same tab as originally requested
                window.location.assign("https://omg10.com/4/11192957");
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >
              <span>Click Ad</span>
            </button>'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
