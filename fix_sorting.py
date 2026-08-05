import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_sort = """const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => 
  a.title.localeCompare(b.title));"""

new_sort = """const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => {
  if (a.id === "trending-now") return -1;
  if (b.id === "trending-now") return 1;
  return a.title.localeCompare(b.title);
});"""

text = text.replace(old_sort, new_sort)

with open('src/App.tsx', 'w') as f:
    f.write(text)
