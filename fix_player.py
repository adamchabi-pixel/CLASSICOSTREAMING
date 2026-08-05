with open('src/App.tsx', 'r') as f:
    text = f.read()

import re

# Remove the VideoPlayer block
pattern = re.compile(r'    if \(activeMovie && !activeMovie\.isJellyfin\) \{\s*return \(\s*<div className="fixed inset-0 z-50 bg-black w-screen h-screen flex flex-col">\s*<VideoPlayer\s*streamUrl=\{activeMovie\.streamUrl \|\| null\}\s*movieTitle=\{activeMovie\.title\}\s*movieSymbol=\{activeMovie\.symbol\}\s*movieGradient=\{activeMovie\.gradient\}\s*movieDuration=\{activeMovie\.duration\}\s*onCloseView=\{.*?\}\s*movieId=\{pId\}\s*isJellyfinMovie=\{false\}\s*\/>\s*<\/div>\s*\);\s*\}', re.DOTALL)

text = pattern.sub('', text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
