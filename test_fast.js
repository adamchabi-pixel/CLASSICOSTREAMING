fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&includeItemTypes=Movie&fields=ParentId&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  const m = d.Items.find(i => i.Name === "2 Fast 2 Furious");
  console.log("2 Fast 2 Furious ParentId:", m ? m.ParentId : "not found");
});
