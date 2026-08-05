import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace " & " with " && " but be careful about existing " && ".
    # So we replace " & " with " && " except if it's already " && " or " &&& "
    # A simple regex for " & " not followed by "&" and not preceded by "&"
    content = re.sub(r'(?<!&)\s&\s(?!&)', ' && ', content)

    with open(filepath, 'w') as f:
        f.write(content)

fix_file('server.ts')
fix_file('src/components/CinemaPlayerView.tsx')
print("Fixed ampersands")
