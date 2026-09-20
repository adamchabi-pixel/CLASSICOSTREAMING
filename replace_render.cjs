const fs = require('fs');
const content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const targetStartStr = "  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {";
const splitIdx = content.indexOf(targetStartStr);

if (splitIdx === -1) {
  console.log("Could not find target start string.");
  process.exit(1);
}

const beforeContent = content.substring(0, splitIdx);

const newRender = `  if (availableServers.length === 0 && !isMetadataLoaded) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-black text-stone-100 flex flex-col select-none relative animate-in fade-in duration-300">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-[100px]" style={{ backgroundImage: \`url(\${movieBackdrop || moviePoster || ''})\`}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/95 to-black"></div>
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
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col xl:flex-row gap-8 min-h-[80vh]">
        
        {/* Left Column: Player & Info */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Back button & Title area */}
          <div className="flex items-start gap-4">
            <button
              onClick={handleClosePlayer}
              className="mt-1 shrink-0 p-2.5 rounded-full bg-neutral-900/80 hover:bg-amber-500/20 hover:text-amber-500 text-white transition-all cursor-pointer border border-white/10 shadow-lg"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 leading-tight uppercase tracking-wide">
                {movieTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-widest text-amber-500/70">
                {(matchedMovie?.releaseDate || matchedMovie?.year) && (
                  <span>{matchedMovie?.releaseDate ? new Date(matchedMovie.releaseDate).getFullYear() : matchedMovie?.year}</span>
                )}
                {matchedMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> {matchedMovie.rating}
                  </span>
                )}
                {movieDuration && <span>{movieDuration}</span>}
              </div>
            </div>
          </div>

          {/* The Player Box */}
          <div ref={viewportRef} className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-amber-500/20 relative group">
            {!serverSelected ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
                <Play className="w-16 h-16 text-amber-500/30 mb-4" />
                <p className="text-amber-500/70 font-cinzel tracking-widest uppercase text-sm">Select a server to begin</p>
              </div>
            ) : (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-[45]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-amber-500/70 font-mono tracking-widest uppercase text-xs">Connecting to server...</p>
              </div>
            ) : null}

            {serverSelected && (playbackInfo?.iframeSrc || (!isLoading && !isStreamLoading && !playbackInfo?.isIframeEmbed)) ? (
              <div className={\`absolute inset-0 w-full h-full z-40 \${adClicks >= 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}\`}>
                {playbackInfo?.iframeSrc ? (
                  <iframe
                    key={\`\${playbackInfo.iframeSrc}-\${iframeKey}\`}
                    src={playbackInfo.iframeSrc}
                    allowFullScreen={true}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    onLoad={() => setIsIframeLoading(false)}
                    className="w-full h-full border-0 absolute inset-0"
                    // @ts-ignore
                    webkitallowfullscreen="true"
                    // @ts-ignore
                    mozallowfullscreen="true"
                  ></iframe>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain absolute inset-0"
                    playsInline
                    controls
                    autoPlay
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* Optional: Movie Description under the player */}
          {matchedMovie?.description && (
            <p className="text-zinc-400 text-sm leading-relaxed max-w-4xl font-sans mt-2">
              {matchedMovie.description}
            </p>
          )}
        </div>

        {/* Right Column: Server Selection Sidebar */}
        <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6">
          
          {/* Servers Block */}
          {availableServers && availableServers.length > 0 && (
            <div className="flex flex-col gap-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-amber-500 font-cinzel font-bold text-lg flex items-center gap-2 uppercase tracking-widest">
                <Cast className="w-5 h-5" />
                Servers
              </h3>
              
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
                <div className="text-amber-500 text-lg leading-none mt-0.5">⚠️</div>
                <p className="text-[11px] text-amber-500/80 leading-relaxed font-sans">
                  We recommend using an <strong>adblocker</strong> (like uBlock Origin) for the best experience on external servers.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mt-2">
                {availableServers.map((server, idx) => {
                  const serverName = server.name.split(' (')[0];
                  const serverDesc = server.name.includes('(') ? server.name.split(' (')[1].replace(')', '') : '';
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
                      className={\`p-3.5 rounded-xl border flex flex-col gap-1 items-start text-left transition-all group \${isActive ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-neutral-950/50 border-white/5 hover:bg-neutral-800 hover:border-amber-500/30'}\`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={\`font-sans font-semibold text-sm flex items-center gap-2.5 \${isActive ? 'text-amber-500' : 'text-zinc-200 group-hover:text-amber-400'}\`}>
                          <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${isActive ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-neutral-600'}\`}></div>
                          {serverName}
                        </div>
                        {server.stars && <div className="text-amber-500/60 text-[10px] tracking-widest flex items-center shrink-0">{'★'.repeat(server.stars)}</div>}
                      </div>
                      {serverDesc && (
                        <div className={\`text-[10px] mt-0.5 leading-snug pl-4 \${isActive ? 'text-amber-500/70' : 'text-zinc-500 group-hover:text-zinc-400'}\`}>
                          {serverDesc}
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
  );
}
`;

fs.writeFileSync('src/components/CinemaPlayerView.tsx', beforeContent + newRender);
console.log("Replaced successfully!");
