const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
let changes = 0;

// 1) Fix @page size: 80mm x 210mm (21cm)
if (s.includes('size:80mm 290mm')) {
  s = s.replace('size:80mm 290mm', 'size:80mm 210mm');
  changes++;
  console.log('✅ 1) @page size → 80mm 210mm');
}

// 2) Fix container height: 793px (210mm)
if (s.includes('height: "1096px"')) {
  s = s.replace('height: "1096px"', 'height: "793px"');
  changes++;
  console.log('✅ 2) Container height → 793px');
}

// 3) Make coupon content more compact to fit both copies in 210mm
// Reduce QR sizes and padding
const oldClientQR = 'QRCodeSVG value={qrData} size={100}';
const newClientQR = 'QRCodeSVG value={qrData} size={70}';
if (s.includes(oldClientQR)) {
  s = s.replace(oldClientQR, newClientQR);
  changes++;
  console.log('✅ 3) Client QR size → 70');
}

// 4) Reduce service copy QR
const oldServiceQR = 'QRCodeSVG value={qrData} size={60}';
const newServiceQR = 'QRCodeSVG value={qrData} size={50}';
if (s.includes(oldServiceQR)) {
  s = s.replace(oldServiceQR, newServiceQR);
  changes++;
  console.log('✅ 4) Service QR size → 50');
}

// 5) Reduce font sizes and padding in coupon to fit 210mm
// Client copy header: reduce from 20 to 16
const oldBizName = `fontSize: 20, fontWeight: 900, letterSpacing: -0.5`;
const newBizName = `fontSize: 16, fontWeight: 900, letterSpacing: -0.5`;
if (s.includes(oldBizName)) {
  s = s.replace(oldBizName, newBizName);
  changes++;
  console.log('✅ 5) Business name font → 16');
}

// 6) Reduce "Kupon Pranues" title
const oldKuponTitle = `fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10`;
const newKuponTitle = `fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6`;
if (s.includes(oldKuponTitle)) {
  s = s.replace(oldKuponTitle, newKuponTitle);
  changes++;
  console.log('✅ 6) Kupon Pranues title smaller');
}

// 7) Reduce client copy top padding
const oldClientPad = `flex: 1, padding: "16px 14px"`;
const newClientPad = `flex: 1, padding: "10px 12px"`;
if (s.includes(oldClientPad)) {
  s = s.replace(oldClientPad, newClientPad);
  changes++;
  console.log('✅ 7) Client copy padding reduced');
}

// 8) Reduce separator height
const oldSep = `margin: "0 8px", height: 24`;
const newSep = `margin: "0 8px", height: 16`;
if (s.includes(oldSep)) {
  s = s.replace(oldSep, newSep);
  changes++;
  console.log('✅ 8) Separator height reduced');
}

// 9) Reduce service copy padding
const oldServicePad = `padding: "12px 14px", background: "#fafafa"`;
const newServicePad = `padding: "8px 12px", background: "#fafafa"`;
if (s.includes(oldServicePad)) {
  s = s.replace(oldServicePad, newServicePad);
  changes++;
  console.log('✅ 9) Service copy padding reduced');
}

// 10) Add business logo display in coupon (after business name)
// Find the business name div and add logo before it
const oldBizHeader = `<div style={{ textAlign: "center", marginBottom: 12, paddingBottom: 10, borderBottom: "2px solid #1a1a2e" }}>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>{business?.name || "DataPhone"}</div>`;
const newBizHeader = `<div style={{ textAlign: "center", marginBottom: 8, paddingBottom: 8, borderBottom: "2px solid #1a1a2e" }}>
                {business?.logo && <img src={business.logo} alt="logo" style={{ maxWidth: 120, maxHeight: 40, marginBottom: 4, objectFit: "contain" }} />}
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>{business?.name || "DataPhone"}</div>`;
if (s.includes(oldBizHeader)) {
  s = s.replace(oldBizHeader, newBizHeader);
  changes++;
  console.log('✅ 10) Logo added to coupon header');
}

// 11) In BusinessSettings (Biznesi page), add expiry/days info
// Find the "Aktiv" badge and add days remaining after it
const oldAktivBadge = `<span style={{ background: "#D1FAE5", color: "#10B981", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Aktiv</span>`;
const newAktivBadge = `<span style={{ background: "#D1FAE5", color: "#10B981", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Aktiv</span>
                {s.expiryDate && <span style={{ background: "#DBEAFE", color: "#2563EB", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{Math.max(0, Math.ceil((new Date(s.expiryDate) - new Date()) / 86400000))} ditë mbeten</span>}`;
if (s.includes(oldAktivBadge)) {
  s = s.replace(oldAktivBadge, newAktivBadge);
  changes++;
  console.log('✅ 11) Days remaining badge added to Biznesi');
}

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ U krye ' + changes + ' ndryshime.');
