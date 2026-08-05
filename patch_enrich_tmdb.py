import sys

with open("server.ts", "r") as f:
    content = f.read()

target1 = "const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=en-US`, {"
replacement1 = "const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`, {"

target2 = """    if (t) {
      return { 
        ...m, 
        posterUrl: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : m.posterUrl, 
        backdropUrl: t.backdrop_path ? `https://image.tmdb.org/t/p/original${t.backdrop_path}` : m.backdropUrl, 
        description: t.overview || m.description, 
        year: t.release_date ? parseInt(t.release_date.substring(0, 4)) : m.year, 
        releaseDate: t.release_date || m.releaseDate, 
        genre: t.genres?.map((g: any) => g.name) || m.genre, 
        rating: t.vote_average ? t.vote_average.toFixed(1) : m.rating,
        tmdbId: tmdbId
      };
    }"""

replacement2 = """    if (t) {
      const logoObj = t.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || t.images?.logos?.[0];
      return { 
        ...m, 
        posterUrl: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : m.posterUrl, 
        backdropUrl: t.backdrop_path ? `https://image.tmdb.org/t/p/original${t.backdrop_path}` : m.backdropUrl, 
        description: t.overview || m.description, 
        year: t.release_date ? parseInt(t.release_date.substring(0, 4)) : m.year, 
        releaseDate: t.release_date || m.releaseDate, 
        genre: t.genres?.map((g: any) => g.name) || m.genre, 
        rating: t.vote_average ? t.vote_average.toFixed(1) : m.rating,
        hasLogo: !!logoObj || m.hasLogo,
        logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : m.logoUrl,
        tmdbId: tmdbId
      };
    }"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)

with open("server.ts", "w") as f:
    f.write(content)
