with open('src/components/VideoPlayer.tsx', 'r') as f:
    text = f.read()

import re

# Find the block and remove it
pattern = re.compile(r'        \{\/\* Secure premium audio feedback diagnostics bar \*\/}.*?        \)}', re.DOTALL)
text = pattern.sub('', text)

with open('src/components/VideoPlayer.tsx', 'w') as f:
    f.write(text)
