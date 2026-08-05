import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const tmdbKey = envFile.split('\n').find(l => l.startsWith('VITE_TMDB_API_KEY=')).split('=')[1];

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer ' + tmdbKey
  }
};

fetch('https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US', options)
  .then(res => res.json())
  .then(res => {
     const providers = res.results.filter(p => [8, 1899, 337, 15, 9, 350, 531].includes(p.provider_id));
     console.log(JSON.stringify(providers.map(p => ({id: p.provider_id, name: p.provider_name, logo: 'https://image.tmdb.org/t/p/original' + p.logo_path})), null, 2));
  })
  .catch(err => console.error(err));
