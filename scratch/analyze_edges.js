import fs from 'fs';
import zlib from 'zlib';

function analyzeEdges() {
  const buf = fs.readFileSync('d:\\Aplicaciones\\dev-dashboard\\public\\logo.png');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  
  let pos = 33;
  let idatBuffers = [];
  while (pos < buf.length) {
    if (pos + 8 > buf.length) break;
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') {
      idatBuffers.push(buf.subarray(pos + 8, pos + 8 + length));
    } else if (type === 'IEND') break;
    pos += 12 + length;
  }
  
  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  
  // Let's sample a few pixels at the outer boundaries (e.g. y=0 to y=100, x=0 to x=100)
  // and see if any have Alpha > 0
  let nonTransparentCount = 0;
  let sampleColors = [];
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4) + 1;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      const r = decompressed[idx];
      const g = decompressed[idx+1];
      const b = decompressed[idx+2];
      const a = decompressed[idx+3];
      
      // If not fully transparent
      if (a > 0) {
        // Is it close to the border (outer 20% margin)?
        const margin = Math.floor(width * 0.15);
        if (x < margin || x > width - margin || y < margin || y > height - margin) {
          nonTransparentCount++;
          if (sampleColors.length < 10) {
            sampleColors.push({x, y, r, g, b, a});
          }
        }
      }
    }
  }
  
  console.log(`Total non-transparent pixels in the outer 15% margin: ${nonTransparentCount}`);
  if (sampleColors.length > 0) {
    console.log('Sample margin pixels:', sampleColors);
  }
}

analyzeEdges();
