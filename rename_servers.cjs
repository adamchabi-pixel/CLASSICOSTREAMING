const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

content = content.replace(/{ name: "FrEmbed",/g, '{ name: "Lecteur 1 (FrEmbed)",');
content = content.replace(/{ name: "CinemaOS",/g, '{ name: "Lecteur 1 (CinemaOS)",');
content = content.replace(/{ name: "Peachify",/g, '{ name: "Lecteur 2 (Peachify)",');
content = content.replace(/{ name: "VidSrc",/g, '{ name: "Lecteur 3 (VidSrc)",');
content = content.replace(/{ name: "MultiEmbed VIP",/g, '{ name: "Lecteur 4 (MultiEmbed)",');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
