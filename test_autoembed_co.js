async function testAutoembedCo() {
  const res = await fetch("https://autoembed.co/movie/tmdb/550");
  console.log("Status:", res.status);
  const html = await res.text();
  console.log("HTML snippet:", html.substring(0, 400));
}
testAutoembedCo();
