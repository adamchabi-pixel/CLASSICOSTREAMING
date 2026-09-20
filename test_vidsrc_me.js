async function testVidsrcMe() {
  const res = await fetch("https://vidsrc.me/embed/movie?tmdb=550");
  console.log("Status:", res.status);
  const html = await res.text();
  console.log("HTML snippet:", html.substring(0, 400));
}
testVidsrcMe();
