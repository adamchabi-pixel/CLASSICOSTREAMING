const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;

const replacement = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://cdn.simpleicons.org/netflix/E50914" },
  { id: 1899, name: "Max", logo: "https://cdn.simpleicons.org/hbo/ffffff" },
  { id: 337, name: "Disney+", logo: "https://cdn.simpleicons.org/disneyplus/ffffff" },
  { id: 15, name: "Hulu", logo: "https://cdn.simpleicons.org/hulu/1ce783" },
  { id: 9, name: "Prime Video", logo: "https://cdn.simpleicons.org/primevideo/00A8E1" },
  { id: 350, name: "Apple TV+", logo: "https://cdn.simpleicons.org/appletv/ffffff" },
  { id: 531, name: "Paramount+", logo: "https://cdn.simpleicons.org/paramountplus/0064FF" }
];`;

content = content.replace(target, replacement);

// Increase distance between top and filters: "Aussi la distance entre tout ca dans le menu library et la navbar est trop gros"
// The user said: "Aussi la distance entre tout ca dans le menu library et la navbar est trop gros" (the distance is too big).
// Right now it's: `pb-20 pt-8` or something. Let me check the container.
content = content.replace(`pt-8 px-4`, `pt-4 px-4`);

fs.writeFileSync('src/components/LibraryView.tsx', content);
