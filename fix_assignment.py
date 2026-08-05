import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

content = content.replace("data?.duration || 0 = Math.round", "data.duration = Math.round")
content = content.replace("data?.duration || 0 = Math.round(itemData?.RunTimeTicks / 10000000)", "data.duration = Math.round(itemData?.RunTimeTicks / 10000000)")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Fixed assignment")
