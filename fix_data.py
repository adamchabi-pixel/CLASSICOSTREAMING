import re

with open('src/data.ts', 'r') as f:
    text = f.read()

# Fix Goodfellas
bad_goodfellas = """        title: "Goodfellas",
      {
        id: "bronx-tale",
        title: "A Bronx Tale",
        originalTitle: "A Bronx Tale",
        year: 1993,
        duration: "121 min",
        rating: "7.8",
        director: "Robert De Niro",
        cast: ["Robert De Niro", "Chazz Palminteri", "Lillo Brancato"],
        genre: ["Crime", "Drama"],
      },"""

goodfellas_fix = """        title: "Goodfellas","""

text = text.replace(bad_goodfellas, goodfellas_fix)

# Fix Se7en
bad_se7en = """        title: "Se7en",
      {
        id: "memories-of-murder",
        title: "Memories of Murder",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
      },"""

se7en_fix = """        title: "Se7en","""

text = text.replace(bad_se7en, se7en_fix)

# Now insert properly by finding the whole object.
# Let's insert before Goodfellas:
goodfellas_object = """      {
        id: "goodfellas","""

new_goodfellas = """      {
        id: "bronx-tale",
        title: "A Bronx Tale",
        originalTitle: "A Bronx Tale",
        year: 1993,
        duration: "121 min",
        rating: "7.8",
        director: "Robert De Niro",
        cast: ["Robert De Niro", "Chazz Palminteri", "Lillo Brancato"],
        genre: ["Crime", "Drama"],
      },
      {
        id: "goodfellas","""
text = text.replace(goodfellas_object, new_goodfellas)


se7en_object = """      {
        id: "se7en","""

new_se7en = """      {
        id: "memories-of-murder",
        title: "Memories of Murder",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
      },
      {
        id: "se7en","""
text = text.replace(se7en_object, new_se7en)

with open('src/data.ts', 'w') as f:
    f.write(text)
