import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("if (entry & entry.expiry > Date.now())", "if (entry && entry.expiry > Date.now())")
content = content.replace("if (!cachedMovies & fs.existsSync(MOVIES_CACHE_PATH))", "if (!cachedMovies && fs.existsSync(MOVIES_CACHE_PATH))")
content = content.replace("if (!cachedHeroes & fs.existsSync(HERO_CACHE_PATH))", "if (!cachedHeroes && fs.existsSync(HERO_CACHE_PATH))")
content = content.replace("if (!req.query.id & !req.query.path & !isWildcardPath)", "if (!req.query.id && !req.query.path && !isWildcardPath)")
content = content.replace("const isWildcardPath = wildcardPath & wildcardPath !== \\\"stream\\\";", "const isWildcardPath = wildcardPath && wildcardPath !== \\\"stream\\\";")

with open('server.ts', 'w') as f:
    f.write(content)

print("Replaced single ampersands")
