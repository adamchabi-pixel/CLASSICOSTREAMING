async function check() {
  const res = await fetch('https://cinemaos.live/watch/tv/1399/1/1');
  console.log("URL1", res.status, res.url);
  
  const res2 = await fetch('https://cinemaos.live/embed/tv/1399/1/1');
  console.log("URL2", res2.status, res2.url);
  
  const res3 = await fetch('https://cinemaos.live/watch/tv/1399?s=1&e=1');
  console.log("URL3", res3.status, res3.url);
}
check();
