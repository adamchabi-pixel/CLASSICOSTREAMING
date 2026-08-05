import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """      if (changed) {
        let newUrl = "";"""
replacement = """      if (changed) {
        urlObj.searchParams.set("PlaySessionId", Date.now().toString());
        let newUrl = "";"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched changed block")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target2 = """      // Set Audio Track if specified
      if (audioIndex !== null) {
        urlObj.searchParams.set("AudioStreamIndex", audioIndex.toString());
      }"""
replacement2 = """      // Set Audio Track if specified
      if (audioIndex !== null) {
        urlObj.searchParams.set("AudioStreamIndex", audioIndex.toString());
        urlObj.searchParams.set("PlaySessionId", Date.now().toString());
      }"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Patched VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
