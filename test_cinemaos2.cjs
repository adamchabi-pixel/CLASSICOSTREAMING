async function check() {
  const res = await fetch('https://cinemaos.live/watch/movie/1081003?dummy=1&t=123');
  console.log("Movie", res.status, res.url);
}
check();
