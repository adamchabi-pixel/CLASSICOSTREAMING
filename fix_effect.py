import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

old_effect = '''  useEffect(() => {
    const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
    setAdClicks(saved ? parseInt(saved, 10) : 0);

    return () => {
      if (sessionStorage.getItem('returning_from_ad') !== 'true') {
        sessionStorage.removeItem('classico_ad_clicks_' + movieId);
      }
    };
  }, [movieId]);'''

new_effect = '''  useEffect(() => {
    const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
    setAdClicks(saved ? parseInt(saved, 10) : 0);
    
    // Clear the flag so that if the user leaves normally, it cleans up
    sessionStorage.removeItem('returning_from_ad');

    return () => {
      if (sessionStorage.getItem('returning_from_ad') !== 'true') {
        sessionStorage.removeItem('classico_ad_clicks_' + movieId);
      }
    };
  }, [movieId]);'''

content = content.replace(old_effect, new_effect)
with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Done!")
