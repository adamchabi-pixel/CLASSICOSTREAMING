async function check() {
  const res = await fetch('https://cinemaos.live/watch/movie/1081003');
  const html = await res.text();
  if (html.includes('postMessage')) {
    console.log("postMessage found in CinemaOS HTML!");
  } else {
    console.log("no postMessage found in CinemaOS HTML");
  }
}
check();
