fetch(`http://localhost:3000/api/search?query=game%20of%20thrones`)
  .then(r => r.json())
  .then(data => {
    data.results.forEach(m => console.log(m.title, m.tmdbId, m.id));
  });
