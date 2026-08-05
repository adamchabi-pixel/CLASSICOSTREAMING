import urllib.request
import json
import urllib.parse

TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs"

headers = {
    "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}",
    "Accept": "application/json"
}

def fetch_json(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def search_movie(query):
    url = f"https://api.tmdb.org/3/search/movie?query={urllib.parse.quote(query)}&include_adult=false&language=en-US&page=1"
    res = fetch_json(url)
    if res.get("results"):
        return res["results"][0]
    return None

def get_movie_details(movie_id):
    url = f"https://api.tmdb.org/3/movie/{movie_id}?append_to_response=credits,images&include_image_language=en,null&language=en-US"
    return fetch_json(url)

movies_to_search = ["Spider-Man: Brand New Day", "Aang: The Last Airbender", "The Odyssey", "Moana", "Supergirl"]
results = []

for q in movies_to_search:
    m = search_movie(q)
    if m:
        details = get_movie_details(m["id"])
        results.append(details)

with open("search_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done")
