import sys

with open("src/App.tsx", "r") as f:
    content = f.read()

start_marker = "{/* Key Icon for Admin Unlock */}"
end_marker = "{/* Film Library & Watchlists */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Also find the closing ')}' just before end_marker if we need, but we can just slice from start_idx to end_idx.
    # Actually wait, let's just do a string replacement.
    block = content[start_idx:end_idx]
    
    # Let's ensure there are no stray tags. The block ends with:
    # }
    #                 )}
    #                 
    
    content = content[:start_idx] + content[end_idx:]
    
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Markers not found.")
