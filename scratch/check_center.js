import fs from 'fs';
import zlib from 'zlib';

function checkOriginal() {
  const buf = fs.readFileSync('C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\286fd24d-2ff7-473e-9314-ee9db95f58c2\\media__1780866211932.png');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  
  let pos = 33;
  let idatBuffers = [];
  while (pos < buf.length) {
    if (pos + 8 > buf.length) break;
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idatBuffers.push(buf.subarray(pos + 8, pos + 8 + length));
    else if (type === 'IEND') break;
    pos += 12 + length;
  }
  
  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  const rowBytes = 1 + width * 4;
  
  // Find at least 5 pixels with A > 200
  let found = 0;
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes + 1;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      const r = decompressed[idx];
      const g = decompressed[idx+1];
      const b = decompressed[idx+2];
      const a = decompressed[idx+3];
      if (a > 200) {
        found++;
        if (found <= 5) {
          console.log(`Solid Pixel ${found}: (${x},${y}) -> R=${r}, G=${g}, B=${b}, A=${a}`);
        }
      }
    }
  }
  console.log(`Total solid pixels (A > 200): ${found}`);
}

checkOriginal();
