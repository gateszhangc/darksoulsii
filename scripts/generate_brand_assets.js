const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets", "brand");
fs.mkdirSync(outDir, { recursive: true });

const palette = {
  night: "#09080a",
  smoke: "#121115",
  ash: "#1b191d",
  stone: "#252127",
  brass: "#7e6441",
  ember: "#b08856",
  bone: "#e8dcc4",
  mist: "#8f857a"
};

const render = (name, svg, width, height) => {
  const svgPath = path.join(outDir, `${name}.svg`);
  const pngPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(svgPath, svg);
  execFileSync("magick", [svgPath, "-background", "none", "-density", "144", "-strip", "-define", "png:compression-level=9", pngPath]);
  fs.unlinkSync(svgPath);
  return { width, height, pngPath };
};

const frame = ({ width, height, inner }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgFade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.night}"/>
      <stop offset="45%" stop-color="${palette.smoke}"/>
      <stop offset="100%" stop-color="${palette.ash}"/>
    </linearGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bone}"/>
      <stop offset="45%" stop-color="${palette.ember}"/>
      <stop offset="100%" stop-color="${palette.brass}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="54%">
      <stop offset="0%" stop-color="#d4b17a" stop-opacity="0.32"/>
      <stop offset="55%" stop-color="#7e6441" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#09080a" stop-opacity="0"/>
    </radialGradient>
    <filter id="softNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.05"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgFade)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" filter="url(#softNoise)" opacity="0.55"/>
  ${inner}
</svg>
`;

const ringSet = (cx, cy, rx, ry, count, gap, opacity) =>
  Array.from({ length: count }, (_, index) => {
    const currentRx = rx + gap * index;
    const currentRy = ry + gap * index * 0.92;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${currentRx}" ry="${currentRy}" fill="none" stroke="${palette.brass}" stroke-opacity="${opacity - index * 0.02}" stroke-width="${Math.max(1, 3 - index * 0.18)}" />`;
  }).join("");

const tickSet = (cx, cy, radius, count) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const outerX = cx + Math.cos(angle) * (radius + 24);
    const outerY = cy + Math.sin(angle) * (radius + 24);
    const innerX = cx + Math.cos(angle) * radius;
    const innerY = cy + Math.sin(angle) * radius;
    return `<line x1="${innerX.toFixed(2)}" y1="${innerY.toFixed(2)}" x2="${outerX.toFixed(2)}" y2="${outerY.toFixed(2)}" stroke="${palette.mist}" stroke-opacity="0.32" stroke-width="${index % 6 === 0 ? 2 : 1}" />`;
  }).join("");

const reliquaryCore = (cx, cy, scale) => {
  const width = 190 * scale;
  const archWidth = 320 * scale;
  const height = 470 * scale;
  const baseY = cy + 280 * scale;
  const archTop = cy - 240 * scale;
  return `
    <path d="M ${cx - archWidth / 2} ${baseY} Q ${cx - archWidth / 2} ${cy - 30 * scale} ${cx - 135 * scale} ${archTop} Q ${cx} ${archTop - 70 * scale} ${cx + 135 * scale} ${archTop} Q ${cx + archWidth / 2} ${cy - 30 * scale} ${cx + archWidth / 2} ${baseY}" fill="none" stroke="url(#metal)" stroke-width="${12 * scale}" stroke-linecap="round"/>
    <path d="M ${cx - width / 2} ${baseY} L ${cx - width / 2} ${cy - 50 * scale} L ${cx} ${cy - height} L ${cx + width / 2} ${cy - 50 * scale} L ${cx + width / 2} ${baseY} Z" fill="none" stroke="${palette.bone}" stroke-opacity="0.68" stroke-width="${5 * scale}"/>
    <path d="M ${cx - 82 * scale} ${cy + 140 * scale} L ${cx - 82 * scale} ${cy - 34 * scale} L ${cx} ${cy - 155 * scale} L ${cx + 82 * scale} ${cy - 34 * scale} L ${cx + 82 * scale} ${cy + 140 * scale}" fill="${palette.stone}" fill-opacity="0.82" stroke="${palette.ember}" stroke-opacity="0.72" stroke-width="${4 * scale}"/>
    <rect x="${cx - 120 * scale}" y="${cy + 142 * scale}" width="${240 * scale}" height="${34 * scale}" rx="${4 * scale}" fill="${palette.brass}" fill-opacity="0.18" stroke="${palette.mist}" stroke-opacity="0.4" stroke-width="${2 * scale}"/>
    <circle cx="${cx}" cy="${cy - 70 * scale}" r="${18 * scale}" fill="${palette.bone}" fill-opacity="0.92"/>
    <circle cx="${cx}" cy="${cy - 70 * scale}" r="${48 * scale}" fill="none" stroke="${palette.ember}" stroke-opacity="0.44" stroke-width="${3 * scale}"/>
    <line x1="${cx}" y1="${cy - 232 * scale}" x2="${cx}" y2="${cy + 175 * scale}" stroke="${palette.mist}" stroke-opacity="0.28" stroke-width="${2 * scale}"/>
  `;
};

