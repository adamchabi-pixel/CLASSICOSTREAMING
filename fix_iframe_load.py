import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''            onLoad={() => {
              const isPeach = playbackInfo.iframeSrc?.includes('peachify.pro');
              const isCinemaos = playbackInfo.iframeSrc?.includes('cinemaos.live');
              if (!isPeach) {
                setIsIframeLoading(false);
              } else {
                // Safety timeout in case 'play' event never fires from Peachify
                
              }
            }}'''

replacement = '''            onLoad={() => {
              setIsIframeLoading(false);
            }}'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
