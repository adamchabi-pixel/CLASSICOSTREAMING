fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?ParentId=d6922275301a010ed3a6c2cbf5e8991e&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r => r.json()).then(d => {
  console.log("Items in d69...:", d.Items.length);
  console.log("Sample:", d.Items[0] ? d.Items[0].Name : "None");
});
