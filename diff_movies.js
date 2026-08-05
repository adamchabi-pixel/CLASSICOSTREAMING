Promise.all([
  fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?recursive=true&includeItemTypes=Movie&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r=>r.json()),
  fetch("https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/193595ef602d4f2887df0255f8cd2516/Items?recursive=true&includeItemTypes=Movie&api_key=a2aac09e434e4bcc897c1b181ca197eb").then(r=>r.json())
]).then(([global, user]) => {
  const gNames = global.Items.map(i => i.Name);
  const uNames = user.Items.map(i => i.Name);
  const inGNotU = gNames.filter(n => !uNames.includes(n));
  const inUNotG = uNames.filter(n => !gNames.includes(n));
  console.log("In Global NOT User:", inGNotU);
  console.log("In User NOT Global:", inUNotG);
});
