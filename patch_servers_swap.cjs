const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const block1Target = `const newServers = [
              { name: "Server 1", url: iframeUrlCinemaos, stars: 3 },
              { name: "Server 2", url: iframeUrlVideasy, stars: 2 },
              { name: "Server 3", url: iframeUrlPeach, stars: 2 },
              { name: "Server 4", url: iframeUrl111, stars: 1 }
            ];`;
const block1Replace = `const newServers = [
              { name: "Server 1", url: iframeUrlVideasy, stars: 3 },
              { name: "Server 2", url: iframeUrlCinemaos, stars: 2 },
              { name: "Server 3", url: iframeUrlPeach, stars: 2 },
              { name: "Server 4", url: iframeUrl111, stars: 1 }
            ];`;
file = file.replace(block1Target, block1Replace);

const block2Target = `const srvs = [
                      { name: "Server 1", url: u4, stars: 3 },
                      { name: "Server 2", url: u3, stars: 2 },
                      { name: "Server 3", url: u1, stars: 2 },
                      { name: "Server 4", url: u2, stars: 1 }
                    ];`;
const block2Replace = `const srvs = [
                      { name: "Server 1", url: u3, stars: 3 },
                      { name: "Server 2", url: u4, stars: 2 },
                      { name: "Server 3", url: u1, stars: 2 },
                      { name: "Server 4", url: u2, stars: 1 }
                    ];`;
file = file.replace(block2Target, block2Replace);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
console.log("Swapped servers 1 and 2");
