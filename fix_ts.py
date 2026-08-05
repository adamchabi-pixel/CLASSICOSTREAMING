import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix currentPath -> activeTab
content = content.replace("}, [currentPath]);", "}, [activeTab]);")

# Fix movie.poster in patch_app_props.py replacement
content = content.replace("moviePoster={activeMovie.posterUrl || activeMovie.poster}", "moviePoster={activeMovie.posterUrl || (activeMovie as any).poster}")
content = content.replace("moviePoster={activeMovie?.posterUrl || activeMovie?.poster}", "moviePoster={activeMovie?.posterUrl || (activeMovie as any)?.poster}")

with open("src/App.tsx", "w") as f:
    f.write(content)

