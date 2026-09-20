async function testEmbedHeaders() {
  const urls = [
    { name: "Cinejoy.to watch", url: "https://cinejoy.to/watch/movie/550" },
    { name: "VidSrc.pro", url: "https://vidsrc.pro/embed/movie/550" },
    { name: "VidSrc.cc", url: "https://vidsrc.cc/v2/embed/movie/550" },
    { name: "AutoEmbed.cc", url: "https://player.autoembed.cc/embed/movie/550" },
    { name: "Embed.su", url: "https://embed.su/embed/movie/550" },
    { name: "VidSrc.in", url: "https://vidsrc.in/embed/movie/550" },
    { name: "Smashystream", url: "https://embed.smashystream.com/playere.php?tmdb=550" },
    { name: "2Embed", url: "https://www.2embed.cc/embed/550" }
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url, { method: "HEAD" });
      const xfo = res.headers.get("x-frame-options");
      const csp = res.headers.get("content-security-policy");
      console.log(`[${item.name}] Status: ${res.status}`);
      console.log(`   X-Frame-Options: ${xfo || 'None'}`);
      console.log(`   CSP: ${csp ? csp.substring(0, 100) : 'None'}`);
    } catch(e) {
      console.log(`[${item.name}] Error: ${e.message}`);
    }
  }
}
testEmbedHeaders();
