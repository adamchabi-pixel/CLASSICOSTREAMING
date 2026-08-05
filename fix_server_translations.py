with open('server.ts', 'r') as f:
    text = f.read()

text = text.replace('"Aucun synopsis disponible pour ce titre sur Jellyfin."', '"No synopsis available for this title on Jellyfin."')
text = text.replace('"Réalisateur Inconnu"', '"Unknown Director"')
text = text.replace('"Disponible sur votre serveur"', '"Available on your server"')
text = text.replace('"Film Sans Titre"', '"Untitled Movie"')

with open('server.ts', 'w') as f:
    f.write(text)
