const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer ' + TMDB_TOKEN
  }
};

fetch('https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US', options)
  .then(res => res.json())
  .then(res => {
     const providers = res.results.filter(p => [8, 1899, 337, 15, 9, 350, 531].includes(p.provider_id));
     console.log(JSON.stringify(providers.map(p => ({id: p.provider_id, name: p.provider_name, logo: 'https://image.tmdb.org/t/p/original' + p.logo_path})), null, 2));
  })
  .catch(err => console.error(err));
