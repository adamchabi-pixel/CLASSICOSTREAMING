const fs = require('fs');
const content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const targetStartStr = "  if (availableServers.length === 0 && !isMetadataLoaded) {";
const splitIdx = content.indexOf(targetStartStr);

if (splitIdx === -1) {
  console.log("Could not find target start string.");
  process.exit(1);
}

const beforeContent = content.substring(0, splitIdx);

const newRender = `  if (availableServers.length === 0 && !isMetadataLoaded) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] bg-black flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  // Find TMDB data for extra details
  const movieData = allMoviesData.find(m => m.id === movieId) || matchedMovie;
  const cast = movieData?.cast || [];
  const logo = movieData?.logoUrl;
  const hasLogo = !!logo;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-stone-100 flex flex-col select-none relative animate-in fade-in duration-300">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center opacity-10 blur-[120px]" style={{ backgroundImage: \`url(\${movieBackdrop || moviePoster || ''})\`}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
      </div>

      {/* AdGate Overlay */}
      {serverSelected && adClicks < 3 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
          <div className="max-w-md w-full bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-cinzel font-bold text-amber-500 mb-4 tracking-widest uppercase">Support Classico</h2>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed font-sans">
              Classico is free and will stay that way, but our servers cost a lot to maintain. The only way we can compensate is by including three ads per movie.
              <br /><br />
              <strong className="text-white">Please disable your ad-blocker to support us.</strong> Thank you immensely!
            </p>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 w-full mb-6">
              <p className="text-rose-400 text-[11px] font-mono uppercase tracking-wider">
                Don't click anything on the ads, just close the new tab.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try { window.open("https://omg10.com/4/11192957", "_blank"); } catch(err) {}
                setAdClicks(prev => prev + 1);
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4"
            >
              <span>Click Ad</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Progress</span>
              <span className="text-amber-500 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded">{adClicks}/3</span>
            </div>
          </div>
          <button
            onClick={() => setServerSelected(false)}
            className="absolute top-6 left-6 p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-all cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-16 flex flex-col xl:flex-row gap-8 min-h-[80vh]">
        
        {/* Left Column: Player & Info */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top Bar with Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleClosePlayer}
              className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-amber-500/20 hover:text-amber-500 text-white transition-all cursor-pointer border border-white/5 shadow-lg"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="text-amber-500/50">Lecture en cours</span>
              {movieData?.year && <span>• {movieData.year}</span>}
              {movieData?.duration && <span>• {movieData.duration}</span>}
            </div>
          </div>

          {/* The Player Box */}
          <div ref={viewportRef} className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.4)] border border-white/10 relative group">
            {!serverSelected ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                  <Play className="w-8 h-8 text-amber-500 ml-1" />
                </div>
                <p className="text-zinc-400 font-sans text-sm">Veuillez sélectionner un serveur à droite pour lancer le film.</p>
              </div>
            ) : (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-[45]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-amber-500/70 font-mono tracking-widest uppercase text-xs">Connexion au serveur...</p>
              </div>
            ) : null}

            {serverSelected && (playbackInfo?.iframeSrc || (!isLoading && !isStreamLoading && !playbackInfo?.isIframeEmbed)) ? (
              <div className={\`absolute inset-0 w-full h-full z-40 \${adClicks >= 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}\`}>
                {playbackInfo?.iframeSrc ? (
                  <iframe
                    key={\`\${playbackInfo.iframeSrc}-\${iframeKey}\`}
                    src={playbackInfo.iframeSrc}
                    allowFullScreen={true}
                    scrolling="no"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    onLoad={() => setIsIframeLoading(false)}
                    className="w-full h-full border-0 absolute inset-0"
                    style={{ overflow: 'hidden' }}
                    // @ts-ignore
                    webkitallowfullscreen="true"
                    // @ts-ignore
                    mozallowfullscreen="true"
                  ></iframe>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain absolute inset-0 bg-black"
                    playsInline
                    controls
                    autoPlay
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* Details Section Below Player */}
          <div className="mt-4 flex flex-col gap-8 bg-neutral-900/30 border border-white/5 p-6 md:p-8 rounded-2xl">
            {/* Title / Logo / Rating */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
              <div className="flex flex-col gap-4">
                {hasLogo ? (
                  <img src={logo} alt={movieTitle} className="h-16 md:h-24 w-auto object-contain object-left drop-shadow-xl" />
                ) : (
                  <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-white leading-tight uppercase tracking-wide">
                    {movieTitle}
                  </h1>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-zinc-400">
                  {movieData?.voteAverage && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <span className="text-amber-500">★</span> 
                      <span className="text-amber-500 font-bold">{movieData.voteAverage.toFixed(1)}</span>
                      <span className="text-amber-500/50 text-xs">/ 10</span>
                    </div>
                  )}
                  {movieData?.year && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{movieData.year}</span>}
                  {movieData?.duration && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{movieData.duration}</span>}
                  {movieData?.language && <span className="uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">{movieData.language}</span>}
                </div>
              </div>
            </div>

            {/* Synopsis */}
            {movieData?.description && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Synopsis</h3>
                <p className="text-zinc-300 text-base leading-relaxed max-w-4xl font-sans">
                  {movieData.description}
                </p>
              </div>
            )}

            {/* Cast */}
            {cast && cast.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Casting Principal</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {cast.slice(0, 10).map((actor: string, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-[80px] shrink-0">
                      <div className="w-[70px] h-[70px] rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                        <span className="text-xl font-cinzel text-zinc-500">{actor.charAt(0)}</span>
                      </div>
                      <span className="text-[11px] font-sans text-zinc-400 text-center leading-tight line-clamp-2">
                        {actor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Server Selection Sidebar */}
        <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6">
          
          {/* Servers Block */}
          {availableServers && availableServers.length > 0 && (
            <div className="flex flex-col gap-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-white font-sans font-semibold text-base flex items-center gap-2 tracking-wide">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Sources Disponibles
              </h3>

              <div className="grid grid-cols-1 gap-3 mt-2">
                {availableServers.map((server, idx) => {
                  let serverName = server.name.split(' (')[0];
                  // Ensure Server 1 is named Cinejoy
                  if (idx === 0) serverName = "Cinejoy";
                  
                  const isActive = serverSelected && activeServerIndex === idx;
                  return (
                    <button 
                      key={idx}
                      onClick={() => {
                        setActiveServerIndex(idx);
                        const isProxyStream = server.url.startsWith("/api/stream-proxy") || server.url.startsWith("/api/extract-stream-view");
                        let targetUrl = isProxyStream ? server.url : server.url.replace(/&t=\d+/, "");
                        if (!isProxyStream && savedRestoreTimeRef.current > 0) {
                            targetUrl += \`&t=\${Math.floor(savedRestoreTimeRef.current)}\`;
                        }
                        
                        if (isProxyStream) {
                          setServerSelected(true);
                          setIsLoading(true);
                          const searchParams = new URLSearchParams(server.url.split("?")[1]);
                          fetch(\`/api/extract-stream?\${searchParams.toString()}\`)
                            .then(res => res.json())
                            .then(data => {
                              setIsLoading(false);
                              if (data.success && data.extractedUrl) {
                                setPlaybackInfo({
                                  ...playbackInfo!,
                                  isIframeEmbed: false,
                                  iframeSrc: "",
                                  streamUrl: data.extractedUrl
                                });
                              } else {
                                alert(data.error || "Impossible d'extraire le flux brut pour ce film.");
                              }
                            })
                            .catch(() => {
                              setIsLoading(false);
                              alert("Erreur lors de la tentative d'extraction du flux.");
                            });
                        } else {
                          if (playbackInfo) {
                            setPlaybackInfo({
                              ...playbackInfo,
                              isIframeEmbed: true,
                              iframeSrc: targetUrl,
                              streamUrl: targetUrl
                            });
                          }
                          safeStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);
                          setIsIframeLoading(true);
                          setIframeKey(prev => prev + 1);
                        }
                      }}
                      className={\`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 group \${isActive ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-neutral-950 border-white/10 hover:bg-neutral-800 text-zinc-300'}\`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-20 pointer-events-none"></div>
                      )}
                      
                      <div className="flex items-center justify-between w-full relative z-10">
                        <div className="font-sans font-semibold text-sm flex items-center gap-3">
                          {isActive ? (
                            <Play className="w-4 h-4 text-black fill-black" />
                          ) : (
                            <Cast className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                          )}
                          <span className={isActive ? 'text-black' : 'text-zinc-200'}>{serverName}</span>
                        </div>
                        {server.stars && (
                          <div className={\`text-[10px] tracking-widest flex items-center shrink-0 \${isActive ? 'text-black/60' : 'text-amber-500/40'}\`}>
                            {'★'.repeat(server.stars)}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/CinemaPlayerView.tsx', beforeContent + newRender);
console.log("Replaced successfully!");
