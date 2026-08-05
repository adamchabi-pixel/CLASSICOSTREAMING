const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success && data.results) {
          setTmdbCache(prev => {`;

const replacement = `  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
        const pages = [1, 2, 3];
        const fetchPage = async (page: number) => {
          const url = \`https://api.themoviedb.org/3/trending/all/day?language=en-US&page=\${page}\`;
          const response = await fetch(url, {
            headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
          });
          if (!response.ok) return [];
          const data = await response.json();
          return data.results || [];
        };
        const resultsByPage = await Promise.all(pages.map(fetchPage));
        const combinedResults = resultsByPage.flat();
        const validResults = combinedResults.filter((m: any) => (m.media_type === "movie" || m.media_type === "tv") && !isAnimeOrAdult(m));
        
        const results = validResults.slice(0, 60).map((m: any) => {
          const title = m.title || m.name || m.original_title || m.original_name;
          const isTv = m.media_type === "tv";
          return {
            id: isTv ? \`\${m.id}-tv\` : String(m.id),
            tmdbId: String(m.id),
            isTv,
            title,
            originalTitle: m.original_title || m.original_name,
            description: m.overview || "",
            posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : null,
            backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : null,
            year: parseInt((m.release_date || m.first_air_date || "0").split("-")[0]) || 0,
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: ""
          };
        });

        if (results.length > 0) {
          setTmdbCache(prev => {
            const data = { results };`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success");
} else {
    console.log("Target not found");
}
