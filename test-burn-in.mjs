const url = "http://localhost:3000/api/jellyfin/proxy/videos/e2fb5ddd828a899024cfba73f4d5b5c9/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=15000000&MaxVideoBitrate=15000000&PlaySessionId=123&SubtitleStreamIndex=2&SubtitleMethod=Encode";
const res = await fetch(url);
console.log(res.status);
const text = await res.text();
console.log(text);
