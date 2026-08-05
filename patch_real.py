import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """        const genres = movieData.genres?.map(g => g.name) || [];
        
        const finalId = imdbId || String(tmdbId); // Prefer IMDb for iframe

        const newFiche = {
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
          backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime || 0,
          voteAverage: movieData.vote_average,
          language: movieData.original_language,"""

replacement = """        const genres = movieData.genres?.map((g: any) => g.name) || [];
        
        const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

        const finalId = imdbId || String(tmdbId); // Prefer IMDb for iframe

        const newFiche = {
          hasLogo: !!logoObj,
          logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
          backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime ? `${movieData.runtime} min` : "0 min",
          voteAverage: movieData.vote_average,
          rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
          language: movieData.original_language,"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced!")
else:
    print("Not found!")

with open("server.ts", "w") as f:
    f.write(content)
