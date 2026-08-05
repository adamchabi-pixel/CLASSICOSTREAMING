import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

pattern = r"const COLLECTIONS: Collection\[\] = \[\.\.\.RAW_COLLECTIONS\]\.sort\(\(a, b\) =>\s*a\.title\.localeCompare\(b\.title\)\);"
new_sort = """const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => {
  if (a.id === "trending-now") return -1;
  if (b.id === "trending-now") return 1;
  return a.title.localeCompare(b.title);
});"""

text = re.sub(pattern, new_sort, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
