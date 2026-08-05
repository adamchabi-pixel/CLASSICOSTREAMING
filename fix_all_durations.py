import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

content = content.replace("video.duration", "video?.duration || 0")
content = content.replace("e.currentTarget.duration", "e.currentTarget?.duration || 0")
content = content.replace("playbackInfo.duration", "playbackInfo?.duration || 0")
content = content.replace("data.duration", "data?.duration || 0")
content = content.replace("itemData.RunTimeTicks / 10000000", "itemData?.RunTimeTicks / 10000000")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Fixed all duration reads")
