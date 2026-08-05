import re

with open('server.ts', 'r') as f:
    text = f.read()

# Fix searchUrl in search endpoint
old_search = r'''    const searchUrl = `\$\{config\.url\}/Items\?recursive=true&includeItemTypes=Movie,Series&Language=en&searchTerm=\$\{encodeURIComponent\(String\(title\)\)\}&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path&api_key=\$\{config\.apiKey\}`;'''

new_search = '''    // Resolve user for consistent access
    const usersResp = await fetch(`${config.url}/Users?api_key=${config.apiKey}`);
    let userId = "";
    if (usersResp.ok) {
      const usersData = await usersResp.json();
      if (usersData && usersData.length > 0) userId = usersData[0].Id;
    }
    const searchUrl = userId
      ? `${config.url}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&searchTerm=${encodeURIComponent(String(title))}&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path&api_key=${config.apiKey}`
      : `${config.url}/Items?recursive=true&includeItemTypes=Movie,Series&searchTerm=${encodeURIComponent(String(title))}&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path&api_key=${config.apiKey}`;'''

text = re.sub(old_search, new_search, text)

with open('server.ts', 'w') as f:
    f.write(text)
