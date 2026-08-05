const http = require("http");
const https = require("https");
const { URL } = require("url");

async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users";
  console.time("fetch");
  const res = await fetch(targetUrl);
  console.timeEnd("fetch");
  console.log(res.status);
}
run();
