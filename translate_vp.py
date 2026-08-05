with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

translations = {
    'Sous-titres': 'Subtitles',
    'Désactivé': 'Off',
    'Fermer le lecteur Classico': 'Close Classico Player',
    'OUI (Flux allégé activé)': 'YES (Light stream enabled)',
    'NON (Qualité standard)': 'NO (Standard quality)'
}

for fr, en in translations.items():
    content = content.replace(fr, en)

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
