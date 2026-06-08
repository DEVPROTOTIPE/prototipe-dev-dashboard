import fs from 'fs';
import zlib from 'zlib';

function checkTransparency() {
  const buf = fs.readFileSync('d:\\Aplicaciones\\dev-dashboard\\public\\logo.png');
  
  // Parse IHDR
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const depth = buf[24];
  const colorType = buf[25];
  
  console.log(`Dimensions: ${width}x${height}, Depth: ${depth}, ColorType: ${colorType}`);
  
  if (colorType !== 6 || depth !== 8) {
    console.log('Not a standard 8-bit RGBA PNG, transparency check skipped');
    return;
  }
  
  // Collect all IDAT chunks
  let pos = 33; // skip signature and IHDR chunk
  let idatBuffers = [];
  
  while (pos < buf.length) {
    if (pos + 8 > buf.length) break;
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    
    if (type === 'IDAT') {
      idatBuffers.push(buf.subarray(pos + 8, pos + 8 + length));
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + length;
  }
  
  const idatCombined = Buffer.concat(idatBuffers);
  try {
    const decompressed = zlib.inflateSync(idatCombined);
    
    // Each row has a filter byte (1 byte) followed by width * 4 bytes
    const rowBytes = 1 + width * 4;
    
    // Check top-left corner pixel (at x=0, y=0)
    // Offset is 1 (filter byte) + 0 * 4 = 1
    const r = decompressed[1];
    const g = decompressed[2];
    const b = decompressed[3];
    const a = decompressed[4];
    
    console.log(`Top-left pixel: R=${r}, G=${g}, B=${b}, A=${a}`);
    if (a === 0) {
      console.log('STATUS: Transparent background detected.');
    } else if (r === 255 && g === 255 && b === 255) {
      console.log('STATUS: Solid white background detected.');
    } else {
      console.log('STATUS: Solid non-white background detected.');
    }
  } catch (err) {
    console.error('Failed to decompress IDAT chunks:', err);
  }
}

checkTransparency();
