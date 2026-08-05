import urllib.request
import json
import urllib.parse
import os

TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs"
headers = { "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}", "Accept": "application/json" }

def fetch_json(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print("Error fetching", url, e)
        return None

tmdb_ids = [969681, 980431, 1368337, 1108427, 1081003]
heroes = []

for tmdb_id in tmdb_ids:
    details = fetch_json(f"https://api.tmdb.org/3/movie/{tmdb_id}?append_to_response=credits,images&include_image_language=en,null&language=en-US")
    
    # get logo
    logoUrl = ""
    hasLogo = False
    images = details.get("images", {})
    logos = images.get("logos", [])
    if logos:
        en_logos = [l for l in logos if l.get("iso_639_1") == "en"]
        if en_logos:
            logoUrl = "https://image.tmdb.org/t/p/w500" + en_logos[0]["file_path"]
            hasLogo = True
        else:
            logoUrl = "https://image.tmdb.org/t/p/w500" + logos[0]["file_path"]
            hasLogo = True

    genres = [g["name"] for g in details.get("genres", [])]
    
    cast = []
    director = "Unknown"
    credits = details.get("credits", {})
    for c in credits.get("cast", [])[:10]:
        cast.append(c["name"])
    for c in credits.get("crew", []):
        if c.get("job") == "Director":
            director = c["name"]
            break

    imdb_id = details.get("imdb_id", "") or f"tmdb{tmdb_id}"

    hero = {
        "hasLogo": hasLogo,
        "logoUrl": logoUrl,
        "id": imdb_id,
        "tmdbId": str(tmdb_id),
        "imdbId": imdb_id,
        "title": details.get("title", ""),
        "originalTitle": details.get("original_title", ""),
        "description": details.get("overview", ""),
        "posterUrl": f"https://image.tmdb.org/t/p/w500{details.get('poster_path', '')}",
        "backdropUrl": f"https://image.tmdb.org/t/p/original{details.get('backdrop_path', '')}",
        "year": int(details.get("release_date", "2026").split("-")[0]) if details.get("release_date") else 2026,
        "releaseDate": details.get("release_date", ""),
        "duration": f"{details.get('runtime', 0)} min",
        "voteAverage": details.get("vote_average", 0),
        "rating": f"{details.get('vote_average', 0):.1f}",
        "language": details.get("original_language", "en"),
        "status": details.get("status", "Released"),
        "genre": genres,
        "director": director,
        "cast": cast,
        "isIframeEmbed": True,
        "iframeSrc": f"https://player.videasy.to/movie/{imdb_id}" if imdb_id else f"https://player.videasy.to/movie/{tmdb_id}"
    }
    heroes.append(hero)

out_data = {
    "success": True,
    "heroes": heroes,
    "hero": heroes[0] if heroes else None
}

with open("src/data/hero_movies.ts", "w") as f:
    f.write("export const heroMoviesData = ")
    json.dump(out_data, f, indent=2)
    f.write(";\n")

print("Done generating src/data/hero_movies.ts")
