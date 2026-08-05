const parsed = {
   "1399": {
       id: "1399", type: "tv", last_season_watched: 1, last_episode_watched: 2,
       show_progress: {
           s1e2: { progress: { watched: 500, duration: 1000 } }
       }
   }
};
const newProgressData = {};
Object.keys(parsed).forEach(k => {
    let pct = 0;
    if (typeof parsed[k] === 'number') pct = parsed[k];
    else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
      const s = parsed[k].last_season_watched || 1;
      const e = parsed[k].last_episode_watched || 1;
      const epProg = parsed[k].show_progress[`s${s}e${e}`];
      if (epProg && epProg.progress) {
          const duration = epProg.progress.duration || 0;
          pct = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
      }
    }
    
    if (pct > (newProgressData[k] || 0) || !newProgressData[k]) newProgressData[k] = pct;
    if (!k.endsWith("-tv")) {
        if (pct > (newProgressData[k + "-tv"] || 0) || !newProgressData[k + "-tv"]) newProgressData[k + "-tv"] = pct;
    }
    if (k.endsWith("-tv")) {
        if (pct > (newProgressData[k.replace("-tv", "")] || 0) || !newProgressData[k.replace("-tv", "")]) newProgressData[k.replace("-tv", "")] = pct;
    }
});
console.log(newProgressData);