const microGrid = (width, height) => {
  const rows = [];
  for (let y = 120; y < height - 120; y += 98) {
    for (let x = 120; x < width - 120; x += 98) {
      const size = (x + y) % 196 === 0 ? 10 : 7;
      rows.push(
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${palette.bone}" fill-opacity="0.045" transform="rotate(45 ${x + size / 2} ${y + size / 2})"/>`
      );
    }
  }
  return rows.join("");
};

const brandCanvas = frame({
  width: 1600,
  height: 2000,
  inner: `
    ${microGrid(1600, 2000)}
    ${ringSet(800, 900, 210, 280, 6, 54, 0.34)}
    ${tickSet(800, 900, 440, 48)}
    ${reliquaryCore(800, 980, 1.45)}
    <path d="M 340 1520 Q 800 1280 1260 1520" fill="none" stroke="${palette.brass}" stroke-opacity="0.24" stroke-width="2"/>
    <path d="M 280 1570 Q 800 1350 1320 1570" fill="none" stroke="${palette.mist}" stroke-opacity="0.14" stroke-width="1.5"/>
    <text x="800" y="1690" fill="${palette.bone}" fill-opacity="0.96" font-family="Baskerville" font-size="120" letter-spacing="20" text-anchor="middle">ASHEN RELIQUARY</text>
    <text x="800" y="1768" fill="${palette.mist}" fill-opacity="0.7" font-family="Avenir Next Condensed" font-size="32" letter-spacing="12" text-anchor="middle">OBSERVATIONAL MARK // CYCLE // RUIN // THRONE</text>
    <text x="210" y="230" fill="${palette.mist}" fill-opacity="0.58" font-family="Avenir Next Condensed" font-size="24" letter-spacing="8">PLATE I</text>
    <text x="1120" y="230" fill="${palette.mist}" fill-opacity="0.58" font-family="Avenir Next Condensed" font-size="24" letter-spacing="8">CALIBRATED FIELD</text>
    <line x1="200" y1="244" x2="510" y2="244" stroke="${palette.mist}" stroke-opacity="0.28" stroke-width="2"/>
    <line x1="1090" y1="244" x2="1400" y2="244" stroke="${palette.mist}" stroke-opacity="0.28" stroke-width="2"/>
  `
});

const logoMark = frame({
  width: 1024,
  height: 1024,
  inner: `
    ${ringSet(512, 452, 120, 165, 5, 38, 0.38)}
    ${tickSet(512, 452, 278, 36)}
    ${reliquaryCore(512, 530, 0.88)}
    <rect x="208" y="792" width="608" height="2" fill="${palette.mist}" fill-opacity="0.24"/>
  `
});

const logoWordmark = frame({
  width: 1600,
  height: 480,
  inner: `
    <g transform="translate(54 0)">
      ${ringSet(250, 238, 78, 102, 4, 24, 0.4)}
      ${reliquaryCore(250, 268, 0.46)}
    </g>
    <text x="510" y="220" fill="${palette.bone}" fill-opacity="0.98" font-family="Baskerville" font-size="108" letter-spacing="10">DARK SOULS II</text>
    <text x="510" y="294" fill="${palette.mist}" fill-opacity="0.76" font-family="Avenir Next Condensed" font-size="30" letter-spacing="10">GUIDE HUB // BOSSES // AREAS // BUILDS</text>
    <line x1="510" y1="326" x2="1310" y2="326" stroke="${palette.brass}" stroke-opacity="0.34" stroke-width="3"/>
  `
});

const socialCard = frame({
  width: 1200,
  height: 630,
  inner: `
    ${microGrid(1200, 630)}
    <ellipse cx="910" cy="304" rx="220" ry="250" fill="none" stroke="${palette.brass}" stroke-opacity="0.32" stroke-width="4"/>
    <ellipse cx="910" cy="304" rx="156" ry="180" fill="none" stroke="${palette.mist}" stroke-opacity="0.18" stroke-width="2"/>
    ${reliquaryCore(910, 342, 0.6)}
    <text x="110" y="186" fill="${palette.ember}" fill-opacity="0.8" font-family="Avenir Next Condensed" font-size="24" letter-spacing="10">DARK SOULS II</text>
    <text x="110" y="304" fill="${palette.bone}" fill-opacity="0.98" font-family="Baskerville" font-size="84">Guide hub for bosses,</text>
    <text x="110" y="390" fill="${palette.bone}" fill-opacity="0.98" font-family="Baskerville" font-size="84">areas, builds, and FAQs.</text>
    <text x="110" y="476" fill="${palette.mist}" fill-opacity="0.74" font-family="Avenir Next Condensed" font-size="28" letter-spacing="8">INDEPENDENT FAN REFERENCE // DARKSOULSII.LOL</text>
  `
});

render("brand-canvas", brandCanvas, 1600, 2000);
render("logo-mark", logoMark, 1024, 1024);
render("logo-wordmark", logoWordmark, 1600, 480);
render("social-card", socialCard, 1200, 630);

execFileSync("magick", [path.join(outDir, "logo-mark.png"), "-resize", "256x256", path.join(outDir, "favicon.png")]);
execFileSync("magick", [path.join(outDir, "logo-mark.png"), "-resize", "180x180", path.join(outDir, "apple-touch-icon.png")]);

console.log("Brand assets generated in assets/brand");
