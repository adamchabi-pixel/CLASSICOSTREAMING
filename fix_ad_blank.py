import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            <a
              href="https://omg10.com/4/11192957"
              target="_self"
              onClick={(e) => {
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                // No preventDefault, let the browser naturally navigate in the same tab
              }}'''

replacement = '''            <a
              href="https://omg10.com/4/11192957"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                // target="_blank" évite le piège du bouton retour (redirect chain)
              }}'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
