import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

start_marker = "{/* Return back to details view - Visible only for administrator */}"
end_marker = "Playback Info\n              </button>\n            )}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) + len(end_marker)
    content = content[:start_idx] + content[end_idx:]
    print("Removed Admin Playback Info button from VideoPlayer")
else:
    print("Could not find start or end marker")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
