import fs from 'fs';
const buffer = fs.readFileSync('d:\\Aplicaciones\\dev-dashboard\\public\\logo.png');
const colorType = buffer[25];
console.log('PNG Color Type:', colorType === 6 ? 'RGBA (Supports Transparency)' : colorType === 2 ? 'RGB (No Transparency)' : colorType);
