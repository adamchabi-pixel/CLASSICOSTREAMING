async function testMoreEmbeds() {
  const urls = [
    { name: "VidSrc.me", url: "https://vidsrc.me/embed/movie?tmdb=550" },
    { name: "VidSrc.vip", url: "https://vidsrc.vip/embed/movie/550" },
    { name: "VidSrc.dev", url: "https://vidsrc.dev/embed/movie/550" },
    { name: "VidSrc.icu", url: "https://vidsrc.icu/embed/movie/550" },
    { name: "AutoEmbed.co", url: "https://autoembed.co/movie/tmdb/550" },
    { name: "RiveStream", url: "https://rivestream.live/embed?type=movie&id=550" },
    { name: "Vidsrc.net", url: "https://vidsrc.net/embed/movie/550" },
    { name: "SuperEmbed", url: "https://multiembed.mov/directstream.php?video_id=550&tmdb=1" }
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url);
      const xfo = res.headers.get("x-frame-options");
      const csp = res.headers.get("content-security-policy");
      console.log(`[${item.name}] Status: ${res.status} | XFO: ${xfo || 'None'} | CSP: ${csp ? csp.substring(0, 60) : 'None'}`);
    } catch(e) {
      console.log(`[${item.name}] Error: ${e.message}`);
    }
  }
}
testMoreEmbeds();
