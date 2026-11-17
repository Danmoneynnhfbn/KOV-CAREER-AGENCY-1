const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");

esbuild.build({
  entryPoints: [path.join(root, "src", "kov-site-header-entry.jsx")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  target: ["es2020"],
  outfile: path.join(root, "assets", "kov-site-header.bundle.js"),
  legalComments: "none",
  logLevel: "info",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
