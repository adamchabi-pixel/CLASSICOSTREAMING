with open("src/App.tsx", "r") as f:
    text = f.read()

import re
# Remove the AnimatePresence block that contains the Notice
pattern = r'<AnimatePresence>\s*\{showBanner && \([\s\S]*?Notice: The site is currently under construction[\s\S]*?\}\s*</AnimatePresence>'
text = re.sub(pattern, '', text)

# Also remove showBanner state if possible
text = re.sub(r'const \[showBanner, setShowBanner\] = useState\(true\);\s*', '', text)

with open("src/App.tsx", "w") as f:
    f.write(text)
