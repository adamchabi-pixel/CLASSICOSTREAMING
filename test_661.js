async function inspect661() {
  const res = await fetch("https://cinemaos.live/_next/static/chunks/661-fa38ee351c36fc1c.js");
  const code = await res.text();
  console.log("661 len:", code.length);
  // Look for any string containing vidsrc, embed, player, iframe, cinemaos, vidlink, stream, api, server
  const matches = code.match(/["'`][^"'`]*(?:embed|player|vidsrc|vidlink|stream|server|iframe|hls|m3u8|watch|movie|tv)[^"'`]*["'`]/gi);
  console.log("661 matches:", [...new Set(matches)]);
}
inspect661();
