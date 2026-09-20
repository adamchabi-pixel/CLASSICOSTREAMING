async function inspectAllChunks() {
  try {
    const res = await fetch("https://cinemaos.live/watch/movie/550", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const html = await res.text();
    const chunkPaths = [...html.matchAll(/src=["'](\/_next\/static\/chunks\/[^"']+)["']/g)].map(m => m[1]);
    console.log("Found chunk paths:", chunkPaths);

    for (const p of chunkPaths) {
      const cRes = await fetch("https://cinemaos.live" + p);
      const cText = await cRes.text();
      const urls = cText.match(/https?:\/\/[^\s"'`<>]+/g) || [];
      if (urls.length > 0) {
        console.log(`Chunk ${p} has URLs:`, [...new Set(urls)].filter(u => !u.includes("w3.org") && !u.includes("schema.org") && !u.includes("nextjs") && !u.includes("vercel")));
      }
      const apiMatches = cText.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
      if (apiMatches.length > 0) {
        console.log(`Chunk ${p} has API matches:`, [...new Set(apiMatches)]);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
inspectAllChunks();
