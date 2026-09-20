async function deepInspectCinemaOS() {
  try {
    // 1. Fetch main html of watch/movie/550
    const res = await fetch("https://cinemaos.live/watch/movie/550", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    
    // Find all script tags src in HTML
    const scriptSrcs = [...html.matchAll(/src=["'](\/_next\/static\/chunks\/[^"']+)["']/g)].map(m => m[1]);
    console.log("Chunk scripts found:", scriptSrcs);

    for (const src of scriptSrcs) {
      const chunkRes = await fetch("https://cinemaos.live" + src);
      const code = await chunkRes.text();
      // Search for any URL, host, embed, iframe, vidsrc, player in code
      const iframeMatches = code.match(/iframe|embed|player|vidsrc|vidlink|autoembed|2embed|src/gi);
      if (iframeMatches && code.length > 5000) {
        // Look for string literals containing http or domain names or /watch/ or /embed/
        const stringLiterals = code.match(/["'](https?:\/\/[^"']+|\/[a-zA-Z0-9_\-\/]+)["']/g) || [];
        const cleanLiterals = [...new Set(stringLiterals.map(s => s.slice(1, -1)))].filter(s => 
          !s.includes("w3.org") && !s.includes("nextjs") && !s.includes("vercel") && !s.includes("react")
        );
        if (cleanLiterals.length > 0) {
          console.log(`\n--- Literals in ${src} (${code.length} bytes) ---`);
          console.log(cleanLiterals.slice(0, 40));
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
}
deepInspectCinemaOS();
