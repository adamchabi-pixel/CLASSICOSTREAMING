const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  const goBackOrHome = () => {
    // If we have history within the app, let's go back
    if (window.history.state !== null || window.history.length > 2) {
        window.history.back();
    } else {
        navigateTo("/");
    }
  };`;

content = content.replace(/const goBackOrHome = \(\) => \{[^}]+\};/, replacement);
fs.writeFileSync('src/App.tsx', content);
