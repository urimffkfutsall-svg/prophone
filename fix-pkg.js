const fs = require("fs");
const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
fs.writeFileSync(pkgPath + ".bak", JSON.stringify(pkg, null, 2));

if (pkg.nsis) { if (!pkg.build) pkg.build = { }; pkg.build.nsis = pkg.nsis; delete pkg.nsis; }
if (pkg.hasOwnProperty("extends")) { if (pkg.extends !== null && pkg.extends !== undefined) { if (!pkg.build) pkg.build = { }; pkg.build.extends = pkg.extends; } delete pkg.extends; }
if (pkg.extraMetadata) { if (!pkg.build) pkg.build = { }; pkg.build.extraMetadata = pkg.extraMetadata; delete pkg.extraMetadata; }
if (!pkg.build) pkg.build = { };

pkg.build.appId = "pro.datapos.app";
pkg.build.productName = "DataPos";
pkg.build.directories = { output: "dist", buildResources: "public" };
pkg.build.files = ["build/**/*", "electron/**/*"];
pkg.build.extraMetadata = { main: "electron/main.js" };

const winTarget = pkg.build.target || [{ target: "nsis", arch: ["x64"] }];
delete pkg.build.target;
const winIcon = pkg.build.icon || "public/icon.ico";
delete pkg.build.icon;

pkg.build.win = {
  target: winTarget,
  icon: winIcon,
  artifactName: "DataPos-Setup-${version}.${ext}"
};

pkg.build.nsis = {
  oneClick: false,
  perMachine: false,
  allowToChangeInstallationDirectory: true,
  installerIcon: "public/icon.ico",
  uninstallerIcon: "public/icon.ico",
  installerHeaderIcon: "public/icon.ico",
  createDesktopShortcut: true,
  createStartMenuShortcut: true,
  shortcutName: "DataPos",
  uninstallDisplayName: "DataPos"
};

pkg.scripts = pkg.scripts || { };
pkg.scripts["gen-logo"] = "node gen-logo.js";
pkg.scripts["build:electron"] = "set PUBLIC_URL=./ && react-scripts build";
pkg.scripts["electron-start"] = "electron .";
pkg.scripts["dist:win"] = "npm run build:electron && electron-builder --win nsis";

pkg.description = "DataPos - Sistemi i menaxhimit te biznesit";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("OK - package.json u ristrukturua. Backup: package.json.bak");
