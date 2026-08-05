const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const targetStart = "interface ClassificationResult {";
const targetEnd = "return { confidence: \"none\" };\n}";

if (app.includes(targetStart) && app.includes(targetEnd)) {
    const startIndex = app.indexOf(targetStart);
    const endIndex = app.indexOf(targetEnd) + targetEnd.length;
    const replacement = `interface ClassificationResult {
  sagaIds?: string[];
  franchiseId?: string;
  confidence: "high" | "low" | "none";
}

function classifyMovie(
  title: string, 
  originalTitle?: string, 
  director?: string, 
  genre?: string[],
  studios?: string[]
): ClassificationResult {
  if (!title) return { confidence: "none" };
  const t = title.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim();
  const ot = originalTitle ? originalTitle.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim() : "";
  const d = director ? director.toLowerCase() : "";

  const isCasinoOnly = (t === "casino" || ot === "casino") && !t.includes("royale") && !ot.includes("royale");
  
  const sagaIds = [];
  
  if (d.includes("quentin tarantino")) sagaIds.push("tarantino-collection");
  if (d.includes("christopher nolan")) sagaIds.push("christopher-nolan");
  if (d.includes("frank darabont")) sagaIds.push("frank-darabont");
  if (d.includes("martin scorsese")) sagaIds.push("martin-scorsese");

  const swKeywords = [
    "star wars", "guerre des etoiles", "la menace fantome", "phantom menace", "clones", "revanche des sith",
    "revenge of the sith", "un nouvel espoir", "new hope", "empire contre attaque", "empire strikes back",
    "retour du jedi", "return of the jedi", "reveil de la force", "force awakens", "derniers jedi", "last jedi",
    "ascension de skywalker", "rise of skywalker", "rogue one", "solo a star wars"
  ];
  if (swKeywords.some(kw => t.includes(kw) || ot.includes(kw)) || studios?.some(s => /lucasfilm/i.test(s))) {
    sagaIds.push("star-wars");
  }

  const bondKeywords = [
    "007", "james bond", "dr no", "dr. no", "bons baisers de russie", "from russia with love",
    "goldfinger", "operation tonnerre", "thunderball", "on ne vit que deux fois", "you only live twice",
    "au service secret de sa majeste", "on her majesty's secret service",
    "les diamants sont eternels", "diamonds are forever", "vivre et laisser mourir", "live and let die",
    "l homme au pistolet d or", "the man with the golden gun", "l espion qui m aimait", "the spy who loved me",
    "moonraker", "rien que pour vos yeux", "for your eyes only", "octopussy",
    "dangereusement votre", "a view to a kill", "tuer n est pas jouer", "the living daylights",
    "permis de tuer", "licence to kill", "goldeneye", "demain ne meurt jamais", "tomorrow never dies",
    "le monde ne suffit pas", "the world is not enough", "meurs un autre jour", "die another day",
    "casino royale", "quantum of solace", "skyfall", "spectre", "mourir peut attendre", "no time to die"
  ];
  if (bondKeywords.some(kw => t === kw || ot === kw || t.includes(\` \${kw}\`) || t.startsWith(\`\${kw} \`) || ot.includes(\` \${kw}\`) || ot.startsWith(\`\${kw} \`))) {
    if (!isCasinoOnly) sagaIds.push("james-bond");
  }

  if (t.includes("batman") || ot.includes("batman") || t.includes("the dark knight") || ot.includes("the dark knight")) sagaIds.push("the-batman");
  if (t.includes("godzilla") || ot.includes("godzilla")) sagaIds.push("godzilla");
  if (t.includes("jurassic park") || ot.includes("jurassic park") || t.includes("jurassic world") || ot.includes("jurassic world")) sagaIds.push("jurassic-park");

  if (/\\bjohn wick\\b/i.test(title) || /\\bjohn wick\\b/i.test(originalTitle || "")) sagaIds.push("john-wick");
  
  const indianaKeywords = ["indiana jones", "les aventuriers de l arche perdue", "raiders of the lost ark", "temple maudit", "temple of doom", "derniere croisade", "last crusade", "royaume du crane de cristal", "crystal skull", "cadran de la destinee", "dial of destiny"];
  if (indianaKeywords.some(kw => t.includes(kw) || ot.includes(kw))) sagaIds.push("indiana-jones");

  const isRockyKeyword = /\\brocky\\b/i.test(title) || /\\brocky\\b/i.test(originalTitle || "");
  const isCreed = /\\bcreed\\b/i.test(title) || /\\bcreed\\b/i.test(originalTitle || "");
  const notRockyHorror = !t.includes("horror") && !t.includes("picture show");
  if ((isRockyKeyword && notRockyHorror) || isCreed) sagaIds.push("rocky");

  if (/\\bterminator\\b/i.test(title) || /\\bterminator\\b/i.test(originalTitle || "")) sagaIds.push("terminator");
  
  let franchiseId = undefined;
  if (/\\bmatrix\\b/i.test(title) || /\\bmatrix\\b/i.test(originalTitle || "")) franchiseId = "matrix";

  const lotrKeywords = ["lord of the rings", "seigneur des anneaux", "la communaute de l anneau", "fellowship of the ring", "les deux tours", "the two towers", "le retour du roi", "return of the king", "le hobbit", "the hobbit", "un voyage inattendu", "unexpected journey", "la desolation de smaug", "desolation of smaug", "la bataille des cinq armees", "battle of the five armies"];
  if (lotrKeywords.some(kw => t.includes(kw) || ot.includes(kw))) franchiseId = "lord-of-the-rings";

  const hpKeywords = ["harry potter", "a l ecole des sorciers", "sorcerer's stone", "philosopher's stone", "chambre des secrets", "chamber of secrets", "prisonnier d azkaban", "prisoner of azkaban", "coupe de feu", "goblet of fire", "ordre du phenix", "order of the phoenix", "prince de sang mele", "half-blood prince", "reliques de la mort", "deathly hallows"];
  if (hpKeywords.some(kw => t.includes(kw) || ot.includes(kw))) franchiseId = "harry-potter";

  const isMarvel = /\\b(avengers|iron man|captain america|thor|hulk|black widow|black panther|doctor strange|spider-man|guardians of the galaxy|ant-man|marvel)\\b/i.test(title) || /\\b(avengers|iron man|captain america|thor|hulk|black widow|black panther|doctor strange|spider-man|guardians of the galaxy|ant-man|marvel)\\b/i.test(originalTitle || "");
  const notSpiderVerse = !t.includes("spider-verse") && !t.includes("into the spider-verse") && !t.includes("across the spider-verse");
  if (isMarvel && notSpiderVerse && !t.includes("venom") && !t.includes("morbius") && !t.includes("x-men") && !t.includes("deadpool") && !t.includes("wolverine") && !t.includes("logan") && !t.includes("fantastic four")) {
    franchiseId = "marvel-mcu";
  }

  const isPirates = /\\b(pirates of the caribbean|pirates des caraibes)\\b/i.test(title) || /\\b(pirates of the caribbean|pirates des caraibes)\\b/i.test(originalTitle || "");
  if (isPirates) franchiseId = "pirates-caribbean";

  const isFast = /\\b(fast and furious|fast & furious|furious 7|fast 5|fast x|the fate of the furious|hobbs and shaw|fast five)\\b/i.test(title) || /\\b(fast and furious|fast & furious|furious 7|fast 5|fast x|the fate of the furious|hobbs and shaw|fast five)\\b/i.test(originalTitle || "");
  if (isFast) franchiseId = "fast-and-furious";

  if (sagaIds.length > 0 || franchiseId) {
    return { sagaIds, franchiseId, confidence: "high" };
  }

  return { confidence: "none" };
}`;
    
    app = app.substring(0, startIndex) + replacement + app.substring(endIndex);
    
    // Now we must fix getDynamicSagaId
    app = app.replace(/function getDynamicSagaId\(m: Movie\): string \| null \{[\s\S]*?return null;\n\}/, 
`function getDynamicSagaIds(m: Movie): string[] {
  const result = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
  if (result.confidence === "high" && result.sagaIds) {
    return result.sagaIds;
  }
  return [];
}`);

    // Update isJamesBond helper
    app = app.replace(/return result.confidence === "high" && result.sagaId === "james-bond";/, 
`return result.confidence === "high" && result.sagaIds && result.sagaIds.includes("james-bond");`);

    // Update the loops to allow multiple sagas
    app = app.replace(/const sagaId = getDynamicSagaId\(jf\);\n\s*if \(sagaId === collection.id\) \{/g,
`const sagaIds = getDynamicSagaIds(jf);
          if (sagaIds.includes(collection.id)) {`);

    fs.writeFileSync('src/App.tsx', app);
    console.log("Success patching classifyMovie to arrays");
} else {
    console.log("Failed to find target limits");
}
