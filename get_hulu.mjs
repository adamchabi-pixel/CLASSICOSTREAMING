const titles = ['Hulu_Logo.svg', 'Hulu_logo.svg', 'Hulu_(2014)_Logo.svg'];
for (const title of titles) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${title}&prop=imageinfo&iiprop=url&format=json`;
  fetch(url).then(r=>r.json()).then(d=>{
    const pages = d.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1') {
      console.log(title, pages[pageId].imageinfo[0].url);
    }
  });
}
