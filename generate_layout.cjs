const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const startIndex = content.indexOf('{/* Main Layout Area */}');
const beforeLayout = content.slice(0, startIndex);

const newLayout = `{/* Main Layout Area */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-16">
        
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[240px_1fr_320px] 2xl:grid-cols-[280px_1fr_340px] gap-6 lg:gap-8">
          
          {/* Left Column: Cast */}
          <div className="order-3 lg:order-1 flex flex-col gap-6">
            {((movieData as any)?.castDetails?.length > 0 || cast.length > 0) && (
              <div className="bg-neutral-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                <h3 className="text-white font-sans font-semibold text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Users className="w-4 h-4 text-amber-500" /> Casting
                </h3>
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                  {(movieData as any)?.castDetails?.length > 0 ? (
                    (movieData as any).castDetails.map((actor: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0 transition-transform group-hover:scale-105">
                          {actor.imageUrl ? (
                            <img src={actor.imageUrl} alt={actor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-cinzel text-zinc-500">{actor.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-sans font-medium text-zinc-200 line-clamp-1">
                            {actor.name}
                          </span>
                          {actor.role && (
                            <span className="text-[11px] font-sans text-zinc-500 line-clamp-1">
                              {actor.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    cast.slice(0, 10).map((actor: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0 transition-transform group-hover:scale-105">
                          <span className="text-sm font-cinzel text-zinc-500">{actor.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-sans font-medium text-zinc-200 line-clamp-2">
                          {actor}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Title, Player, Synopsis */}
          <div className="order-1 lg:order-2 flex flex-col gap-6 min-w-0">
            
            {/* Title & Meta */}
            <div className="flex flex-col items-center text-center gap-4 bg-neutral-900/20 py-6 px-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              {hasLogo ? (
                <img src={logo} alt={movieTitle} className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-xl" />
              ) : (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-cinzel font-bold text-white leading-tight uppercase tracking-wide">
                  {movieTitle}
                </h1>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-sans text-zinc-400">
                {movieData?.voteAverage && (
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <span className="text-amber-500 text-xs">★</span> 
                    <span className="text-amber-500 font-bold text-xs">{movieData.voteAverage.toFixed(1)}</span>
                  </div>
                )}
                {movieData?.director && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 uppercase text-[9px] font-mono tracking-widest">Réal.</span>
                    <span className="text-white font-medium text-xs">{movieData.director}</span>
                  </div>
                )}
                {movieData?.genre && movieData.genre.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {movieData.genre.slice(0, 3).map((g: string, idx: number) => (
                      <span key={idx} className="bg-white/5 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider text-zinc-300 border border-white/10">{g}</span>
                    ))}
                  </div>
                )}
                {movieData?.year && <span className="bg-white/5 px-2 py-0.5 rounded-md text-xs border border-white/10">{movieData.year}</span>}
                {movieData?.duration && <span className="bg-white/5 px-2 py-0.5 rounded-md text-xs border border-white/10">{movieData.duration}</span>}
                {movieData?.language && <span className="uppercase bg-white/5 px-2 py-0.5 rounded-md text-xs border border-white/10">{movieData.language}</span>}
              </div>
            </div>

            {/* Player Container */}
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
              <div ref={viewportRef} className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 relative group">
                {!serverSelected ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                      <Play className="w-6 h-6 text-amber-500 ml-1" />
                    </div>
                    <p className="text-zinc-400 font-sans text-sm">Veuillez sélectionner un serveur.</p>
                  </div>
                ) : (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-[45]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                    <p className="text-amber-500/70 font-mono tracking-widest uppercase text-xs">Connexion...</p>
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
              
              {/* Synopsis */}
              {movieData?.description && (
                <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Synopsis</h3>
                  <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-sans">
                    {movieData.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Server Selection Sidebar */}
          <div className="order-2 lg:order-3 w-full xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col gap-6">
            
            {/* Servers Block */}
            {availableServers && availableServers.length > 0 && (
              <div className="flex flex-col gap-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-sans font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Sources
                  </h3>
                  <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-white/10">
                    <button onClick={() => { setLanguage("en"); setActiveServerIndex(0); }} className={"w-7 h-5 rounded flex items-center justify-center transition-all " + (language === "en" ? "bg-white/20 ring-1 ring-white/30" : "opacity-50 hover:opacity-100")} title="Anglais">
                      <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-5 h-3 object-cover rounded-sm" />
                    </button>
                    <button onClick={() => { setLanguage("fr"); setActiveServerIndex(0); }} className={"w-7 h-5 rounded flex items-center justify-center transition-all " + (language === "fr" ? "bg-white/20 ring-1 ring-white/30" : "opacity-50 hover:opacity-100")} title="Français">
                      <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-5 h-3 object-cover rounded-sm" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-2">
                  {availableServers.map((server, idx) => {
                    let serverName = server.name.split(' (')[0];
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
                        className={\`relative overflow-hidden p-3 rounded-xl border transition-all duration-300 group flex items-center justify-between \${isActive ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-neutral-950 border-white/10 hover:bg-neutral-800 text-zinc-300 hover:border-amber-500/30'}\`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${isActive ? 'bg-black/10' : 'bg-white/5 group-hover:bg-amber-500/20 group-hover:text-amber-500'}\`}>
                            <Play className="w-4 h-4 ml-0.5 text-inherit" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold font-sans text-sm">{serverName}</span>
                            <span className={\`text-[10px] uppercase tracking-widest font-mono \${isActive ? 'text-black/60' : 'text-zinc-500'}\`}>
                              {server.name.includes('(') ? server.name.split(' (')[1].replace(')', '') : 'Server'}
                            </span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-black">Actif</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/CinemaPlayerView.tsx', beforeLayout + newLayout);
