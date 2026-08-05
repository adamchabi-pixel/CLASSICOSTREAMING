const parseVTT = (text) => {
    const list = [];
    const cleanLines = text.split(/\r?\n/);
    
    const parseTime = (timeStr) => {
      const cleanTimeStr = timeStr.trim().split(/\s+/)[0].replace(",", ".");
      const parts = cleanTimeStr.split(":");
      let h = 0, m = 0, s = 0;
      if (parts.length === 3) {
        h = parseFloat(parts[0]) || 0;
        m = parseFloat(parts[1]) || 0;
        s = parseFloat(parts[2]) || 0;
      } else if (parts.length === 2) {
        m = parseFloat(parts[0]) || 0;
        s = parseFloat(parts[1]) || 0;
      } else {
        s = parseFloat(parts[0]) || 0;
      }
      return h * 3600 + m * 60 + s;
    };

    let i = 0;
    while (i < cleanLines.length) {
      const line = cleanLines[i].trim();
      if (line.includes("-->")) {
        const times = line.split("-->");
        if (times.length === 2) {
          const start = parseTime(times[0]);
          const end = parseTime(times[1]);
          
          let textLines = [];
          i++;
          
          while (i < cleanLines.length) {
            const nextLine = cleanLines[i].trim();
            if (nextLine === "") {
              break;
            }
            if (nextLine.includes("-->")) {
              i--;
              break;
            }
            if (/^\d+$/.test(nextLine) && i + 1 < cleanLines.length && cleanLines[i + 1].trim().includes("-->")) {
              break;
            }
            textLines.push(cleanLines[i]);
            i++;
          }
          
          if (textLines.length > 0) {
            list.push({
              start,
              end,
              text: textLines.join("\n")
            });
          }
        }
      } else {
        i++;
      }
    }
    return list;
  };

const vttText = `WEBVTT

02:33:00.652 --> 02:33:01.611 region:subtitle line:90%
[horse whinnying]

02:33:13.623 --> 02:33:14.916 region:subtitle line:90%
[horse nickering]`;

console.log(parseVTT(vttText));
