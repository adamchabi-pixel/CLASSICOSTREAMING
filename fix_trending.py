import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_logic = """          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...movie,
              id: match.id, // Use server id to play correctly
              streamUrl: match.streamUrl,
              isJellyfin: true,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              originalTitle: match.originalTitle || movie.originalTitle,
              studios: match.studios || movie.studios,
              director: match.director || movie.director,
              genre: match.genre || movie.genre
            } as Movie;
          }
          return null;"""

new_logic = """          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...movie,
              id: match.id, // Use server id to play correctly
              streamUrl: match.streamUrl,
              isJellyfin: true,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              originalTitle: match.originalTitle || movie.originalTitle,
              studios: match.studios || movie.studios,
              director: match.director || movie.director,
              genre: match.genre || movie.genre
            } as Movie;
          }
          if (collection.id === "trending-now") {
            return movie;
          }
          return null;"""

text = text.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(text)
