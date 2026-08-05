const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `          {showAdblockBanner && (
            <div className="mt-2 bg-black/50 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-sm font-medium text-yellow-500 flex-1 text-left">We recommend using AdBlock for a better experience</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdblockBanner(false);
                }}
                className="text-neutral-500 hover:text-white transition-colors ml-auto -mr-2 -mt-2 p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}`;
file = file.replace(target1, "");

const target2 = `const [showAdblockBanner, setShowAdblockBanner] = useState(true);`;
file = file.replace(target2, "");

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Removed bottom adblock banner");
