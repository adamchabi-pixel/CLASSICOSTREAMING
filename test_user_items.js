fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/193595ef602d4f2887df0255f8cd2516/Items?recursive=true&includeItemTypes=Movie&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("User Items length:", d.Items.length);
  console.log("White Chicks?", d.Items.some(i => i.Name === "White Chicks"));
});
