const progressData = {
   "1399": 0.5,
   "1399-tv": 0.5,
};
const allMovies = [
   { id: "tt0944947-tv", tmdbId: "1399", title: "Game of Thrones" }
];

const getProgress = (id) => {
    let pct = progressData[id] || 0;
    if (pct === 0) {
      const m = allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", ""));
      if (m && m.tmdbId && progressData[m.tmdbId]) {
         pct = progressData[m.tmdbId];
      }
    }
    return pct;
};

console.log("Progress for tt0944947-tv:", getProgress("tt0944947-tv"));
console.log("Progress for 1399-tv:", getProgress("1399-tv"));
