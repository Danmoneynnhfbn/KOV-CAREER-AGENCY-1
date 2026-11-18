import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp from "sharp";

const input = fileURLToPath(new URL("../assets/icon.png", import.meta.url));
const outputDir = fileURLToPath(new URL("../assets/play-store/", import.meta.url));
await mkdir(outputDir, { recursive: true });

await sharp(input)
  .resize(512, 512, { fit: "contain", background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .png()
  .toFile(join(outputDir, "app-icon-512.png"));

const graphic = Buffer.from(`<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f9ff"/>
      <stop offset="1" stop-color="#edf3ff"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <rect x="0" y="0" width="1024" height="14" fill="#073b9a"/>
  <rect x="0" y="14" width="1024" height="6" fill="#ff6a00"/>
  <circle cx="925" cy="85" r="160" fill="#073b9a" opacity=".045"/>
  <circle cx="1000" cy="430" r="210" fill="#ff6a00" opacity=".055"/>
  <rect x="410" y="100" width="4" height="300" rx="2" fill="#ff6a00"/>
  <text x="470" y="190" font-size="48" font-weight="700" fill="#073b9a" font-family="Arial, Helvetica, sans-serif">KOV Career Agency</text>
  <text x="470" y="255" font-size="26" font-weight="600" fill="#172033" font-family="Arial, Helvetica, sans-serif">Career representation.</text>
  <text x="470" y="294" font-size="26" font-weight="600" fill="#172033" font-family="Arial, Helvetica, sans-serif">Executive talent sourcing.</text>
  <text x="470" y="365" font-size="18" fill="#42516a" font-family="Arial, Helvetica, sans-serif">Explore KOV's official website on mobile.</text>
  <rect x="470" y="405" width="165" height="7" rx="3.5" fill="#073b9a"/>
  <rect x="641" y="405" width="58" height="7" rx="3.5" fill="#ff6a00"/>
</svg>`);
const logo = await sharp(input)
  .resize(330, 330, { fit: "contain", background: "#ffffff" })
  .png()
  .toBuffer();
await sharp(graphic)
  .composite([{ input: logo, left: 42, top: 85 }])
  .png()
  .toFile(join(outputDir, "feature-graphic-1024x500.png"));

console.log("Created app-icon-512.png and feature-graphic-1024x500.png");
