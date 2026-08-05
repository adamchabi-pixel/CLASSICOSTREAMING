import re

with open("src/data.ts", "r") as f:
    text = f.read()

replacements = {
    'tagline: "Une revanche que tout le monde attendait."': 'tagline: "A rematch the whole world was waiting for."',
    'tagline: "Retrouvez la rage de vaincre."': 'tagline: "Rediscover the will to win."',
    'tagline: "Un combat qui dépasse les frontières géopolitiques."': 'tagline: "A fight that transcends geopolitical borders."',
    'tagline: "Le vrai combat n\'est pas sur le ring."': 'tagline: "The real fight isn\'t in the ring."',
    'tagline: "Il s\'agit de savoir combien d\'impacts tu peux encaisser sans broncher."': 'tagline: "It\'s about how hard you can get hit and keep moving forward."'
}

for fr, en in replacements.items():
    text = text.replace(fr, en)

with open("src/data.ts", "w") as f:
    f.write(text)
