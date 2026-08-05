import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# 1. Fix iframe mounting so it only mounts when adClicks >= 3
old_iframe_block = '''      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <iframe'''

new_iframe_block = '''      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc && adClicks >= 3 ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pointer-events-auto opacity-100`}>
          <iframe'''

if old_iframe_block in content:
    content = content.replace(old_iframe_block, new_iframe_block)
else:
    print("Could not find old iframe block!")

# 2. Fix ad button to prevent double-click / history trap
old_ad_link = '''            <a
              href="https://omg10.com/4/11192957"
              onClick={(e) => {
                const newVal = adClicks + 1;
                setAdClicks(newVal);
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >
              <span>Click Ad</span>
            </a>'''

new_ad_link = '''            <button
              onClick={(e) => {
                e.preventDefault();
                if (e.currentTarget.disabled) return;
                e.currentTarget.disabled = true;
                const newVal = adClicks + 1;
                setAdClicks(newVal);
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
                window.location.assign("https://omg10.com/4/11192957");
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              <span>Click Ad</span>
            </button>'''

if old_ad_link in content:
    content = content.replace(old_ad_link, new_ad_link)
else:
    print("Could not find old ad link!")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
