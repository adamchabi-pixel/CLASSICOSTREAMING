const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// Always prompt for server
file = file.replace(
  `const [serverSelected, setServerSelected] = useState(() => {`,
  `const [serverSelected, setServerSelected] = useState(() => { return false;`
);

// Add "we recommend adblock" to the server selection view
const targetScreen = `<p className="text-sm text-neutral-400">Choose a streaming server to launch the video.</p>
          </div>`;
const replaceScreen = `<p className="text-sm text-neutral-400">Choose a streaming server to launch the video.</p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2 flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">⚠️</div>
              <p className="text-xs text-amber-500/90 text-left leading-relaxed">
                For the best experience, we strongly recommend using an <strong>adblocker</strong> (like uBlock Origin or Brave Browser) to avoid unwanted popups.
              </p>
            </div>
          </div>`;
file = file.replace(targetScreen, replaceScreen);

// Remove the 4500ms timer for server 1
const targetOnLoad = `if (isCinemaos) {
                // Wait 4 seconds for CinemaOS to load its internal servers to hide it behind our loading screen
                setTimeout(() => setIsIframeLoading(false), 4500);
              } else if (!isPeach) {`;
const replaceOnLoad = `if (!isPeach) {`;
file = file.replace(targetOnLoad, replaceOnLoad);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Patched server screen and timeout");
