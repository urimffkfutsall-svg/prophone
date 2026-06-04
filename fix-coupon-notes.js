const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
let changes = 0;

// ============================================================
// 1) Shto "couponNotes" te SettingsPrint form state
// ============================================================
const oldForm = `    printPaperSize: b.printPaperSize || "80mm",
  });`;
const newForm = `    printPaperSize: b.printPaperSize || "80mm",
    couponNotes: b.couponNotes || "",
  });`;

if (s.includes(oldForm)) {
  s = s.replace(oldForm, newForm);
  changes++;
  console.log('✅ 1) couponNotes u shtua te form state');
}

// ============================================================
// 2) Shto textarea për shënime shtesë te SettingsPrint UI
// ============================================================
const oldFooterInput = `        <Input label="Teksti i fundit te kuponit" value={form.printFooter} onChange={v => setForm(f=>({...f,printFooter:v}))} placeholder="p.sh. Garanci 30 dite" t={T} />`;
const newFooterInput = `        <Input label="Teksti i fundit te kuponit" value={form.printFooter} onChange={v => setForm(f=>({...f,printFooter:v}))} placeholder="p.sh. Garanci 30 dite" t={T} />
        <Textarea label="Shënime shtesë për kuponin" value={form.couponNotes} onChange={v => setForm(f=>({...f,couponNotes:v}))} placeholder="Shënimet do të shfaqen në fund të kuponit (pas QR kodit)" rows={3} t={T} />`;

if (s.includes(oldFooterInput)) {
  s = s.replace(oldFooterInput, newFooterInput);
  changes++;
  console.log('✅ 2) Textarea për shënime shtesë u shtua te Settings');
}

// ============================================================
// 3) Shto shënimet pas QR code te kopja e klientit
// ============================================================
const oldPowered = `              <div style={{ textAlign: "center", fontSize: 8, color: "#94a3b8" }}>Powered by DataPhone</div>`;
const newPowered = `              {business?.couponNotes && <div style={{ marginTop: 6, padding: "4px 6px", fontSize: 9, lineHeight: 1.4, color: "#475569", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", textAlign: "center" }}>{business.couponNotes}</div>}
              <div style={{ textAlign: "center", fontSize: 8, color: "#94a3b8", marginTop: 4 }}>Powered by DataPhone</div>`;

if (s.includes(oldPowered)) {
  s = s.replace(oldPowered, newPowered);
  changes++;
  console.log('✅ 3) Shënimet shtesë u shtuan pas QR te kopja klientit');
}

// ============================================================
// 4) Shto shënimet pas QR code te kopja e servisit
// ============================================================
const oldServiceQR = `              <div style={{ textAlign: "center", marginTop: 6 }}><QRCodeSVG value={qrData} size={60} /></div>
            </div>
          </div>
        </div>`;
const newServiceQR = `              <div style={{ textAlign: "center", marginTop: 6 }}><QRCodeSVG value={qrData} size={60} /></div>
              {business?.couponNotes && <div style={{ marginTop: 4, fontSize: 8, lineHeight: 1.3, color: "#475569", textAlign: "center" }}>{business.couponNotes}</div>}
            </div>
          </div>
        </div>`;

if (s.includes(oldServiceQR)) {
  s = s.replace(oldServiceQR, newServiceQR);
  changes++;
  console.log('✅ 4) Shënimet shtesë u shtuan pas QR te kopja servisit');
}

// ============================================================
// 5) Rregullo dimensionet - kuponi = 80mm x 145mm per secilen kopje
// Total = 80mm x 290mm (2 x 145mm)
// Kopja e klientit: flex:1, Kopja e servisit: flex proporcionale
// ============================================================
// Heq minHeight fikse qe te lejoje flex layout natyral
const oldMinH = 'minHeight: "1096px"';
const newMinH = 'height: "1096px"';

if (s.includes(oldMinH)) {
  s = s.replace(oldMinH, newMinH);
  changes++;
  console.log('✅ 5) minHeight -> height per dimensione fikse');
}

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ U krye ' + changes + '/5 ndryshime.');
