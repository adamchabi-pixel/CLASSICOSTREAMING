import re

with open("src/App.tsx", "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* RECENTLY VIEWED SECTION */}" in line:
        start_idx = i
    if "THEMATIC LIBRARY" in line and start_idx != -1 and end_idx == -1:
        # The block ends just before `<div className="text-left py-1 select-none">` which is above THEMATIC LIBRARY
        # Let's find the closing `)}` of the recently viewed block
        # Actually it's easier: line 2014 is `                )}`
        pass

for i in range(start_idx, len(lines)):
    if "                )}" in lines[i]:
        # Wait, there are multiple `)}`
        if i > start_idx + 10:
            end_idx = i
            break

print("Start:", start_idx, "End:", end_idx)

recently_viewed_lines = lines[start_idx:end_idx+1]
del lines[start_idx:end_idx+1]

# Modify colors in recently_viewed_lines
for i in range(len(recently_viewed_lines)):
    recently_viewed_lines[i] = recently_viewed_lines[i].replace(
        'className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"',
        'className="h-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"'
    )
    recently_viewed_lines[i] = recently_viewed_lines[i].replace(
        '<History className="w-5 h-5 text-amber-500" />',
        '<History className="w-5 h-5 text-[#D4AF37]" />'
    )
    recently_viewed_lines[i] = recently_viewed_lines[i].replace(
        'bg-amber-500/90 text-zinc-950',
        'bg-[#D4AF37]/90 text-zinc-950'
    )
    recently_viewed_lines[i] = recently_viewed_lines[i].replace(
        'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
        'shadow-[0_0_15px_rgba(212,175,55,0.5)]'
    )

# Now find where to insert it: right before {/* Collections Segment block - Horizontal Carousels grouped by Collection */}
insert_idx = -1
for i, line in enumerate(lines):
    if "{/* Collections Segment block - Horizontal Carousels grouped by Collection */}" in line:
        insert_idx = i
        break

if insert_idx != -1:
    # Let's wrap it in the max-w-7xl mx-auto container if it isn't already.
    # Currently it's just a div. The Collections Segment block has its own container.
    # Let's add the container so it's aligned properly.
    container_start = ['              <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">\n']
    container_end = ['              </div>\n']
    
    lines = lines[:insert_idx] + container_start + recently_viewed_lines + container_end + lines[insert_idx:]
    print("Moved successfully!")
else:
    print("Could not find insert point")

with open("src/App.tsx", "w") as f:
    f.writelines(lines)
