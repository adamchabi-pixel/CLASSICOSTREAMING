import re
import json

with open('src/data.ts', 'r') as f:
    text = f.read()

# Remove Devil Wears Prada 2
prada = re.search(r'\{\s*id:\s*"devil-wears-prada-2".*?\},', text, re.DOTALL)
if prada:
    text = text.replace(prada.group(0), '')

# Remove John Wick Collection
john_wick = re.search(r'\{\s*id:\s*"john-wick",.*?\}\s*\]\s*\},', text, re.DOTALL)
if john_wick:
    text = text.replace(john_wick.group(0), '')

# Remove Fast and Furious Collection
fast = re.search(r'\{\s*id:\s*"fast-and-furious",.*?\}\s*\]\s*\},', text, re.DOTALL)
if fast:
    text = text.replace(fast.group(0), '')

# Remove Batman Begins from Christopher Nolan
batman_begins = re.search(r'\{\s*id:\s*"batman-begins".*?\},', text, re.DOTALL)
while batman_begins:
    text = text.replace(batman_begins.group(0), '')
    batman_begins = re.search(r'\{\s*id:\s*"batman-begins".*?\},', text, re.DOTALL)

# Let's fix the posters for Best Comedy Gold
# We will inject some posters in data.ts for them
posters = {
    "21-jump-street": "https://image.tmdb.org/t/p/w500/q3UeqQ2I3L1m6K0rL6W3d8wP9E1.jpg",
    "22-jump-street": "https://image.tmdb.org/t/p/w500/40wV3Y8JbT97U0oF9R5TiyA4LqA.jpg",
    "superbad": "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2VNqjv6V1W1J3iA.jpg",
    "grown-ups": "https://image.tmdb.org/t/p/w500/q7k7eJ7ZkYk5E9Zf8D4bZ6fP6O5.jpg",
    "white-chicks": "https://image.tmdb.org/t/p/w500/vXvU2wB5T7u2i6E5F8M4b0u4Q5Q.jpg",
    "memories-of-murder": "https://image.tmdb.org/t/p/w500/q3uYq9b2z3GZq2D5O9E5Q8O5O5O.jpg"
}

for movie_id, poster_url in posters.items():
    # find the movie block
    pattern = r'(\{\s*id:\s*"' + movie_id + r'".*?title:\s*".*?",)'
    replacement = r'\1\n        posterUrl: "' + poster_url + '",'
    text = re.sub(pattern, replacement, text, count=1, flags=re.DOTALL)

with open('src/data.ts', 'w') as f:
    f.write(text)
