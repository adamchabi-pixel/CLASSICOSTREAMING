fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?ParentId=07d73cc974ef968db50e92bb81e13dae&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("07d7... size:", d.Items.length);
});
