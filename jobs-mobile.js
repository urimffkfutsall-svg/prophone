const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak8", src);
const report = [];
function apply(name, a, b) {
  if (src.indexOf(a) === -1) { report.push(name + ": NUK U GJET"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

apply("header-class",
  '<div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "10px 16px",',
  '<div className="job-row-header" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "10px 16px",'
);

apply("row-class",
  '<div key={job.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "14px 16px",',
  '<div key={job.id} className="job-row" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "14px 16px",'
);

const anchor = '.mobile-bottom-nav button.active .nav-label { color: #fff !important; }';
const css = anchor + "\n" +
"    @media (max-width: 640px) {\n" +
"      .job-row-header { display: none !important; }\n" +
"      .job-row { display: block !important; background: ${T.surfaceAlt} !important; border: 1px solid ${T.border} !important; border-radius: 14px !important; margin-bottom: 10px !important; padding: 14px 16px !important; }\n" +
"      .job-row > span { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; gap: 12px; padding: 5px 0 !important; white-space: normal !important; overflow: visible !important; text-overflow: clip !important; font-size: 14px !important; }\n" +
"      .job-row > span::before { color: ${T.textMuted}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; flex: 0 0 auto; }\n" +
"      .job-row > span:nth-child(1) { justify-content: flex-start !important; align-items: center !important; font-size: 17px !important; font-weight: 800 !important; padding-bottom: 8px !important; margin-bottom: 4px !important; border-bottom: 1px solid ${T.border} !important; }\n" +
"      .job-row > span:nth-child(2)::before { content: 'Statusi'; }\n" +
"      .job-row > span:nth-child(3)::before { content: 'Telefoni'; }\n" +
"      .job-row > span:nth-child(4)::before { content: 'IMEI'; }\n" +
"      .job-row > span:nth-child(5)::before { content: 'Pershkrimi'; }\n" +
"      .job-row > span:nth-child(6)::before { content: 'Puntori'; }\n" +
"      .job-row > span:nth-child(7)::before { content: 'Cmimi'; }\n" +
"      .job-row > span:nth-child(8)::before { content: 'Data'; }\n" +
"      .job-row > span:nth-child(8) { text-align: right; }\n" +
"      .job-row > span:nth-child(9) { justify-content: flex-end !important; gap: 10px !important; padding-top: 10px !important; }\n" +
"      .job-row > span:nth-child(9) button { width: 42px !important; height: 42px !important; border-radius: 10px !important; }\n" +
"    }";
apply("jobs-mobile-css", anchor, css);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
