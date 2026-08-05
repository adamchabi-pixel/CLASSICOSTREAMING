import re

with open('server.ts', 'r') as f:
    text = f.read()

# Replace the library fetch
old_fetch = r'''    const libraryUrl = `\$\{config\.url\}/Items\?recursive=true&includeItemTypes=Movie,Series&Language=en&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=3000&api_key=\$\{config\.apiKey\}`;
    const response = await fetch\(libraryUrl\);
    if \(!response\.ok\) \{
      res\.status\(response\.status\)\.json\(\{ success: false, error: "Impossible de lire la bibliothèque de médias." \}\);
      return;
    \}'''

new_fetch = '''    // Fetch users first to use the user's item list (fixes missing movies bug in global /Items)
    const usersResp = await fetch(`${config.url}/Users?api_key=${config.apiKey}`);
    let userId = "";
    if (usersResp.ok) {
      const usersData = await usersResp.json();
      if (usersData && usersData.length > 0) {
        userId = usersData[0].Id;
      }
    }

    const libraryUrl = userId 
      ? `${config.url}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=3000&api_key=${config.apiKey}`
      : `${config.url}/Items?recursive=true&includeItemTypes=Movie,Series&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=3000&api_key=${config.apiKey}`;
      
    const response = await fetch(libraryUrl);
    if (!response.ok) {
      res.status(response.status).json({ success: false, error: "Impossible de lire la bibliothèque de médias." });
      return;
    }'''

text = re.sub(old_fetch, new_fetch, text)

with open('server.ts', 'w') as f:
    f.write(text)
