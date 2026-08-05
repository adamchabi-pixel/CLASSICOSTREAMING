import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

content = content.replace("maxBufferLength: 30,", "maxBufferLength: 60,")
content = content.replace("maxMaxBufferLength: 60,", "maxMaxBufferLength: 120,")
content = content.replace("maxBufferSize: 60 * 1024 * 1024,", "maxBufferSize: 120 * 1024 * 1024,")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Modified buffer lengths")
