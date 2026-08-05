fetch('http://localhost:3000/api/movie/603') // The Matrix
  .then(res => res.json())
  .then(data => {
    console.log("Cast details count:", data.movie?.castDetails?.length);
    console.log("Similar count:", data.movie?.similar?.length);
    console.log("Trailer:", data.movie?.trailerUrl);
  })
  .catch(console.error);
