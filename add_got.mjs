import fs from 'fs';

async function main() {
  const tmdbId = "1399";
  const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
  const url = `https://api.themoviedb.org/3/tv/${tmdbId}?append_to_response=credits,images,similar,videos&include_image_language=en,null&language=en-US`;
  const res = await fetch(url, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" } });
  const movieData = await res.json();
  
  const director = movieData.created_by?.[0]?.name || "Unknown";
  const genres = movieData.genres?.map(g => g.name) || [];
  const cast = movieData.credits?.cast?.slice(0, 10).map(c => c.name) || [];
  const logoObj = movieData.images?.logos?.find(l => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];
  
  const imdbId = "tt0944947-tv";
  const newFiche = {
    hasLogo: !!logoObj,
    logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
    id: imdbId,
    tmdbId: String(movieData.id),
    imdbId: imdbId,
    isTv: true,
    title: movieData.name,
    originalTitle: movieData.original_name,
    description: movieData.overview,
    posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
    backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
    year: movieData.first_air_date ? parseInt(movieData.first_air_date.substring(0, 4)) : new Date().getFullYear(),
    releaseDate: movieData.first_air_date,
    duration: movieData.episode_run_time?.[0] ? `${movieData.episode_run_time[0]} min` : "0 min",
    voteAverage: movieData.vote_average,
    rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
    language: movieData.original_language,
    status: movieData.status,
    genre: genres,
    director: director,
    cast: cast,
    isIframeEmbed: true,
    iframeSrc: `https://player.videasy.net/tv/${imdbId.replace("-tv", "")}?color=FFD700&overlay=true`
  };
  
  const allMoviesFile = 'src/data/all_movies.ts';
  let code = fs.readFileSync(allMoviesFile, 'utf-8');
  let arrayContentStr = code.match(/export const allMoviesData = \[([\s\S]*?)\];/)[1];
  
  if (!code.includes(`"${imdbId}"`)) {
    let newArrayContent = arrayContentStr;
    if (!newArrayContent.trim().endsWith(',')) {
      newArrayContent += ',\n';
    }
    newArrayContent += JSON.stringify(newFiche, null, 2) + '\n';
    
    code = code.replace(
      /export const allMoviesData = \[([\s\S]*?)\];/,
      `export const allMoviesData = [\n${newArrayContent}];`
    );
    
    fs.writeFileSync(allMoviesFile, code, 'utf-8');
    console.log("Added Game of Thrones to all_movies.ts");
  } else {
    console.log("Game of Thrones already in all_movies.ts");
  }
}

main().catch(console.error);
