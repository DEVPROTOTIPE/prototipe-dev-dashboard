import fs from 'fs';
import zlib from 'zlib';

// CRC32 table for PNG chunk checksums
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writePng(width, height, rgbaData) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  
  // Prepare IDAT data (filter byte 0 before each row)
  const idatRaw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const srcOffset = y * width * 4;
    const destOffset = y * (1 + width * 4);
    idatRaw[destOffset] = 0; // Filter type 0 (None)
    rgbaData.copy(idatRaw, destOffset + 1, srcOffset, srcOffset + width * 4);
  }
  
  const idatCompressed = zlib.deflateSync(idatRaw, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatCompressed);
  
  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  
  return Buffer.concat([lengthBuf, typeAndData, crcBuf]);
}

function applyMask() {
  const inputPath = 'd:\\Aplicaciones\\dev-dashboard\\public\\logo.png';
  const outputPath = 'd:\\Aplicaciones\\dev-dashboard\\public\\logo.png';
  
  const buf = fs.readFileSync(inputPath);
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
  const rawRgba = Buffer.alloc(width * height * 4);
  
  // Reconstruct raw RGBA (remove filter bytes)
  const rowBytes = 1 + width * 4;
  for (let y = 0; y < height; y++) {
    decompressed.copy(rawRgba, y * width * 4, y * rowBytes + 1, (y + 1) * rowBytes);
  }
  
  // Define mask parameters
  // Corner radius (37.5% of 1024 is 384)
  const r = 384; 
  const W = width;
  const H = height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      let isOutside = false;
      
      // Top-Left corner
      if (x < r && y < r) {
        const dx = x - r;
        const dy = y - r;
        if (dx*dx + dy*dy > r*r) isOutside = true;
      }
      // Top-Right corner
      else if (x > W - r && y < r) {
        const dx = x - (W - r);
        const dy = y - r;
        if (dx*dx + dy*dy > r*r) isOutside = true;
      }
      // Bottom-Left corner
      else if (x < r && y > H - r) {
        const dx = x - r;
        const dy = y - (H - r);
        if (dx*dx + dy*dy > r*r) isOutside = true;
      }
      // Bottom-Right corner
      else if (x > W - r && y > H - r) {
        const dx = x - (W - r);
        const dy = y - (H - r);
        if (dx*dx + dy*dy > r*r) isOutside = true;
      }
      
      if (isOutside) {
        // Clear pixel (make 100% transparent)
        rawRgba[idx] = 0;
        rawRgba[idx+1] = 0;
        rawRgba[idx+2] = 0;
        rawRgba[idx+3] = 0;
      }
    }
  }
  
  // Write the masked PNG
  const outputPng = writePng(width, height, rawRgba);
  fs.writeFileSync(outputPath, outputPng);
  console.log('Successfully masked logo and wrote back to public/logo.png');
}

applyMask();
