fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items/d6922275301a010ed3a6c2cbf5e8991e?api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("Folder name:", d.Name);
});
