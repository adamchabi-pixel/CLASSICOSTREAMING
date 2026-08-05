fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&Filters=IsNotFolder&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("With IsNotFolder:", d.Items.length);
  console.log("White Chicks?", d.Items.some(i => i.Name === "White Chicks"));
});
