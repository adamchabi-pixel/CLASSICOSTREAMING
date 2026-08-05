const fs = require('fs');

// simulate classifyMovie
function classifyMovie(title, originalTitle, director, genre, studios) {
  if (!title) return { confidence: "none" };
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const ot = originalTitle ? originalTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  const d = director ? director.toLowerCase() : "";

  const sagaIds = [];
  
  if (t.includes("batman") || ot.includes("batman") || t.includes("the dark knight") || ot.includes("the dark knight")) sagaIds.push("the-batman");

  if (sagaIds.length > 0) {
    return { sagaIds, confidence: "high" };
  }

  return { confidence: "none" };
}

console.log(classifyMovie("Batman Begins", ""));
console.log(classifyMovie("The Dark Knight", ""));
