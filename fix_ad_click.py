import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# 1. Remove the window.open override
target_override = '''    const originalWindowOpen = window.open;
    window.open = function() {
      return null;
    } as any;'''

if target_override in content:
    content = content.replace(target_override, '''    // window.open override removed because iframe sandbox handles it''')
    print("Removed window.open override")


target_return = '''    return () => {
      window.open = originalWindowOpen;
      if (rootElement) {'''

if target_return in content:
    content = content.replace(target_return, '''    return () => {
      if (rootElement) {''')
    print("Removed window.open restore")

# 2. Fix the ad click logic
target_ad = '''            <a
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

replacement_ad = '''            <a
              href="https://omg10.com/4/11192957"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault(); // Prevent default to avoid mobile tab replacement
                const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (!isMobileDevice) {
                  // Only try to open the ad on desktop to preserve the AI studio mobile preview tab
                  try { window.open("https://omg10.com/4/11192957", "_blank"); } catch(e) {}
                }
                const newVal = adClicks + 1;
                setAdClicks(newVal);
              }}
              className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
            >
              <span>Click Ad</span>
            </a>'''

if target_ad in content:
    content = content.replace(target_ad, replacement_ad)
    print("Fixed ad click logic")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Done")
