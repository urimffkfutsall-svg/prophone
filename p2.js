const fs = require("fs");
let c = fs.readFileSync("src/prophone_v3.jsx", "utf8");

// Fix URL param handler
c = c.replace(
  "const jobId = params.get('job');",
  "const jobId = params.get('job') || params.get('jid');"
);

// Fix JobStatusPage to read URL params
const old = /function JobStatusPage[\s\S]*?^\}/m;
const nw = `function JobStatusPage({ jobId, data, onBack, T }) {
  const params = new URLSearchParams(window.location.search);
  const isQR = params.get("v") === "1";
  
  if (isQR) {
    const job = { id: params.get("jid")||jobId, phoneModel: params.get("pm")||"", imei: params.get("im")||"", description: params.get("ds")||"", price: params.get("pr")||"", status: params.get("st")||"new", createdAt: params.get("dt")||"" };
    const client = { name: params.get("cn")||"", phone: params.get("cp")||"" };
    const worker = { name: params.get("wn")||"" };
    const business = { name: params.get("bn")||"" };
    return <ClientStatusView job={job} client={client} worker={worker} business={business} onBack={onBack} />;
  }
  
  const job = data.jobs.find(j => j.id === jobId);
  if (!job) return <div>Puna nuk u gjet.</div>;
  const client = data.clients.find(c => c.id === job.clientId)||null;
  const worker = data.workers.find(w => w.id === job.workerId)||null;
  return <ClientStatusView job={job} client={client} worker={worker} business={data.business} onBack={onBack} />;
}`;
c = c.replace(old, nw);
fs.writeFileSync("src/prophone_v3.jsx", c, "utf8");
console.log("JobStatusPage fixed!");
