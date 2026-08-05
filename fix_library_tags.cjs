const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `      </div>
      </div>
    </motion.div>
  );
}`;
const replacement = `      </div>
    </motion.div>
  );
}`;
content = content.replace(target, replacement);
fs.writeFileSync('src/components/LibraryView.tsx', content);
