import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target_effect = '''  // Fix BFCache and infinite loader issues when returning from ads
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || sessionStorage.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
        setIsStreamLoading(false);
        setIsLoading(false);
        setIframeKey(Date.now());
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    // Also run it on mount just in case we missed the event
    if (sessionStorage.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
    }
    
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);'''

new_effect = '''  // Fix BFCache and infinite loader issues when returning from ads
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || sessionStorage.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
        setIsStreamLoading(false);
        setIsLoading(false);
        setIframeKey(Date.now());
        
        // Sync adClicks in case it wasn't updated before BFCache snapshot
        const saved = sessionStorage.getItem('classico_ad_clicks_' + movieId);
        if (saved) {
            setAdClicks(parseInt(saved, 10));
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    // Also run it on mount just in case we missed the event
    if (sessionStorage.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
    }
    
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [movieId]);'''

if target_effect in content:
    content = content.replace(target_effect, new_effect)
else:
    print("Could not find target effect!")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
