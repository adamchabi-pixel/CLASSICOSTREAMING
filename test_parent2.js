fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&searchTerm=white+chicks&fields=Path,ParentId&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  const m = d.Items[0];
  console.log("Name:", m.Name);
  console.log("ParentId:", m.ParentId);
  console.log("Path:", m.Path);
});
