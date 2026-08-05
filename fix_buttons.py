import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Remove the Audio and Subtitle buttons from the left side
left_side_regex = re.compile(r'            \{\/\* Audio Button \*\/\}.*?<\/div>\s*<\/div>\s*\{\/\* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN \*\/\}', re.DOTALL)
if left_side_regex.search(content):
    content = left_side_regex.sub('          </div>\n          {/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}', content)
    print("Removed Audio/Subtitle buttons from left side")
else:
    print("Could not find Audio/Subtitle buttons")

# Remove the Info button from RIGHT SIDE
info_btn_regex = re.compile(r'            \{\/\* Playback Info Button.*?<\/button>\s*\}\s*', re.DOTALL)
if info_btn_regex.search(content):
    content = info_btn_regex.sub('', content)
    print("Removed Info button")
else:
    print("Could not find Info button")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
