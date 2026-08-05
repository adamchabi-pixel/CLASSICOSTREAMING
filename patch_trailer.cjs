const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const trailerLogic = `
    const videos = m.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || videos.find((v: any) => v.site === 'YouTube');
    const trailerUrl = trailer ? \`https://www.youtube.com/watch?v=\${trailer.key}\` : undefined;
`;

const oldStr = `    const movieData = {
      id: id,`;

const newStr = `    const videos = m.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || videos.find((v: any) => v.site === 'YouTube');
    const trailerUrl = trailer ? \`https://www.youtube.com/watch?v=\${trailer.key}\` : undefined;

    const movieData = {
      id: id,
      trailerUrl: trailerUrl,`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('server.ts', content);
