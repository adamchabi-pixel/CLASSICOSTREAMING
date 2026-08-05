const jellyfinMovies = [
  { id: "uuid-1234", title: "21 Jump Street" }
];

const mappedCollections = [
  {
    id: "comedy-gold",
    movies: [
      // wait! If isMovieMatch matched it, it is enriched!
      { id: "uuid-1234", title: "21 Jump Street" }
    ]
  }
];

const map = new Map();
mappedCollections.flatMap(c => c.movies).forEach(m => {
  const key = "21 jump street";
  map.set(key, m);
});

jellyfinMovies.forEach(m => {
  const key = "21 jump street";
  if (!map.has(key)) {
    map.set(key, m);
  }
});

const allMovies = Array.from(map.values());
const targetId = "21-jump-street"; // Because maybe handleOpenMovie used the wrong ID?
// Wait! If mappedCollections has id "uuid-1234", then MovieCard has "uuid-1234", so targetId = "uuid-1234".
// Then allMovies.find(m => m.id === targetId) finds it!
