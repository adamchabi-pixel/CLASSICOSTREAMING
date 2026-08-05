import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """    chosenPath?: string;
    subtitles?: {"""
replacement = """    chosenPath?: string;
    audios?: any[];
    subtitles?: {"""

if target in content:
    content = content.replace(target, replacement)
    print("Added audios to playbackInfo type")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
