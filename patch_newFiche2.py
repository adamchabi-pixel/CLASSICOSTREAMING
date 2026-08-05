import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """      year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
      releaseDate: movieData.release_date,
      duration: movieData.runtime || 0,
      voteAverage: movieData.vote_average,
      language: movieData.original_language,"""

replacement = """      year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
      releaseDate: movieData.release_date,
      duration: movieData.runtime ? `${movieData.runtime} min` : "0 min",
      voteAverage: movieData.vote_average,
      rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
      language: movieData.original_language,"""

content = content.replace(target, replacement)

with open("server.ts", "w") as f:
    f.write(content)
