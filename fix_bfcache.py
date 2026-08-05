import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Change iframeKey initialization to avoid BFCache issues for iframes
old_key = 'const [iframeKey, setIframeKey] = useState(0);'
new_key = 'const [iframeKey, setIframeKey] = useState(() => Date.now());'

if old_key in content:
    content = content.replace(old_key, new_key)
else:
    print("Could not find old iframeKey!")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print('Done!')
