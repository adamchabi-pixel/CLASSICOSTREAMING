const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

const target = `          const movieData = {
            id: id,`;

const replacement = `          const videos = m.videos?.results || [];
          const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || videos.find((v: any) => v.site === 'YouTube');
          const trailerUrl = trailer ? \`https://www.youtube.com/watch?v=\${trailer.key}\` : undefined;
          
          const movieData = {
            id: id,
            trailerUrl: trailerUrl,`;

content = content.replace(target, replacement);
fs.writeFileSync('src/main.tsx', content);
