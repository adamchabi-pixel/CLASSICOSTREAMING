const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const scriptStr = `<script>
  (function() {
    window.lastPopunderTime = 0;
    var COOLDOWN_MS = 10000;
    
    var originalWindowOpen = window.open;
    window.open = function() {
      var now = Date.now();
      if (now - window.lastPopunderTime < COOLDOWN_MS) {
        console.log("[Ad Cooldown] window.open blocked.");
        return null;
      }
      window.lastPopunderTime = now;
      return originalWindowOpen.apply(this, arguments);
    };

    var originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      if (this.target === '_blank' || this.target === '') { // sometimes they use empty target to redirect, but usually popunder is _blank
        var now = Date.now();
        if (now - window.lastPopunderTime < COOLDOWN_MS) {
          console.log("[Ad Cooldown] a.click blocked.");
          return;
        }
        window.lastPopunderTime = now;
      }
      return originalClick.apply(this, arguments);
    };
  })();
</script>`;

if (!file.includes('window.lastPopunderTime')) {
    const replaceTarget = '<script>(function(s){s.dataset.zone="11446136"';
    file = file.replace(replaceTarget, scriptStr + '\n    ' + replaceTarget);
    fs.writeFileSync('index.html', file);
    console.log("Cooldown patch applied.");
} else {
    console.log("Already patched.");
}
