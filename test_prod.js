import fs from 'fs';
try {
  fs.writeFileSync("/readonly.txt", "test");
} catch(e) {
  console.log("caught", e.message);
}
