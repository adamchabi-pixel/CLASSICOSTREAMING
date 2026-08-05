import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

old_ad_link = '''            <a
              href="https://omg10.com/4/11192957"
              target="_self"
              onClick={() => {
                const newVal = adClicks + 1;
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
                setAdClicks(newVal);
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >'''

new_ad_link = '''            <a
              href="https://omg10.com/4/11192957"
              target="_self"
              onClick={(e) => {
                const newVal = adClicks + 1;
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');
                // Do NOT call setAdClicks(newVal) here. 
                // If we do, React unmounts this <a> tag instantly, which cancels the browser's native navigation in some cases.
                // By just letting the <a> tag navigate normally, it will work. 
                // When the user clicks BACK, the component will mount and read the new value from sessionStorage!
                
                // Fallback programmatic navigation just in case
                setTimeout(() => {
                  window.location.href = "https://omg10.com/4/11192957";
                }, 100);
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >'''

if old_ad_link in content:
    content = content.replace(old_ad_link, new_ad_link)
else:
    print("Could not find old ad link!")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
