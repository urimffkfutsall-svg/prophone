const fs = require('fs');
const sharp = require('sharp');

const svg = [
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
'<defs>',
'<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
'<stop offset="0%" stop-color="#0EA5E9"/>',
'<stop offset="100%" stop-color="#0369A1"/>',
'</linearGradient>',
'<linearGradient id="phone" x1="0%" y1="0%" x2="0%" y2="100%">',
'<stop offset="0%" stop-color="#ffffff"/>',
'<stop offset="100%" stop-color="#e0f2fe"/>',
'</linearGradient>',
'</defs>',
'<rect width="512" height="512" rx="110" fill="url(#bg)"/>',
'<rect x="176" y="110" width="160" height="280" rx="24" fill="url(#phone)" stroke="#0369A1" stroke-width="3"/>',
'<rect x="190" y="140" width="132" height="200" rx="6" fill="#0EA5E9" opacity="0.15"/>',
'<circle cx="256" cy="365" r="10" fill="#0369A1" opacity="0.3"/>',
'<rect x="236" y="122" width="40" height="4" rx="2" fill="#0369A1" opacity="0.4"/>',
'<text x="256" y="245" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="#0369A1" text-anchor="middle" dominant-baseline="middle">P</text>',
'<rect x="210" y="270" width="92" height="4" rx="2" fill="#0EA5E9" opacity="0.5"/>',
'<rect x="220" y="284" width="72" height="4" rx="2" fill="#0EA5E9" opacity="0.4"/>',
'<rect x="225" y="298" width="62" height="4" rx="2" fill="#0EA5E9" opacity="0.3"/>',
'</svg>'
].join('');

fs.writeFileSync('public/logo.svg', svg);

(async () => {
  await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/logo192.png');
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/logo512.png');
  console.log('Ikonat u krijuan me sukses!');
})();
