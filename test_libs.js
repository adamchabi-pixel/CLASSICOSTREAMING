fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Library/MediaFolders?api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("Libraries:", d.Items.map(i => i.Name));
});
