import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = "Don't click anything on the ads, just click on the X."
replacement = "Don't click anything on the ads, just click on the X or change the tab."

if target in content:
    content = content.replace(target, replacement)
    print("Text updated successfully.")
else:
    print("Target text not found.")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
