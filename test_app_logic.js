const mappedCollections = [
  {
    id: "comedy-gold",
    movies: [
      { id: "21-jump-street", title: "21 Jump Street" }
    ]
  }
];

const jellyfinMovies = [];

function cleanTitle(title) {
  if (!title) return "";
  let t = title.toLowerCase();
  t = t.replace(/\(\d{4}\)/g, " ");
  t = t.replace(/\[\d{4}\]/g, " ");
  t = t.replace(/\b(19|20)\d{2}\b/g, " ");
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/[^a-z0-9\s]/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

const map = new Map();
mappedCollections.flatMap(c => c.movies).forEach(m => {
  const key = cleanTitle(m.title);
  map.set(key, m);
});

jellyfinMovies.forEach(m => {
  const key = cleanTitle(m.title);
  if (!map.has(key)) {
    map.set(key, m);
  }
});

const allMovies = Array.from(map.values());
const activeMovie = allMovies.find(m => m.id === "21-jump-street") || null;

console.log("activeMovie:", activeMovie);
