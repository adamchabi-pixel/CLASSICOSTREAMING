fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?ParentId=d6922275301a010ed3a6c2cbf5e8991e&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  const m1 = d.Items.find(i => i.Name === "2 Fast 2 Furious");
  const m2 = d.Items.find(i => i.Name === "White Chicks");
  console.log("2 Fast 2 Furious Keys:", Object.keys(m1).join(", "));
  console.log("White Chicks Keys:", Object.keys(m2).join(", "));
  
  // Diff their fields
  for (let key of Object.keys(m1)) {
    if (m1[key] !== m2[key] && typeof m1[key] !== 'object' && key !== 'Id' && key !== 'Name' && key !== 'RunTimeTicks' && key !== 'DateCreated' && key !== 'ProductionYear' && key !== 'CommunityRating') {
      console.log(`Diff in ${key}: Fast=${m1[key]} vs White=${m2[key]}`);
    }
  }
});
