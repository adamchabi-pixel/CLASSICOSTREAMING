import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''<div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">'''
replacement = '''<div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Overlay not found")

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Done!")
