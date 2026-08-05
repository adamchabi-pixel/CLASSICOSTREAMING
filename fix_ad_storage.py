import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target_init = '''  const [adClicks, setAdClicks] = useState(() => {
    const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
    setAdClicks(saved ? parseInt(saved, 10) : 0);

    return () => {
        // Removed cleanup to persist ad clicks during session
    };
  }, [movieId]);'''

replacement_init = '''  const [adClicks, setAdClicks] = useState(() => {
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

target_bfcache = '''        // Sync adClicks in case it wasn't updated before BFCache snapshot
        const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
        if (saved) {
            setAdClicks(parseInt(saved, 10));
        }'''

replacement_bfcache = '''        // Sync adClicks in case it wasn't updated before BFCache snapshot
        try {
          const saved = localStorage.getItem('classico_ad_clicks_' + movieId);
          if (saved) {
            const data = JSON.parse(saved);
            if (Date.now() - data.time < 4 * 60 * 60 * 1000) {
              setAdClicks(data.clicks);
            }
          }
        } catch(e) {}'''

target_click = '''                const newVal = adClicks + 1;
                sessionStorage.setItem('classico_ad_clicks_' + movieId, String(newVal));
                sessionStorage.setItem('returning_from_ad', 'true');'''

replacement_click = '''                const newVal = adClicks + 1;
                localStorage.setItem('classico_ad_clicks_' + movieId, JSON.stringify({ clicks: newVal, time: Date.now() }));
                sessionStorage.setItem('returning_from_ad', 'true');'''

if target_init in content:
    content = content.replace(target_init, replacement_init)
else:
    print("Init not found")

if target_bfcache in content:
    content = content.replace(target_bfcache, replacement_bfcache)
else:
    print("BFCache not found")

if target_click in content:
    content = content.replace(target_click, replacement_click)
else:
    print("Click not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
