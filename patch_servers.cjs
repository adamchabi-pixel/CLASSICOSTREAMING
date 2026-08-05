const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// 1. Change availableServers type
file = file.replace(
  `const [availableServers, setAvailableServers] = useState<{name: string, url: string}[]>([]);`,
  `const [availableServers, setAvailableServers] = useState<{name: string, url: string, stars?: number}[]>([]);`
);

// 2. Change first Block of newServers
const block1Target = `const newServers = [
              { name: "Server 1 ⭐", url: iframeUrlVideasy },
              { name: "Server 2", url: iframeUrl111 },
              { name: "Server 3", url: iframeUrlPeach },
              { name: "Server 4 (CinemaOS)", url: iframeUrlCinemaos }
            ];`;
const block1Replace = `const newServers = [
              { name: "Server 1", url: iframeUrlCinemaos, stars: 3 },
              { name: "Server 2", url: iframeUrlVideasy, stars: 2 },
              { name: "Server 3", url: iframeUrlPeach, stars: 2 },
              { name: "Server 4", url: iframeUrl111, stars: 1 }
            ];`;
file = file.replace(block1Target, block1Replace);

// 3. Change second Block of newServers
const block2Target = `const srvs = [
                      { name: "Server 1 ⭐", url: u3 },
                      { name: "Server 2", url: u2 },
                      { name: "Server 3", url: u1 },
                      { name: "Server 4 (CinemaOS)", url: u4 }
                    ];`;
const block2Replace = `const srvs = [
                      { name: "Server 1", url: u4, stars: 3 },
                      { name: "Server 2", url: u3, stars: 2 },
                      { name: "Server 3", url: u1, stars: 2 },
                      { name: "Server 4", url: u2, stars: 1 }
                    ];`;
file = file.replace(block2Target, block2Replace);

// 4. Render stars in the main list view
file = file.replace(
  `<span className={\`font-medium \${idx === 0 ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}\`}>{server.name}</span>`,
  `<span className={\`font-medium \${idx === 0 ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}\`}>
                    {server.name}
                    {server.stars && <span className="ml-2 text-amber-500">{'★'.repeat(server.stars)}</span>}
                  </span>`
);

// 5. Render stars in the selected menu top
file = file.replace(
  `<span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{availableServers[activeServerIndex]?.name || 'Server'}</span>`,
  `<span className="text-[10px] sm:text-xs font-medium whitespace-nowrap flex items-center gap-1">
                  {availableServers[activeServerIndex]?.name || 'Server'}
                  {availableServers[activeServerIndex]?.stars && <span className="text-amber-500">{'★'.repeat(availableServers[activeServerIndex]?.stars || 0)}</span>}
                </span>`
);

// 6. Render stars in the dropdown
file = file.replace(
  `{server.name}
                      </button>`,
  `{server.name}
                        {server.stars && <span className="ml-auto text-amber-500 tracking-widest text-[10px]">{'★'.repeat(server.stars)}</span>}
                      </button>`
);

// 7. CinemaOS loading timeout
const onLoadTarget = `onLoad={() => {
              const isPeach = playbackInfo.iframeSrc?.includes('peachify.pro');
              if (!isPeach) {
                setIsIframeLoading(false);
              } else {
                // Safety timeout in case 'play' event never fires from Peachify
                setTimeout(() => setIsIframeLoading(false), 800);
              }
            }}`;
const onLoadReplace = `onLoad={() => {
              const isPeach = playbackInfo.iframeSrc?.includes('peachify.pro');
              const isCinemaos = playbackInfo.iframeSrc?.includes('cinemaos.live');
              if (isCinemaos) {
                // Wait 4 seconds for CinemaOS to load its internal servers to hide it behind our loading screen
                setTimeout(() => setIsIframeLoading(false), 4500);
              } else if (!isPeach) {
                setIsIframeLoading(false);
              } else {
                // Safety timeout in case 'play' event never fires from Peachify
                setTimeout(() => setIsIframeLoading(false), 800);
              }
            }}`;
file = file.replace(onLoadTarget, onLoadReplace);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Patched UI!");
