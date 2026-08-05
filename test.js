const assert = require('assert');
let existing = { id: '123', title: 'test' };
let m = { id: '123', similar: [{id:'1'}], hasLogo: true, logoUrl: 'url' };
let merged = { ...existing, ...m };
console.log(merged);
