fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&includeItemTypes=Movie&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("Total:", d.Items.length);
});
