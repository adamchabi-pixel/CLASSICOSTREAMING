const fs = require('fs');

let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');
const startIndex = content.indexOf('{/* Main Layout Area */}');
const beforeLayout = content.slice(0, startIndex);

const newLayout = `{/* Main Layout Area */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-16">
        
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleClosePlayer}
            className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors font-sans text-sm uppercase tracking-wider"
            title="Retour"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-10 justify-center items-start">
          
          {/* Left Column: Cast */}
          <div className="w-full xl:w-[260px] shrink-0 order-3 xl:order-1 flex flex-col gap-4">
            <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest border-b border-white/5 pb-3">
              Casting Principal
            </h3>
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {((movieData as any)?.castDetails?.length > 0) ? (
                (movieData as any).castDetails.map((actor: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {actor.imageUrl ? (
                        <img src={actor.imageUrl} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-cinzel text-zinc-600">{actor.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-sans text-zinc-300 line-clamp-1">{actor.name}</span>
                      {actor.role && (
                        <span className="text-[11px] font-sans text-zinc-600 line-clamp-1">{actor.role}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                cast.slice(0, 10).map((actor: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 flex items-center justify-center">
                      <span className="text-sm font-cinzel text-zinc-600">{actor.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-sans text-zinc-300 line-clamp-2">{actor}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Center Column: Title, Player, Synopsis */}
          <div className="w-full xl:max-w-[800px] flex-1 order-1 xl:order-2 flex flex-col items-center">
            
            {/* Title & Meta Above Player */}
            <div className="w-full flex flex-col items-center text-center gap-3 mb-6">
              {hasLogo ? (
                <img src={logo} alt={movieTitle} className="h-10 md:h-14 w-auto object-contain drop-shadow-md" />
              ) : (
                <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-white tracking-wide uppercase">
                  {movieTitle}
                </h1>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-wider font-sans text-zinc-500">
                {movieData?.voteAverage && (
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span> 
                    <span className="text-amber-500/80">{movieData.voteAverage.toFixed(1)}</span>
                  </div>
                )}
                {movieData?.year && <span>{movieData.year}</span>}
                {movieData?.duration && <span>{movieData.duration}{String(movieData.duration).includes('m') ? '' : 'm'}</span>}
                {movieData?.director && <span className="text-zinc-400">RÉAL. {movieData.director}</span>}
              </div>
            </div>

            {/* Player Container */}
            <div className="w-full flex flex-col gap-6">
              <div ref={viewportRef} className="w-full aspect-video bg-[#050505] rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
                {!serverSelected ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                      <Play className="w-6 h-6 text-zinc-600 ml-1" />
                    </div>
                    <p className="text-zinc-600 font-sans text-sm">Sélectionnez une source.</p>
                  </div>
                ) : (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-[45]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                    <p className="text-amber-500/50 font-mono tracking-widest uppercase text-[10px]">Connexion...</p>
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
              
              {/* Synopsis Below Player */}
              {movieData?.description && (
                <div className="w-full mt-4 px-2">
                  <p className="text-zinc-400 text-sm leading-relaxed font-sans text-center max-w-3xl mx-auto">
                    {movieData.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Server Selection Sidebar */}
          <div className="w-full xl:w-[260px] shrink-0 order-2 xl:order-3 flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse"></div>
                Sources
              </h3>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setLanguage("en"); setActiveServerIndex(0); }} className={"w-5 h-3.5 rounded flex items-center justify-center transition-all " + (language === "en" ? "opacity-100 ring-1 ring-white/30" : "opacity-30 hover:opacity-100")} title="Anglais">
                  <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-full h-full object-cover rounded-sm" />
                </button>
                <button onClick={() => { setLanguage("fr"); setActiveServerIndex(0); }} className={"w-5 h-3.5 rounded flex items-center justify-center transition-all " + (language === "fr" ? "opacity-100 ring-1 ring-white/30" : "opacity-30 hover:opacity-100")} title="Français">
                  <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-full h-full object-cover rounded-sm" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {availableServers && availableServers.length > 0 ? (
                availableServers.map((server, idx) => {
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
                      className={\`w-full flex items-center justify-between py-2.5 px-3 rounded-lg border transition-all duration-200 group \${isActive ? 'bg-amber-500/10 border-amber-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}\`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className={\`w-3.5 h-3.5 \${isActive ? 'text-amber-500 fill-amber-500' : 'text-zinc-600 group-hover:text-amber-500'}\`} />
                        <span className={\`text-sm font-sans \${isActive ? 'text-amber-500 font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}\`}>{serverName}</span>
                      </div>
                      <span className={\`text-[9px] uppercase tracking-widest font-mono \${isActive ? 'text-amber-500/50' : 'text-zinc-700'}\`}>
                        {server.name.includes('(') ? server.name.split(' (')[1].replace(')', '') : 'Server'}
                      </span>
                    </button>
                  )
                })
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/CinemaPlayerView.tsx', beforeLayout + newLayout);
