with open("src/App.tsx", "r") as f:
    content = f.read()

translations = {
    "Découvrez nos dossiers exclusifs par réalisateur emblématique, sagas infinies, ou thèmes épiques qui ont redéfini l'histoire du cinéma mondial.": "Discover our exclusive folders by emblematic director, infinite sagas, or epic themes that redefined world cinema history."
}

for fr, en in translations.items():
    content = content.replace(fr, en)

with open("src/App.tsx", "w") as f:
    f.write(content)
