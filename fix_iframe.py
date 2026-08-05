import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace(
    'const [isIframeLoading, setIsIframeLoading] = useState(true);',
    'const [isIframeLoading, setIsIframeLoading] = useState(true);\n  const [iframeKey, setIframeKey] = useState(0);'
)

# Replace iframe key
content = content.replace(
    'key={playbackInfo.iframeSrc}',
    'key={`${playbackInfo.iframeSrc}-${iframeKey}`}'
)

# Update server select clicks (both places)
# 1. Main list
content = content.replace(
    'setIsIframeLoading(true);\n                }}',
    'setIsIframeLoading(true);\n                  setIframeKey(prev => prev + 1);\n                }}'
)

# 2. Dropdown menu list
content = content.replace(
    'setIsIframeLoading(true);\n                          setShowServerMenu(false);\n                        }}',
    'setIsIframeLoading(true);\n                          setIframeKey(prev => prev + 1);\n                          setShowServerMenu(false);\n                        }}'
)

# Also fix the setPlaybackInfo(null as any) issue when clicking back on loader
content = content.replace(
    'setShowServerMenu(true);\n            setPlaybackInfo(null as any);\n          }}',
    'setShowServerMenu(true);\n          }}'
)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)

print("Done!")
