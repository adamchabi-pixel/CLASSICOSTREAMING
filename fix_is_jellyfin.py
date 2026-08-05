import re

with open('server.ts', 'r') as f:
    text = f.read()

# Replace formatJellyfinItem to include isJellyfin
old_format = r'''  return \{
    id: item\.Id,
    title: item\.Name \|\| "Untitled Movie",'''

new_format = '''  return {
    isJellyfin: true,
    id: item.Id,
    title: item.Name || "Untitled Movie",'''

text = re.sub(old_format, new_format, text)

# Also, the user complained that description and cast were missing for newly fetched jellyfin films (like White Chicks).
# wait, we found out they were actually returned! But why didn't they render?
# Let's check if the frontend overrides it in App.tsx.

with open('server.ts', 'w') as f:
    f.write(text)
