export interface SampleCoin {
  id: string;
  name: string;
  year: string;
  mintMark: string;
  rarityLevel: string;
  description: string;
  composition: string;
  image: string; // Obverse
  reverseImage?: string; // Reverse
  mintage?: string;
  series?: string;
}

// Crisp vector SVG renders representing authentic historical specimens for instant testing
function createObverseCoinSvg(title: string, year: string, metalColor: string, detailText: string, mint: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="metalGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff8e7" stop-opacity="0.9"/>
      <stop offset="25%" stop-color="${metalColor}"/>
      <stop offset="70%" stop-color="#2a1b08"/>
      <stop offset="100%" stop-color="#0f0903"/>
    </radialGradient>
    <filter id="patina" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="0.3 0 0 0 0  0 0.3 0 0 0  0 0 0.3 0 0  0 0 0 0.15 0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
    </filter>
  </defs>
  <circle cx="200" cy="200" r="190" fill="url(#metalGrad)" stroke="#553912" stroke-width="4" filter="url(#patina)"/>
  <circle cx="200" cy="200" r="182" fill="none" stroke="#e6c687" stroke-width="3" stroke-dasharray="4,5"/>
  <circle cx="200" cy="200" r="172" fill="none" stroke="#7a5420" stroke-width="1.5"/>
  <text x="200" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="24" letter-spacing="8" fill="#ffeac2">LIBERTY</text>
  <g transform="translate(130, 105)">
    <circle cx="70" cy="65" r="45" fill="#f5d696" stroke="#5a3d12" stroke-width="2"/>
    <path d="M 40 100 Q 70 80 100 100 Q 110 145 30 145 Z" fill="#e2ba72" stroke="#5a3d12" stroke-width="2"/>
  </g>
  <text x="200" y="275" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="14" letter-spacing="3" fill="#ffeac2">IN GOD WE TRUST</text>
  <text x="200" y="305" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="15" letter-spacing="2" fill="#ffd580">${detailText}</text>
  <text x="200" y="345" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="28" letter-spacing="4" fill="#ffffff">${year} ${mint}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createReverseCoinSvg(title: string, denomination: string, metalColor: string, subtitle: string, initials = ''): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="revMetalGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff8e7" stop-opacity="0.9"/>
      <stop offset="25%" stop-color="${metalColor}"/>
      <stop offset="70%" stop-color="#2a1b08"/>
      <stop offset="100%" stop-color="#0f0903"/>
    </radialGradient>
    <filter id="revPatina" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="0.3 0 0 0 0  0 0.3 0 0 0  0 0 0.3 0 0  0 0 0 0.15 0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
    </filter>
  </defs>
  <circle cx="200" cy="200" r="190" fill="url(#revMetalGrad)" stroke="#553912" stroke-width="4" filter="url(#revPatina)"/>
  <circle cx="200" cy="200" r="182" fill="none" stroke="#e6c687" stroke-width="3" stroke-dasharray="4,5"/>
  <circle cx="200" cy="200" r="172" fill="none" stroke="#7a5420" stroke-width="1.5"/>
  <text x="200" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="20" letter-spacing="4" fill="#ffeac2">UNITED STATES OF AMERICA</text>
  <text x="200" y="95" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="13" letter-spacing="3" fill="#ffeac2">E PLURIBUS UNUM</text>
  
  <g transform="translate(100, 115)">
    <path d="M 20 120 C 10 60, 30 10, 50 5 C 40 40, 45 80, 50 120" stroke="#f5d696" stroke-width="3.5" fill="none"/>
    <path d="M 180 120 C 190 60, 170 10, 150 5 C 160 40, 155 80, 150 120" stroke="#f5d696" stroke-width="3.5" fill="none"/>
    <circle cx="100" cy="65" r="32" fill="#e2ba72" stroke="#5a3d12" stroke-width="1.5"/>
  </g>
  
  <text x="200" y="225" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="26" letter-spacing="3" fill="#ffffff">${denomination}</text>
  <text x="200" y="260" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="14" letter-spacing="2" fill="#ffd580">${subtitle}</text>
  
  ${initials ? `<text x="200" y="360" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="14" letter-spacing="4" fill="#fce4b3">${initials}</text>` : ''}
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_COINS: SampleCoin[] = [
  {
    id: '1909-s-vdb',
    name: '1909-S V.D.B. Lincoln Cent',
    year: '1909',
    mintMark: 'S',
    rarityLevel: 'Key Date / Rare',
    composition: '95% Copper, 5% Tin/Zinc',
    description: 'First year of issue with designer Victor David Brenner initials on the lower reverse rim. Low mintage of 484,000.',
    mintage: '484,000',
    series: 'Lincoln Cent (Wheat Reverse)',
    image: createObverseCoinSvg('Lincoln Cent', '1909', '#b86d38', 'OBVERSE // BUST', 'S'),
    reverseImage: createReverseCoinSvg('Lincoln Cent', 'ONE CENT', '#b86d38', 'WHEAT REVERSE', 'V.D.B.'),
  },
  {
    id: '1878-cc-morgan',
    name: '1878-CC Carson City Morgan Dollar',
    year: '1878',
    mintMark: 'CC',
    rarityLevel: 'Wild West Legend / Scarce',
    composition: '90% Silver, 10% Copper (0.7734 oz ASW)',
    description: 'First year of the Carson City Nevada mint strike. Famous deep mirror prooflike fields struck with Comstock Lode silver.',
    mintage: '2,212,000',
    series: 'Morgan Dollar',
    image: createObverseCoinSvg('Morgan Dollar', '1878', '#c9ced6', 'CARSON CITY MINT', 'CC'),
    reverseImage: createReverseCoinSvg('Morgan Dollar', 'ONE DOLLAR', '#c9ced6', 'HERALDIC EAGLE', 'CC MINTMARK'),
  },
  {
    id: '1955-ddo-cent',
    name: '1955 Doubled Die Obverse Cent (FS-101)',
    year: '1955',
    mintMark: 'None (P)',
    rarityLevel: 'Legendary Die Variety',
    composition: '95% Copper, 5% Zinc',
    description: 'The most famous die variety in all of numismatics. Massive spread doubling in LIBERTY and IN GOD WE TRUST.',
    mintage: 'Estimated 20,000 to 24,000 released',
    series: 'Lincoln Cent Variety',
    image: createObverseCoinSvg('Lincoln Cent', '1955', '#a35d29', 'DOUBLED DIE OBVERSE', 'P'),
    reverseImage: createReverseCoinSvg('Lincoln Cent', 'ONE CENT', '#a35d29', 'WHEAT STALKS', 'E PLURIBUS UNUM'),
  },
  {
    id: '1921-morgan',
    name: '1921 Morgan Silver Dollar',
    year: '1921',
    mintMark: 'None (P)',
    rarityLevel: 'Classic Collectible',
    composition: '90% Silver, 10% Copper (0.7734 oz ASW)',
    description: 'The final year of the legendary Morgan Dollar series before transitioning to the Peace Dollar. 90% Fine Silver.',
    mintage: '44,690,000',
    series: 'Morgan Dollar',
    image: createObverseCoinSvg('Morgan Dollar', '1921', '#b5bac2', 'LIBERTY PROFILE', 'P'),
    reverseImage: createReverseCoinSvg('Morgan Dollar', 'ONE DOLLAR', '#b5bac2', 'HERALDIC EAGLE', 'IN GOD WE TRUST'),
  },
  {
    id: '1937-d-3legged',
    name: '1937-D 3-Legged Buffalo Nickel',
    year: '1937',
    mintMark: 'D',
    rarityLevel: 'Famous Mint Error',
    composition: '75% Copper, 25% Nickel',
    description: 'Renowned planchet/die error caused by excessive die polishing by mint pressman Mr. Young that erased the right front leg.',
    mintage: 'Estimated 20,000 - 30,000 survived',
    series: 'Buffalo (Indian Head) Nickel',
    image: createObverseCoinSvg('Buffalo Nickel', '1937', '#998d75', 'CHIEF IRON TAIL', 'D'),
    reverseImage: createReverseCoinSvg('Buffalo Nickel', 'FIVE CENTS', '#998d75', 'BLACK DIAMOND BISON', '3-LEGGED VARIETY'),
  },
  {
    id: '1916-d-mercury',
    name: '1916-D Mercury Dime',
    year: '1916',
    mintMark: 'D',
    rarityLevel: 'Ultra-Rare Key Date',
    composition: '90% Silver, 10% Copper (0.0723 oz ASW)',
    description: 'The premier key date of the Winged Liberty (Mercury) series with a tiny mintage of just 264,000 pieces.',
    mintage: '264,000',
    series: 'Winged Liberty Head Dime',
    image: createObverseCoinSvg('Mercury Dime', '1916', '#cfd5de', 'WINGED LIBERTY', 'D'),
    reverseImage: createReverseCoinSvg('Mercury Dime', 'ONE DIME', '#cfd5de', 'FASCES & OLIVE BRANCH', 'D MINTMARK'),
  },
  {
    id: '1943-copper-cent',
    name: '1943 Bronze Transitional Error Cent',
    year: '1943',
    mintMark: 'None (P)',
    rarityLevel: 'Museum Rarity // Million Dollar Error',
    composition: '95% Copper, 5% Tin/Zinc (3.11g)',
    description: 'Struck in bronze by mistake during WWII when pennies were mandated to be zinc-coated steel. Only ~15-20 confirmed.',
    mintage: 'Fewer than 25 believed struck',
    series: 'Lincoln Cent Error',
    image: createObverseCoinSvg('Lincoln Cent', '1943', '#9c5427', 'BRONZE PLANCHET ERROR', 'P'),
    reverseImage: createReverseCoinSvg('Lincoln Cent', 'ONE CENT', '#9c5427', 'WHEAT REVERSE', 'AUCTION RECORD $1.7M'),
  },
  {
    id: '1907-saint-gaudens',
    name: '1907 Saint-Gaudens $20 High Relief',
    year: '1907',
    mintMark: 'None (P)',
    rarityLevel: 'Masterpiece / Ultra-Rare',
    composition: '90% Gold, 10% Copper (0.9675 oz AGW)',
    description: 'Augustus Saint-Gaudens high-relief masterwork with Roman numerals (MCMVII). Struck multiple times on medal press.',
    mintage: '12,367',
    series: 'Saint-Gaudens Double Eagle',
    image: createObverseCoinSvg('Double Eagle', 'MCMVII', '#ffd700', 'STRIDING LIBERTY', ''),
    reverseImage: createReverseCoinSvg('Double Eagle', 'TWENTY DOLLARS', '#ffd700', 'FLYING EAGLE & SUN', 'MCMVII HIGH RELIEF'),
  },
];

export interface SampleTray {
  id: string;
  name: string;
  coinCount: number;
  description: string;
  image: string;
  highlights: string;
}

export function createMultiCoinTraySvg(
  items: Array<{ name: string; year: string; mint: string; color: string; denom: string }>,
  title: string
): string {
  const count = items.length;
  // Determine grid dimensions (e.g. 5x5 for 25 coins, 4x5 for 20 coins, 4x3 for 12 coins)
  const cols = count > 16 ? 5 : count > 9 ? 4 : 3;
  const rows = Math.ceil(count / cols);

  const canvasWidth = 1000;
  const canvasHeight = 1000;
  const marginX = 60;
  const marginTop = 110;
  const marginBottom = 60;

  const cellW = (canvasWidth - marginX * 2) / cols;
  const cellH = (canvasHeight - marginTop - marginBottom) / rows;
  const coinRadius = Math.min(cellW, cellH) * 0.42;

  let coinsSvg = '';

  items.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = marginX + col * cellW + cellW / 2;
    const cy = marginTop + row * cellH + cellH / 2;
    const gradId = `coinGrad_${idx}`;

    coinsSvg += `
    <!-- Slot ${idx + 1} Recess -->
    <circle cx="${cx}" cy="${cy}" r="${coinRadius + 6}" fill="#080c14" stroke="#1e293b" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${coinRadius + 3}" fill="#0f172a" opacity="0.6"/>

    <!-- Coin Gradient -->
    <defs>
      <radialGradient id="${gradId}" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
        <stop offset="30%" stop-color="${item.color}"/>
        <stop offset="75%" stop-color="#2a1e12"/>
        <stop offset="100%" stop-color="#110b06"/>
      </radialGradient>
    </defs>

    <!-- Coin Disk -->
    <circle cx="${cx}" cy="${cy}" r="${coinRadius}" fill="url(#${gradId})" stroke="#475569" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${coinRadius - 5}" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,3" opacity="0.6"/>

    <!-- Relief Text & Number Badge -->
    <text x="${cx}" y="${cy - coinRadius * 0.35}" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="${Math.max(8, coinRadius * 0.22)}" fill="#ffffff" letter-spacing="1.5">LIBERTY</text>
    <circle cx="${cx}" cy="${cy}" r="${coinRadius * 0.32}" fill="${item.color}" opacity="0.35"/>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="${Math.max(7, coinRadius * 0.2)}" fill="#ffffff">${item.denom}</text>
    <text x="${cx}" y="${cy + coinRadius * 0.45}" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="${Math.max(9, coinRadius * 0.24)}" fill="#ffffff">${item.year} ${item.mint}</text>

    <!-- Slot Tag Indicator -->
    <rect x="${cx - 16}" y="${cy + coinRadius + 8}" width="32" height="13" rx="6.5" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="${cx}" y="${cy + coinRadius + 17.5}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#38bdf8">#${idx + 1}</text>
    `;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <radialGradient id="velvetBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#141c2e"/>
      <stop offset="60%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#050811"/>
    </radialGradient>
    <filter id="velvetTexture" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="0.1 0 0 0 0  0 0.1 0 0 0  0 0 0.15 0 0  0 0 0 0.1 0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
    </filter>
  </defs>

  <!-- Deep Blue/Slate Velvet Collector Tray Background -->
  <rect width="1000" height="1000" rx="36" fill="url(#velvetBg)"/>
  <rect x="18" y="18" width="964" height="964" rx="26" fill="none" stroke="#d97706" stroke-width="3" stroke-opacity="0.4" stroke-dasharray="10,6"/>
  <rect x="28" y="28" width="944" height="944" rx="20" fill="none" stroke="#334155" stroke-width="1.5"/>

  <!-- Top Brass Plaque / Tray Header -->
  <g transform="translate(250, 32)">
    <rect x="0" y="0" width="500" height="48" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="250" y="24" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="900" font-size="14" fill="#fbbf24" letter-spacing="3">${title.toUpperCase()}</text>
    <text x="250" y="40" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8" letter-spacing="2">AI MULTI-COIN SCANNER MATRIX • ${count} SPECIMENS SIMULTANEOUSLY</text>
  </g>

  <!-- Coins Layer -->
  ${coinsSvg}

  <!-- Footer Plaque -->
  <text x="500" y="976" text-anchor="middle" font-family="monospace" font-size="9" fill="#64748b" letter-spacing="3">COINRARITY PRO • FORENSIC MULTI-SPECIMEN BATCH RECOGNITION (UP TO 25 COINS)</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 25 Coins Master Specimen Tray
export const SAMPLE_TRAY_25_COINS = createMultiCoinTraySvg([
  { name: 'Lincoln Cent', year: '1909', mint: 'S VDB', color: '#b45309', denom: '1¢' },
  { name: 'Lincoln Cent', year: '1914', mint: 'D', color: '#92400e', denom: '1¢' },
  { name: 'Lincoln Cent', year: '1931', mint: 'S', color: '#b45309', denom: '1¢' },
  { name: 'Lincoln Cent DDO', year: '1955', mint: 'DDO', color: '#b45309', denom: '1¢' },
  { name: 'Indian Head Cent', year: '1877', mint: '', color: '#78350f', denom: '1¢' },

  { name: 'Buffalo Nickel', year: '1937', mint: 'D 3-Leg', color: '#94a3b8', denom: '5¢' },
  { name: 'Liberty Head Nickel', year: '1912', mint: 'S', color: '#cbd5e1', denom: '5¢' },
  { name: 'Mercury Dime', year: '1916', mint: 'D', color: '#e2e8f0', denom: '10¢' },
  { name: 'Mercury Dime', year: '1921', mint: '', color: '#e2e8f0', denom: '10¢' },
  { name: 'Roosevelt Dime', year: '1996', mint: 'W', color: '#e2e8f0', denom: '10¢' },

  { name: 'Standing Liberty Quarter', year: '1916', mint: '', color: '#f1f5f9', denom: '25¢' },
  { name: 'Washington Quarter', year: '1932', mint: 'D', color: '#f1f5f9', denom: '25¢' },
  { name: 'Washington Quarter', year: '1932', mint: 'S', color: '#f1f5f9', denom: '25¢' },
  { name: 'Barber Quarter', year: '1901', mint: 'S', color: '#cbd5e1', denom: '25¢' },
  { name: 'Walking Liberty Half', year: '1921', mint: 'S', color: '#e2e8f0', denom: '50¢' },

  { name: 'Walking Liberty Half', year: '1938', mint: 'D', color: '#e2e8f0', denom: '50¢' },
  { name: 'Franklin Half Dollar', year: '1953', mint: 'S FBL', color: '#e2e8f0', denom: '50¢' },
  { name: 'Morgan Silver Dollar', year: '1878', mint: 'CC', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Silver Dollar', year: '1889', mint: 'CC', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Silver Dollar', year: '1893', mint: 'S Key', color: '#f8fafc', denom: '$1' },

  { name: 'Morgan Silver Dollar', year: '1895', mint: 'Proof', color: '#f8fafc', denom: '$1' },
  { name: 'Peace Silver Dollar', year: '1921', mint: 'High Relief', color: '#f8fafc', denom: '$1' },
  { name: 'Peace Silver Dollar', year: '1928', mint: 'Key Date', color: '#f8fafc', denom: '$1' },
  { name: 'Saint-Gaudens Double Eagle', year: '1907', mint: 'Gold', color: '#fbbf24', denom: '$20' },
  { name: 'Indian Head Eagle', year: '1908', mint: 'S Gold', color: '#f59e0b', denom: '$10' },
], 'Certified Master Hoard • 25 Rare Specimen Tray');

// 12 Coins Morgan & Peace Silver Dollar Tray
export const SAMPLE_TRAY_12_DOLLARS = createMultiCoinTraySvg([
  { name: 'Morgan Dollar', year: '1878', mint: 'CC 8-TF', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1879', mint: 'CC VAM-3', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1880', mint: 'S PL', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1881', mint: 'S Gem', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1882', mint: 'CC DMPL', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1885', mint: 'CC GSA', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1889', mint: 'CC Rare', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1893', mint: 'S King', color: '#f8fafc', denom: '$1' },
  { name: 'Morgan Dollar', year: '1921', mint: 'D', color: '#f8fafc', denom: '$1' },
  { name: 'Peace Dollar', year: '1921', mint: 'High Relief', color: '#f8fafc', denom: '$1' },
  { name: 'Peace Dollar', year: '1928', mint: 'Key Date', color: '#f8fafc', denom: '$1' },
  { name: 'Peace Dollar', year: '1934', mint: 'S Semi-Key', color: '#f8fafc', denom: '$1' },
], 'Morgan & Peace Silver Dollar Collector Case • 12 Coins');

// 16 Coins US 20th Century Type Set Tray
export const SAMPLE_TRAY_16_TYPESET = createMultiCoinTraySvg([
  { name: 'Indian Cent', year: '1908', mint: 'S', color: '#b45309', denom: '1¢' },
  { name: 'Lincoln Wheat Cent', year: '1909', mint: 'S VDB', color: '#92400e', denom: '1¢' },
  { name: 'Lincoln Steel Cent', year: '1943', mint: '', color: '#cbd5e1', denom: '1¢' },
  { name: 'Lincoln Memorial', year: '1960', mint: 'Small Date', color: '#b45309', denom: '1¢' },
  { name: 'Liberty V Nickel', year: '1912', mint: 'D', color: '#94a3b8', denom: '5¢' },
  { name: 'Buffalo Nickel', year: '1937', mint: 'D', color: '#94a3b8', denom: '5¢' },
  { name: 'Jefferson Wartime', year: '1942', mint: 'P 35% Ag', color: '#cbd5e1', denom: '5¢' },
  { name: 'Barber Dime', year: '1914', mint: 'D', color: '#e2e8f0', denom: '10¢' },
  { name: 'Mercury Dime', year: '1916', mint: 'D', color: '#e2e8f0', denom: '10¢' },
  { name: 'Roosevelt Silver', year: '1949', mint: 'S', color: '#e2e8f0', denom: '10¢' },
  { name: 'Standing Liberty', year: '1917', mint: 'Type 1', color: '#f1f5f9', denom: '25¢' },
  { name: 'Washington Quarter', year: '1932', mint: 'D', color: '#f1f5f9', denom: '25¢' },
  { name: 'Walking Liberty Half', year: '1938', mint: 'D', color: '#e2e8f0', denom: '50¢' },
  { name: 'Franklin Half', year: '1953', mint: 'S FBL', color: '#e2e8f0', denom: '50¢' },
  { name: 'Kennedy Silver Half', year: '1964', mint: '90% Ag', color: '#e2e8f0', denom: '50¢' },
  { name: 'Morgan Silver Dollar', year: '1878', mint: 'CC', color: '#f8fafc', denom: '$1' },
], 'US 20th Century Type Set Sheet • 16 Coins');

export const SAMPLE_MULTI_COIN_TRAYS: SampleTray[] = [
  {
    id: 'tray-25-master-hoard',
    name: '25-Coin Key Date & Variety Hoard',
    coinCount: 25,
    description: 'Full 5×5 collector tray containing 25 landmark US key dates, doubled dies, Morgan dollars, and gold eagles.',
    image: SAMPLE_TRAY_25_COINS,
    highlights: '1909-S VDB, 1955 DDO, 1893-S Morgan, 1907 $20 Gold',
  },
  {
    id: 'tray-12-silver-dollars',
    name: '12-Coin Morgan & Peace Dollar Case',
    coinCount: 12,
    description: 'Velvet collector case featuring 12 vintage uncirculated silver dollars including Carson City CC mintmarks.',
    image: SAMPLE_TRAY_12_DOLLARS,
    highlights: '1878-CC, 1889-CC, 1893-S, 1921 High Relief Peace',
  },
  {
    id: 'tray-16-type-set',
    name: '16-Coin 20th Century Type Set',
    coinCount: 16,
    description: 'Classic 4×4 binder page spanning 1¢ to $1 across 100 years of US mint design history.',
    image: SAMPLE_TRAY_16_TYPESET,
    highlights: 'Indian Cent, Buffalo Nickel, Standing Liberty, Morgan',
  },
];
