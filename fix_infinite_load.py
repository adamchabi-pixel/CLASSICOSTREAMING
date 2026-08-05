import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            setIsLoading(false);
            setIsStreamLoading(false);
            setIsIframeLoading(false);
            // Fallback timeout in case onLoad doesn't fire
            
            return;'''

replacement = '''            setIsLoading(false);
            setIsStreamLoading(false);
            setIsIframeLoading(false);
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex };
            return;'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
