import os

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    content = f.read()

target = '''<div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">'''
replacement = '''<div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Overlay not found")

# also let's change the iframe opacity just in case
target_iframe = '''<div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pointer-events-auto opacity-100`}>'''
replacement_iframe = '''<div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>'''

if target_iframe in content:
    content = content.replace(target_iframe, replacement_iframe)
else:
    print("Iframe wrapper not found")

target_video = '''<div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pointer-events-auto opacity-100`} ref={viewportRef}>'''
replacement_video = '''<div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} ref={viewportRef}>'''

if target_video in content:
    content = content.replace(target_video, replacement_video)
else:
    print("Video wrapper not found")


with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(content)
print("Done!")
