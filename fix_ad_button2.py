import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            <button
              onClick={(e) => {
                e.preventDefault();
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                sessionStorage.setItem('returning_from_ad', 'true');
                
                // Set the state just in case it doesn't navigate instantly or for UI feedback
                setAdClicks(newVal);
                
                // Navigate in the same tab as originally requested
                window.location.assign("https://omg10.com/4/11192957");
              }}'''

replacement = '''            <button
              onClick={(e) => {
                e.preventDefault();
                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                
                setAdClicks(newVal);
                
                // Navigate in a new tab to avoid back-button traps and white screens
                const a = document.createElement('a');
                a.href = "https://omg10.com/4/11192957";
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
