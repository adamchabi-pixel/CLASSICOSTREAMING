async function testProxy() {
  const testHls = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  try {
    const res = await fetch(testHls);
    console.log("Mux HLS test status:", res.status);
    const text = await res.text();
    console.log("M3U8 snippet:", text.substring(0, 300));
  } catch(e) {
    console.error(e);
  }
}
testProxy();
