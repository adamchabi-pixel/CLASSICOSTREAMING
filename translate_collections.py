import re

with open("src/data.ts", "r") as f:
    text = f.read()

replacements = {
    # Collection descriptions
    '''description: "L'art de la guerre et de la vengeance chorégraphiée. Une saga d'action légendaire menée par Keanu Reeves."''': '''description: "The art of war and choreographed revenge. A legendary action saga led by Keanu Reeves."''',
    '''description: "Le fouet, le chapeau et les mystères de l'histoire. Suivez le plus grand archéologue-aventurier de tous les temps."''': '''description: "The whip, the hat and the mysteries of history. Follow the greatest archaeologist-adventurer of all time."''',
    '''description: "Des dialogues percutants, une violence stylisée et des bandes-son inoubliables. L'œuvre unique du maître Quentin Tarantino."''': '''description: "Punchy dialogue, stylized violence and unforgettable soundtracks. The unique work of master Quentin Tarantino."''',
    '''description: "Le temps distordu, la réalité fragmentée et des visions d'une ampleur inégalée. Le cinéma conceptuel de Christopher Nolan."''': '''description: "Distorted time, fragmented reality and visions of unparalleled scale. The conceptual cinema of Christopher Nolan."''',
    '''description: "La saga spatiale légendaire. Une lutte éternelle entre la Force et le Côté Obscur à travers la galaxie."''': '''description: "The legendary space saga. An eternal struggle between the Force and the Dark Side across the galaxy."''',
    '''description: "Le flegme britannique, les gadgets hi-tech et le permis de tuer. Les plus grandes missions de l'espion iconique."''': '''description: "British composure, high-tech gadgets and a license to kill. The greatest missions of the iconic spy."''',
    '''description: "Le combat d'une vie. L'ascension inspirante de l'Étalon Italien d'un quartier modeste de Philadelphie au sommet du monde."''': '''description: "The fight of a lifetime. The inspiring rise of the Italian Stallion from a humble Philadelphia neighborhood to the top of the world."''',
    '''description: "La résistance humaine face à l'insurrection de Skynet et des cyborgs. Une boucle temporelle d'action cybernétique pure."''': '''description: "Human resistance against the uprising of Skynet and cyborgs. A time loop of pure cybernetic action."''',
    '''description: "Vitesse, grosses cylindrées, famille et cascades spectaculaires. L'intégrale de la saga légendaire d'action menée par Vin Diesel et Paul Walker, et propulsée vers la gloire par le réalisateur prodige Justin Lin."''': '''description: "Speed, big engines, family and spectacular stunts. The complete legendary action saga led by Vin Diesel and Paul Walker, and propelled to glory by prodigy director Justin Lin."''',
    '''description: "Le monde de la pègre, des affranchis et des cartels. Des récits épiques de pouvoir, de loyauté et de trahison."''': '''description: "The world of the underworld, goodfellas and cartels. Epic tales of power, loyalty and betrayal."''',
    '''description: "Des thrillers psychologiques glaçants, des meurtres sordides et des retournements de situation qui vous laisseront sans voix."''': '''description: "Chilling psychological thrillers, sordid murders and twists that will leave you speechless."''',
    '''description: "Le Chevalier Noir défend Gotham City contre le crime et la corruption."''': '''description: "The Dark Knight defends Gotham City against crime and corruption."''',

    # Rocky movies titles and descriptions
    '''title: "Rocky II : La Revanche"''': '''title: "Rocky II"''',
    '''description: "Après avoir tenu la distance de manière héroïque face au champion du monde Apollo Creed, le peuple réclame une revanche spectaculaire. Rocky Balboa cherche d'abord à s'installer en famille avant de retourner aux gants."''': '''description: "After heroically going the distance against world champion Apollo Creed, the public demands a spectacular rematch. Rocky Balboa first tries to settle down with his family before returning to the ring."''',

    '''title: "Rocky III : L'Œil du tigre"''': '''title: "Rocky III"''',
    '''description: "Rocky s'est reposé sur ses lauriers et encaisse une cuisante défaite par K.O. face au féroce et arrogant Clubber Lang. Apollo Creed, son ancien rival, s'érige comme mentor inattendu pour lui redonner 'l'œil du tigre'."''': '''description: "Rocky has rested on his laurels and suffers a crushing knockout defeat to the fierce and arrogant Clubber Lang. Apollo Creed, his former rival, steps up as an unexpected mentor to give him back the 'eye of the tiger'."''',
    
    '''description: "Rocky Balboa, boxeur d'un club miteux de Philadelphie accumulant les dettes, se voit proposer par un coup de pouce du destin d'affronter le champion du monde invaincu Apollo Creed pour un combat vedette historique."''': '''description: "Rocky Balboa, a boxer from a seedy Philadelphia club accumulating debts, is offered by a stroke of destiny to face the undefeated world champion Apollo Creed for a historic main event."''',

    '''description: "Lorsque son ami de toujours Apollo Creed meurt tragiquement sur le ring tué par le colosse soviétique sans pitié Ivan Drago, Rocky Balboa décide de s'entraîner dur au cœur de la Sibérie sauvage pour l'affronter à Moscou."''': '''description: "When his lifelong friend Apollo Creed dies tragically in the ring killed by the ruthless Soviet colossus Ivan Drago, Rocky Balboa decides to train hard in the heart of the wild Siberia to face him in Moscow."''',

    '''description: "Ruine financièrement et contraint de prendre sa retraite de la boxe en raison de séquelles physiques, Rocky retourne dans les faubourgs de Philadelphie et forme un jeune prodige fougueux appelé Tommy Gunn."''': '''description: "Financially ruined and forced to retire from boxing due to physical aftereffects, Rocky returns to the Philadelphia suburbs and trains a fiery young prodigy named Tommy Gunn."''',

    '''description: "Détenant un modeste restaurant, Rocky souffre toujours de la mort d'Adrian. Lorsqu'une simulation télévisée le déclare vainqueur virtuel du champion actuel, Rocky consent à rendosser les gants pour une dernière revanche d'honneur."''': '''description: "Owning a modest restaurant, Rocky still suffers from Adrian's death. When a TV simulation declares him the virtual winner of the current champion, Rocky agrees to don the gloves again for a final rematch of honor."''',
    
    '''tagline: "Tout le monde mérite sa chance de gloire."''': '''tagline: "Everyone deserves a chance at glory."''',
}

for fr, en in replacements.items():
    text = text.replace(fr, en)

with open("src/data.ts", "w") as f:
    f.write(text)
