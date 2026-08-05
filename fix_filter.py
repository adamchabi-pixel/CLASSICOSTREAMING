with open('server.ts', 'r') as f:
    text = f.read()

# Replace movies filtering
text = text.replace("""    // Filtre de sécurité : Éliminer tous les films fantômes ou morts dont le chemin pointe vers le stockage défectueux movies_jellyfin_web
    const healthyMovies = rawMovies.filter((item: any) => {
      const p = (item.Path || "").toLowerCase();
      return !p.includes("movies_jellyfin_web");
    });

    const formattedMovies = healthyMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));""", """    const formattedMovies = rawMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));""")

# hero filtering
text = text.replace("""    // Filter out phantom/broken entries
    const healthyItems = items.filter((item: any) => {
      const p = (item.Path || "").toLowerCase();
      return !p.includes("movies_jellyfin_web");
    });

    if (healthyItems.length === 0) {""", """    const healthyItems = items;
    if (healthyItems.length === 0) {""")

# search filtering
text = text.replace("""    // Filtre de sécurité : Éliminer tous les films dont la source est sur movies_jellyfin_web
    const healthyMovies = rawMovies.filter((item: any) => {
      const p = (item.Path || "").toLowerCase();
      return !p.includes("movies_jellyfin_web");
    });

    const formattedMovies = healthyMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));""", """    const formattedMovies = rawMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));""")

# playback substitution
import re
text = re.sub(r'// Étape 1a : Tolérance de panne avancée.*?// 2\. Fixer les sources media', '// 2. Fixer les sources media', text, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(text)

