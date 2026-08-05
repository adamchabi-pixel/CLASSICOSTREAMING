const fs = require('fs');
let srvContent = fs.readFileSync('server.ts', 'utf8');

const target = `       if (activeYear) {
           if (activeYear === '2010') {
               url += \`&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31\`;
           } else if (activeYear === '2000') {
               url += \`&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31\`;
           } else {
               url += \`&primary_release_date.gte=\${activeYear}-01-01&primary_release_date.lte=\${activeYear}-12-31\`;
           }
       }`;
const replacement = `       if (activeYear) {
           const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
           if (activeYear === '2010') {
               url += \`&\${dateField}.gte=2010-01-01&\${dateField}.lte=2019-12-31\`;
           } else if (activeYear === '2000') {
               url += \`&\${dateField}.gte=2000-01-01&\${dateField}.lte=2009-12-31\`;
           } else {
               url += \`&\${dateField}.gte=\${activeYear}-01-01&\${dateField}.lte=\${activeYear}-12-31\`;
           }
       }`;
srvContent = srvContent.replace(target, replacement);
fs.writeFileSync('server.ts', srvContent);
