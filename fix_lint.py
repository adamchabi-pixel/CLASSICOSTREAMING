import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Fix fallbackPath undefined
# Line 1285 might be using fallbackPath which is not defined in that scope.
# Let's find it.
match1 = re.search(r'const fallbackUrl = (.*?)\(.*?fallbackPath.*?\)', content)

# Fix ttfbTimeRef
# I should declare it where other refs are
if "ttfbTimeRef" not in content[:2000]:
    refs_insert = """  const isInitialAutoplayRef = useRef<boolean>(true);
  const rebufferStartTimeRef = useRef<number>(0);
  const fragLoadStartTimeRef = useRef<number>(0);
  const ttfbTimeRef = useRef<number>(0);"""
    content = content.replace("""  const isInitialAutoplayRef = useRef<boolean>(true);
  const rebufferStartTimeRef = useRef<number>(0);
  const fragLoadStartTimeRef = useRef<number>(0);""", refs_insert)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
