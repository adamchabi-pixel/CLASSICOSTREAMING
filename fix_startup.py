import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """  serverInstance.listen(PORT, "0.0.0.0", () => {
    // Pre-warm caches immediately on server boot
    const startupConfig = getJellyfinConfig();
    if (startupConfig) {
      backgroundFetchMovies(startupConfig);
      backgroundFetchHero(startupConfig);
    }
  });"""

replacement = """  serverInstance.listen(PORT, "0.0.0.0", () => {
    // Delete local caches on boot to ensure fresh posters
    try {
      if (fs.existsSync(MOVIES_CACHE_PATH)) fs.unlinkSync(MOVIES_CACHE_PATH);
      if (fs.existsSync(HERO_CACHE_PATH)) fs.unlinkSync(HERO_CACHE_PATH);
      const TMDB_CACHE_PATH = path.join(process.cwd(), ".data", "tmdb_cache.json");
      if (fs.existsSync(TMDB_CACHE_PATH)) fs.unlinkSync(TMDB_CACHE_PATH);
    } catch(e) {}
    
    // Pre-warm caches immediately on server boot
    const startupConfig = getJellyfinConfig();
    if (startupConfig) {
      backgroundFetchMovies(startupConfig);
      backgroundFetchHero(startupConfig);
    }
  });"""

content = content.replace(target, replacement)

with open("server.ts", "w") as f:
    f.write(content)
