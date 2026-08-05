const title = "21 Jump Street";
let t = title.toLowerCase();
t = t.replace(/\(\d{4}\)/g, " ");
t = t.replace(/\[\d{4}\]/g, " ");
t = t.replace(/\b(19|20)\d{2}\b/g, " ");
t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
t = t.replace(/[^a-z0-9\s]/g, "");
t = t.replace(/\s+/g, " ").trim();
console.log("Clean Title: ", t);
