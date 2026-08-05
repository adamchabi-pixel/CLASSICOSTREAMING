import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """    const genres = movieData.genres?.map((g: any) => g.name) || [];

    const newFiche = {"""

replacement = """    const genres = movieData.genres?.map((g: any) => g.name) || [];

    const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

    const newFiche = {
      hasLogo: !!logoObj,
      logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,"""

content = content.replace(target, replacement)

with open("server.ts", "w") as f:
    f.write(content)
