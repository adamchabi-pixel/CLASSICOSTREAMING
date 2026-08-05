fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&searchTerm=white+chicks&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  if (d.Items && d.Items.length > 0) {
    console.log("Raw item type:", d.Items[0].Type);
  } else {
    console.log("Not found in raw search");
  }
}).catch(console.error);
