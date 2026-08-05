const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;

const replacementPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg" }
];`;

content = content.replace(targetPlatforms, replacementPlatforms);

fs.writeFileSync('src/components/LibraryView.tsx', content);
