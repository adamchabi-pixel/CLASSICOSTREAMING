import re

with open("src/data.ts", "r") as f:
    text = f.read()

replacements = {
    # John Wick
    '''description: "Un ancien tueur à gages légendaire sort de sa retraite pour traquer les truands qui ont assassiné son chiot, dernier cadeau inestimable de sa défunte épouse, et volé sa Mustang chérie."''': '''description: "A legendary former hitman comes out of retirement to track down the gangsters who killed his puppy, the priceless last gift from his late wife, and stole his beloved Mustang."''',
    '''tagline: "N'auriez-û pas dû toucher à son chien."''': '''tagline: "Should not have touched his dog."''',
    '''description: "John Wick est contraint de sortir à nouveau de sa retraite par un ancien associé qui souhaite s'emparer d'une cabale de tueurs internationaux. Lié par un serment de sang inviolable, John se rend à Rome."''': '''description: "John Wick is forced out of retirement again by a former associate plotting to seize control of an international assassins' guild. Bound by a blood oath, John travels to Rome."''',
    '''tagline: "Le serment de sang est inviolable."''': '''tagline: "The blood oath is inviolable."''',
    '''description: "Excommunié de la Grande Table et privé de tous ses droits, John Wick a sa tête mise à prix pour 14 millions de dollars. Une armée de tueurs est lancée à ses trousses à travers les rues de New York."''': '''description: "Excommunicated from the High Table and stripped of all services, John Wick has a $14 million bounty on his head. An army of assassins is on his trail through the streets of New York."''',
    '''tagline: "Si tu veux la paix, prépare la guerre."''': '''tagline: "If you want peace, prepare for war."''',
    '''description: "John Wick découvre le moyen de vaincre l'organisation criminelle de la Grande Table. Mais pour gagner sa liberté, il doit affronter un nouvel ennemi féroce doté d'alliances mondiales et transformer de vieux amis en redoutables adversaires."''': '''description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes."''',
    '''tagline: "Pas de quartier sur les marches du Sacré-Cœur."''': '''tagline: "No quarter on the steps of the Sacré-Cœur."''',

    # Indiana Jones
    '''description: "Indy est chargé d'une mission périlleuse par les services secrets américains : retrouver l'Arche d'Alliance, coffre contenant les Tables de la Loi, convoitée par les nazis car censée conférer des pouvoirs d'invincibilité militaire."''': '''description: "Indy is tasked with a perilous mission by US intelligence: to find the Ark of the Covenant, a chest containing the Tablets of the Law, coveted by the Nazis for its supposed military invincibility."''',
    '''tagline: "La quête de l'impossible commence ici."''': '''tagline: "The quest for the impossible starts here."''',
    '''description: "En Inde, Indiana Jones, un jeune garçon astucieux appelé Demi-Lune et une chanteuse de cabaret se retrouvent dans un village appauvri. Leurs habitants les supplient de retrouver une pierre sacrée mystique volée par un culte sanguinaire adepte de sacrifices humains."''': '''description: "In India, Indiana Jones, a clever young boy named Short Round, and a cabaret singer find themselves in an impoverished village. The locals beg them to retrieve a sacred mystical stone stolen by a bloodthirsty cult."''',
    '''tagline: "Une aventure d'une noirceur mystique absolue."''': '''tagline: "An adventure of absolute mystical darkness."''',
    '''description: "Indiana Jones part sur les traces de son père, le professeur Henry Jones, mystérieusement disparu alors qu'il recherchait le légendaire Saint Graal. Ensemble, le père et le fils s'unissent pour surmonter des épreuves millénaires."''': '''description: "Indiana Jones sets out on the trail of his father, Professor Henry Jones, who mysteriously disappeared while searching for the legendary Holy Grail. Together, father and son unite to overcome millennial trials."''',
    '''tagline: "Le Graal n'attend que les cœurs purs."''': '''tagline: "The Grail only awaits pure hearts."''',
    '''description: "En 1957, en pleine Guerre Froide, Indiana Jones est mêlé à un complot soviétique visant à décoder les secrets d'un mystérieux crâne de cristal découvert en Amazonie, lié à des civilisations disparues et d'autres dimensions."''': '''description: "In 1957, during the Cold War, Indiana Jones becomes entangled in a Soviet plot to uncover the secret behind a mysterious crystal skull discovered in the Amazon."''',
    '''tagline: "Le secret de l'Amazonie dépasse notre monde."''': '''tagline: "The secret of the Amazon transcends our world."''',
    '''description: "En 1969, sur fond de conquête spatiale, le célèbre archéologue se prépare à prendre sa retraite. Mais l'apparition de sa filleule Helena et d'un ancien nazi travaillant pour la NASA le replonge dans une course contre la montre temporelle."''': '''description: "In 1969, against the backdrop of the space race, the famous archaeologist prepares to retire. But the appearance of his goddaughter Helena and a former Nazi working for NASA plunges him back into a race against time."''',
    '''tagline: "Contre le temps, le voyage ultime commence."''': '''tagline: "Against time, the ultimate journey begins."''',

    # Tarantino
    '''description: "La vie de deux truands, d'un boxeur, de l'épouse d'un chef de gang et de deux braqueurs s'entremêlent dans quatre histoires de violence et de rédemption."''': '''description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption."''',
    '''tagline: "Pas de vrais noms, pas de quartier."''': '''tagline: "No real names, no quarter."''',
    '''description: "Une ancienne tueuse à gages, laissée pour morte le jour de ses noces, se réveille d'un coma de quatre ans avec un seul but : se venger de son ancien patron et de ses sbires."''': '''description: "A former assassin, left for dead on her wedding day, wakes from a four-year coma with one goal: to exact revenge on her former boss and his deadly squad."''',
    '''tagline: "La vengeance est un plat qui se mange froid."''': '''tagline: "Revenge is a dish best served cold."''',
    '''description: "La Mariée poursuit sa quête de vengeance mortelle contre son ancien patron, Bill, et les deux membres restants de son escadron de la mort."''': '''description: "The Bride continues her quest for deadly vengeance against her former boss, Bill, and the remaining two members of his assassination squad."''',
    '''tagline: "Le dernier chapitre de sa liste noire."''': '''tagline: "The final chapter of her blacklist."''',
    '''description: "Pendant la Seconde Guerre mondiale, un groupe de soldats juifs américains se joint à une propriétaire de cinéma française pour fomenter un complot visant à assassiner les dirigeants du Troisième Reich."''': '''description: "During World War II, a group of Jewish-American soldiers join a French theater owner in a plot to assassinate the leaders of the Third Reich."''',
    '''tagline: "Une réécriture explosive de la grande Histoire."''': '''tagline: "An explosive rewrite of great history."''',
    '''description: "Un esclave affranchi s'associe à un chasseur de primes allemand pour sauver sa femme des griffes d'un propriétaire de plantation brutal et sadique au Mississippi."''': '''description: "A freed slave joins forces with a German bounty hunter to save his wife from a brutal and sadistic plantation owner in Mississippi."''',
    '''tagline: "La liberté n'est pas négociable, elle s'arrache."''': '''tagline: "Freedom is not negotiable, it is snatched."''',
    '''description: "Dans le Wyoming d'après la guerre de Sécession, des chasseurs de primes cherchent un abri lors d'un blizzard et se retrouvent coincés dans une auberge de montagne avec de sombres inconnus."''': '''description: "In post-Civil War Wyoming, bounty hunters seek shelter during a blizzard and find themselves trapped in a mountain inn with dark strangers."''',
    '''tagline: "Huit menteurs. Aucun ne sortira indemne."''': '''tagline: "Eight liars. None will escape unscathed."''',
    '''description: "Six criminels professionnels, qui ne se connaissent pas, sont engagés par un parrain pour cambrioler un diamantaire. Le hold-up tourne au carnage sanglant et les rescapés se regroupent dans un entrepôt abandonné, suspectant un traître."''': '''description: "Six professional criminals, who do not know each other, are hired by a mob boss to rob a diamond merchant. The heist turns into a bloody carnage, and the survivors gather in an abandoned warehouse, suspecting a traitor."''',

    # Matrix
    '''description: "Un pirate informatique découvre par de mystérieux rebelles la vraie nature de sa réalité, contrôlée par des machines, et son rôle central dans la guerre pour sauver l'humanité."''': '''description: "A computer hacker learns from mysterious rebels about the true nature of his reality, controlled by machines, and his central role in the war to save humanity."''',
    '''tagline: "N'essayez pas de comprendre, ressentez-le."''': '''tagline: "Don't try to understand it, feel it."''',

    # Fast and Furious
    '''description: "Un flic infiltré de Los Angeles pénètre le milieu des courses de rue nocturnes à hauts risques pour démanteler un gang d'audacieux braqueurs de camions."''': '''description: "An undercover LA cop infiltrates the high-stakes underground street racing scene to dismantle a gang of daring truck hijackers."''',
    '''tagline: "Si vous avez ce qu'il faut, vous pouvez tout avoir."''': '''tagline: "If you have what it takes, you can have it all."''',
    '''description: "Brian O'Conner fait équipe avec son ami d'enfance Roman Pearce pour faire tomber un parrain de la drogue à Miami en échange du blanchiment de leur casier."''': '''description: "Brian O'Conner teams up with his childhood friend Roman Pearce to take down a drug lord in Miami in exchange for a clean record."''',
    '''tagline: "Trop rapide pour la police, trop furieux pour le monde."''': '''tagline: "Too fast for the police, too furious for the world."''',
    '''description: "Envoyé à Tokyo chez son père, Sean Boswell s'immerge dans l'univers clandestin et hyper-stylisé du drift de rue japonais."''': '''description: "Sent to Tokyo to live with his father, Sean Boswell immerses himself in the clandestine and hyper-stylized world of Japanese street drifting."''',
    '''tagline: "Bienvenue dans le berceau de la glisse."''': '''tagline: "Welcome to the cradle of drifting."''',
    '''description: "De retour à Los Angeles, Dominic Toretto et l'agent Brian O'Conner s'associent pour infiltrer de l'intérieur un impitoyable cartel mexicain de drogue."''': '''description: "Back in Los Angeles, Dominic Toretto and agent Brian O'Conner team up to infiltrate a ruthless Mexican drug cartel from within."''',
    '''tagline: "Nouveau modèle. Pièces d'origine."''': '''tagline: "New model. Original parts."''',
    '''description: "Toretto et sa famille de pilotes préparent le casse ultime de 100 millions de dollars à Rio, pourchassés par le colossal agent Luke Hobbs."''': '''description: "Toretto and his family of drivers plan the ultimate $100 million heist in Rio, pursued by the colossal agent Luke Hobbs."''',
    '''tagline: "La vitesse a son prix. La famille n'en a pas."''': '''tagline: "Speed has a price. Family does not."''',
    '''description: "L'agent Hobbs sollicite l'aide de l'équipe de Toretto pour traquer des mercenaires à Londres en échange de l'annulation complète de tous leurs délits."''': '''description: "Agent Hobbs enlists the help of Toretto's team to track down mercenaries in London in exchange for full pardons for their crimes."''',
    '''tagline: "Tous les chemins mènent au même carrefour."''': '''tagline: "All roads lead to the same crossroads."''',
    '''description: "L'équipe fait face à Deckard Shaw, un assassin impitoyable assoiffé de vengeance bien décidé à éliminer la famille Toretto, un par un."''': '''description: "The crew faces Deckard Shaw, a ruthless assassin out for revenge, determined to take out the Toretto family one by one."''',
    '''tagline: "Un dernier tour de piste pour la légende de Paul."''': '''tagline: "One last ride for Paul's legend."''',
    '''description: "Une cyber-terroriste mystérieuse manipule Dom pour qu'il trahisse sa propre famille, forçant l'équipe de survivants à coopérer avec Deckard Shaw."''': '''description: "A mysterious cyber-terrorist manipulates Dom into betraying his own family, forcing the surviving team to cooperate with Deckard Shaw."''',
    '''tagline: "Ne jamais tourner le dos à la famille."''': '''tagline: "Never turn your back on family."''',
    '''description: "Dom doit faire face aux secrets douloureux de son passé lorsque son frère Jakob, renié depuis longtemps et assassin de choc, reparaît."''': '''description: "Dom must face the painful secrets of his past when his long-estranged brother Jakob, a master assassin, resurfaces."''',
    '''tagline: "La justice accélère."''': '''tagline: "Justice is fast."''',
    '''description: "L'équipe de Dom est la cible de Dante Reyes, le fils rancunier d'un défunt baron de la drogue brésilien bien décidé à détruire tout ce à quoi Dom tient."''': '''description: "Dom's crew is targeted by Dante Reyes, the vengeful son of a deceased Brazilian drug lord determined to destroy everything Dom cares about."''',
    '''tagline: "La fin du chemin commence."''': '''tagline: "The end of the road begins."''',

    # The Godfather & Gangsters
    '''description: "Le patriarche vieillissant d'une dynastie du crime organisé transfère le contrôle de son empire clandestin à son fils réticent."''': '''description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."''',
    '''tagline: "Une offre qu'on ne peut pas refuser."''': '''tagline: "An offer you can't refuse."''',
    '''description: "L'histoire de Henry Hill et de sa vie au sein de la mafia, couvrant sa relation avec sa femme Karen Hill et ses partenaires mafieux Jimmy Conway et Tommy DeVito."''': '''description: "The story of Henry Hill and his life in the mafia, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito."''',
    '''tagline: "Aussi loin que je me souvienne, j'ai toujours voulu être un gangster."''': '''tagline: "As far back as I can remember, I always wanted to be a gangster."''',
    '''description: "En 1980, un immigrant cubain arrive à Miami sans rien et finit par devenir un puissant caïd de la drogue."''': '''description: "In 1980, a Cuban immigrant arrives in Miami with nothing and eventually becomes a powerful drug kingpin."''',
    '''tagline: "Le monde est à toi."''': '''tagline: "The world is yours."''',
    '''description: "L'histoire de la famille Corleone continue avec Vito Corleone construisant son empire et Michael Corleone le gérant dans les années 1950."''': '''description: "The story of the Corleone family continues with Vito Corleone building his empire and Michael Corleone managing it in the 1950s."''',
    '''tagline: "Gardez vos amis proches, mais vos ennemis encore plus proches."''': '''tagline: "Keep your friends close, but your enemies closer."''',
    '''description: "Michael Corleone tente de légitimer les affaires de sa famille, mais est rattrapé par les péchés de son passé."''': '''description: "Michael Corleone attempts to legitimize his family's business but is pulled back in by the sins of his past."''',
    '''tagline: "Juste au moment où je pensais être dehors... ils me ramènent dedans."''': '''tagline: "Just when I thought I was out... they pull me back in."''',
    '''description: "Frank Sheeran, un ancien combattant de la Seconde Guerre mondiale, escroc et tueur à gages, revient sur son passé."''': '''description: "Frank Sheeran, a WWII veteran, hustler, and hitman, looks back on his past."''',
    '''tagline: "J'ai entendu dire que tu peignais des maisons."''': '''tagline: "I heard you paint houses."''',
    '''description: "Un flic de New York est chargé de faire tomber le plus grand baron de la drogue de la ville."''': '''description: "A New York cop is tasked with taking down the city's biggest drug lord."''',
    '''tagline: "Il y a des flics pourris, et des gangsters honnêtes."''': '''tagline: "There are dirty cops, and honest gangsters."''',
    '''description: "L'histoire de l'ambition aveugle et de la cupidité qui ont mené à la chute d'un empire du jeu mafieux."''': '''description: "The story of the blind ambition and greed that led to the fall of a mafia gambling empire."''',
    '''tagline: "Personne ne reste éternellement au sommet."''': '''tagline: "No one stays at the top forever."''',

    # Se7en, Memento, Zodiac, Prisoners
    '''description: "Deux détectives, un vétéran et une recrue, traquent un tueur en série dont les crimes sont basés sur les sept péchés capitaux."''': '''description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives."''',
    '''tagline: "Qu'est-ce qu'il y a dans la boîte ?"''': '''tagline: "What's in the box?"''',
    '''description: "Un homme souffrant d'amnésie antérograde (perte de la mémoire à court terme) utilise des notes et des tatouages pour traquer le meurtrier de sa femme."''': '''description: "A man suffering from anterograde amnesia uses notes and tattoos to hunt for the man he thinks killed his wife."''',
    '''tagline: "Certains souvenirs sont meilleurs oubliés."''': '''tagline: "Some memories are best forgotten."''',
    '''description: "L'histoire vraie de la traque du tueur du Zodiaque, un meurtrier en série qui terrorisa la baie de San Francisco à la fin des années 60 et 70."''': '''description: "The true story of the hunt for the Zodiac Killer, a serial killer who terrorized the San Francisco Bay Area in the late 1960s and 70s."''',
    '''tagline: "Il n'y a pas de fin à l'obsession."''': '''tagline: "There is no end to obsession."''',
    '''description: "Lorsque la fille de Keller Dover est kidnappée avec son amie, il prend les choses en main alors que la police explore de multiples pistes sans succès."''': '''description: "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts."''',
    '''tagline: "Chaque moment compte."''': '''tagline: "Every moment counts."''',

    # Batman
    '''description: "Après s'être entraîné avec son mentor, Bruce Wayne entame son combat pour libérer Gotham City de la corruption."''': '''description: "After training with his mentor, Bruce Wayne begins his fight to free crime-ridden Gotham City from corruption."''',
    '''tagline: "Le mythe commence."''': '''tagline: "The myth begins."''',
    '''description: "Lorsque la menace connue sous le nom du Joker sème le chaos sur les habitants de Gotham, Batman doit accepter l'un des plus grands tests psychologiques et physiques de sa capacité à combattre l'injustice."''': '''description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."''',
    '''tagline: "Pourquoi cet air si sérieux ?"''': '''tagline: "Why so serious?"''',
    '''description: "Huit ans après les événements du Joker, le terroriste Bane force Bruce Wayne à reprendre du service en tant que Batman."''': '''description: "Eight years after the Joker's reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane."''',
    '''tagline: "La fin d'une légende."''': '''tagline: "The end of a legend."''',
    '''description: "Lorsqu'un tueur en série s'attaque à l'élite de Gotham avec une série d'intrigues sadiques, une piste d'indices cryptiques envoie le plus grand détective du monde dans une enquête."''': '''description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement."''',
    '''tagline: "Démasquez la vérité."''': '''tagline: "Unmask the truth."''',

    # Terminator
    '''description: "En 1984, un tueur cybernétique froid conçu par Skynet – le T-800 – est envoyé depuis l'an 2029 pour éliminer Sarah Connor, dont le futur fils John mènera victorieusement l'humanité face aux machines."''': '''description: "In 1984, a cold cybernetic assassin created by Skynet - the T-800 - is sent from 2029 to kill Sarah Connor, whose unborn son John will lead humanity to victory in a future war against the machines."''',
    '''tagline: "Je reviendrai."''': '''tagline: "I'll be back."''',
    '''description: "Un reprogrammé T-800 musclé est envoyé par la résistance humaine pour protéger l'enfance turbulente de John Connor contre un nouveau cyborg à métal liquide hautement avancé et presque indestructible : le T-1000."''': '''description: "A reprogrammed muscular T-800 is sent by the human resistance to protect a young John Connor from a highly advanced and nearly indestructible liquid metal cyborg: the T-1000."''',
    '''tagline: "Hasta la vista, baby."''': '''tagline: "Hasta la vista, baby."''',
    '''description: "John Connor vit désormais tapi à l'écart du monde pour échapper à toute menace. Malheureusement, Skynet parvient à envoyer la redoutable T-X, un agent assassin surpuissant, tandis qu'un T-850 vieillissant fait barrage."''': '''description: "John Connor now lives off the grid to avoid detection. Unfortunately, Skynet manages to send the formidable T-X, a superpowered assassin, while an aging T-850 attempts to protect him."''',
    '''tagline: "Le réveil de la fin du monde."''': '''tagline: "The awakening of the end of the world."''',
    '''description: "En 2018, après le cataclysme du Jugement Dernier, John Connor mène avec acharnement la résistance humaine. Il est confronté à Marcus Wright, un mystérieux condamné à mort cybernétique persuadé d'être resté humain."''': '''description: "In 2018, after the cataclysm of Judgment Day, John Connor relentlessly leads the human resistance. He is confronted by Marcus Wright, a mysterious cybernetic death row inmate who believes he is still human."''',
    '''tagline: "Le début de la fin pour Skynet."''': '''tagline: "The beginning of the end for Skynet."''',
    '''description: "En envoyant Kyle Reese en 1984 pour sauver Sarah, John déclenche une distorsion temporelle. Reese atterrit ainsi dans un passé fracturé où Sarah Connor, élevée par un T-800 protecteur, est déjà une combattante aguerrie."''': '''description: "By sending Kyle Reese back to 1984 to save Sarah, John triggers a temporal distortion. Reese arrives in a fractured past where Sarah Connor, raised by a protective T-800, is already a seasoned fighter."''',
    '''tagline: "Réinitialisez le futur."''': '''tagline: "Reset the future."''',
    '''description: "Près de trente ans après le salut mondial mené par Sarah Connor, une humaine augmentée débarque pour escorter une jeune ouvrière mexicaine traquée par un prototype de Terminator ultra-avancé séparable, le Rev-9."''': '''description: "Nearly thirty years after Sarah Connor saved the world, an augmented human arrives to protect a young Mexican factory worker hunted by a highly advanced, separable Terminator prototype, the Rev-9."''',
    '''tagline: "Bienvenue au lendemain du jour fatidique."''': '''tagline: "Welcome to the day after Judgment Day."''',

    # Star Wars
    '''description: "Trois ans après le début de la Guerre des Clones, Anakin Skywalker est tiraillé entre sa loyauté envers les Jedi et les tentations d'un pouvoir obscur proposé par le Chancelier Palpatine dans le but de sauver sa femme."''': '''description: "Three years into the Clone Wars, Anakin Skywalker is torn between his loyalty to the Jedi and the temptations of dark power offered by Chancellor Palpatine to save his wife."''',
    '''tagline: "La naissance tragique de Dark Vador."''': '''tagline: "The tragic birth of Darth Vader."''',
    '''description: "Un groupe de rebelles disparates s'unissent pour une mission suicide de renseignement militaire : voler les plans secrets de l'Étoile de la Mort, l'arme de destruction massive ultime de l'Empire."''': '''description: "A disparate group of rebels unite for a suicide military intelligence mission: steal the secret plans to the Death Star, the Empire's ultimate weapon of mass destruction."''',
    '''tagline: "Le vol audacieux qui déclencha l'espoir."''': '''tagline: "The daring heist that sparked hope."''',
    '''description: "Une nouvelle menace surgit des cendres de l'Empire : le Premier Ordre. Rey, une pilleuse d'épaves solitaire, s'associe à Finn, un stormtrooper déserteur, et Han Solo pour retrouver la trace du dernier maître Jedi, Luke Skywalker."''': '''description: "A new threat arises from the ashes of the Empire: the First Order. Rey, a solitary scavenger, teams up with Finn, a deserting stormtrooper, and Han Solo to track down the last Jedi master, Luke Skywalker."''',
    '''tagline: "Une nouvelle génération de héros face au Côté Obscur."''': '''tagline: "A new generation of heroes faces the Dark Side."''',
}

for fr, en in replacements.items():
    text = text.replace(fr, en)

with open("src/data.ts", "w") as f:
    f.write(text)

