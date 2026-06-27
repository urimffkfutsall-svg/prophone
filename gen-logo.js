const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pngToIcoMod = require("png-to-ico");
const pngToIco = typeof pngToIcoMod === "function" ? pngToIcoMod : pngToIcoMod.default;

if (typeof pngToIco !== "function") {
  console.error("png-to-ico nuk eshte function. Tipi:", typeof pngToIcoMod, "keys:", Object.keys(pngToIcoMod || { }));
  process.exit(1);
}

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">' +
  '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" stop-color="#0EA5E9"/>' +
  '<stop offset="100%" stop-color="#0284C7"/>' +
  '</linearGradient></defs>' +
  '<rect width="1024" height="1024" rx="200" fill="url(#bg)"/>' +
  '<path fill-rule="evenodd" fill="#ffffff" d="M 300 260 L 520 260 A 252 252 0 0 1 520 764 L 300 764 Z M 400 380 L 520 380 A 132 132 0 0 1 520 644 L 400 644 Z"/>' +
  '</svg>';

const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "icon.svg"), svg);

const sizes = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  const buffers = [];
  for (const sz of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(sz, sz).png().toBuffer();
    buffers.push(buf);
    if (sz === 256) fs.writeFileSync(path.join(publicDir, "icon.png"), buf);
  }
  const big = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, "icon-512.png"), big);

  let icoBuf;
  try {
    icoBuf = await pngToIco(buffers);
  } catch (e1) {
    console.log("Provim 1 deshtoi:", e1.message, "- po provoj me path-e te perkohshme");
    const tmpFiles = [];
    for (let i = 0; i < buffers.length; i++) {
      const fp = path.join(publicDir, "_tmp_" + sizes[i] + ".png");
      fs.writeFileSync(fp, buffers[i]);
      tmpFiles.push(fp);
    }
    icoBuf = await pngToIco(tmpFiles);
    for (const fp of tmpFiles) { try { fs.unlinkSync(fp); } catch(e){ } }
  }

  fs.writeFileSync(path.join(publicDir, "icon.ico"), icoBuf);
  console.log("OK - icon.ico + icon.png + icon-512.png + icon.svg te public/");
}
main().catch(e => { console.error("ERROR:", e); process.exit(1); });
