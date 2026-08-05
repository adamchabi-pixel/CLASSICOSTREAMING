import os

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = '''      // Fallback for static deployments
      const tmdbToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
      try {
        const res = await fetch('/api/trending');
        if (res.ok) {
          const m = await res.json();
          if (m.results) {'''

replacement = '''      // Fallback for static deployments
      const tmdbToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
      try {
        const res = await fetch('https://api.tmdb.org/3/trending/all/day?language=en-US', {
            headers: {
                "Authorization": `Bearer ${tmdbToken}`,
                "Accept": "application/json"
            }
        });
        if (res.ok) {
          const m = await res.json();
          if (m.results) {'''

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print('Done!')
