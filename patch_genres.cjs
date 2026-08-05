const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetGenres = `const GENRES = [
  { id: 28, name: "Action", icon: Target },
  { id: 12, name: "Adventure", icon: Compass },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 14, name: "Fantasy", icon: Wand2 },
  { id: 36, name: "History", icon: Landmark },
  { id: 27, name: "Horror", icon: Ghost },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10749, name: "Romance", icon: Heart },
  { id: 878, name: "Sci-Fi", icon: Rocket },
  { id: 53, name: "Thriller", icon: Eye },
  { id: 10752, name: "War", icon: Target },
  { id: 37, name: "Western", icon: Star }
];`;

const replacementGenres = `const GENRES = [
  { id: 28, name: "Action", icon: Target },
  { id: 12, name: "Adventure", icon: Compass },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 14, name: "Fantasy", icon: Wand2 },
  { id: 36, name: "History", icon: Landmark },
  { id: 27, name: "Horror", icon: Ghost },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10749, name: "Romance", icon: Heart },
  { id: 878, name: "Sci-Fi", icon: Rocket },
  { id: 53, name: "Thriller", icon: Eye },
  { id: 10752, name: "War", icon: Target },
  { id: 37, name: "Western", icon: Star }
];
const TV_GENRES = [
  { id: 10759, name: "Action", icon: Target },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 10762, name: "Kids", icon: Smile },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10763, name: "News", icon: Globe },
  { id: 10764, name: "Reality", icon: Video },
  { id: 10765, name: "Sci-Fi", icon: Rocket },
  { id: 10766, name: "Soap", icon: Heart },
  { id: 10767, name: "Talk", icon: Users },
  { id: 10768, name: "Politics", icon: Landmark },
  { id: 37, name: "Western", icon: Star }
];`;

content = content.replace(targetGenres, replacementGenres);

// Now update where we iterate GENRES
const targetGenreMap = `{GENRES.map(g => (
              <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id === activeGenre ? null : g.id)}`;
const replacementGenreMap = `{(type === 'tv' ? TV_GENRES : GENRES).map(g => (
              <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id === activeGenre ? null : g.id)}`;
content = content.replace(targetGenreMap, replacementGenreMap);

const targetGenreFind = `genres: r.genre_ids.map((id: number) => GENRES.find(g => g.id === id)?.name).filter(Boolean),`;
const replacementGenreFind = `genres: r.genre_ids.map((id: number) => (type === 'tv' ? TV_GENRES : GENRES).find(g => g.id === id)?.name).filter(Boolean),`;
content = content.replace(targetGenreFind, replacementGenreFind);

fs.writeFileSync('src/components/LibraryView.tsx', content);
