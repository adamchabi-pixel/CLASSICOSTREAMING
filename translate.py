with open("src/App.tsx", "r") as f:
    content = f.read()

translations = {
    'title: "La Saga Matrix"': 'title: "The Matrix Saga"',
    'EFFACER': 'CLEAR',
    'Regarder': 'Play',
    "Plus d'infos": 'More Info',
    'Sélections Cinémathèques': 'Cinematic Selections',
    'Voir Tout': 'View All',
    'En construction': 'Under Construction',
    'Bientôt, vous pourrez demander directement vos films préférés ici.': 'Soon, you will be able to request your favorite movies directly here.',
    'La Wishlist est en cours de construction ! 🍿': 'The Wishlist is under construction! 🍿',
    'Rechercher un film...': 'Search for a movie...',
    'RÉALISATEUR': 'DIRECTOR',
    'CASTING': 'CAST',
    'AUCUN RÉSULTAT POUR': 'NO RESULTS FOR',
    'SÉLECTIONNEZ': 'SELECT'
}

for fr, en in translations.items():
    content = content.replace(fr, en)

with open("src/App.tsx", "w") as f:
    f.write(content)
