import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# Make sure prominent-subtitle-btn is visible on mobile too
target = """<div className="relative border-l border-zinc-850 pl-4 hidden sm:block">
                <button
                  id="prominent-subtitle-btn\""""

replacement = """<div className="relative border-l border-zinc-850 pl-2 sm:pl-4">
                <button
                  id="prominent-subtitle-btn\""""

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND IN VIDEOPLAYER")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
