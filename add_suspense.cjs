const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<ErrorBoundary \n                fallbackTitle="Interruption de la lecture du film"\n                onReset={() => navigateTo("/")}\n              >',
  '<ErrorBoundary \n                fallbackTitle="Interruption de la lecture du film"\n                onReset={() => navigateTo("/")}\n              >\n                <React.Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>}>'
);

content = content.replace(
  '                })()}\n              </ErrorBoundary>',
  '                })()}\n                </React.Suspense>\n              </ErrorBoundary>'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Added Suspense!");
