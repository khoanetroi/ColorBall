export const BallColor = {
  None: 0,
  // Primaries
  Red: 1,
  Blue: 2,
  Yellow: 3,
  // Secondaries
  Orange: 4,
  Purple: 5,
  Green: 6,
  // Tertiaries
  RedOrange: 7,
  RedPurple: 8,
  BluePurple: 9,
  BlueGreen: 10,
  YellowGreen: 11,
  YellowOrange: 12,
  // SPECIALS (Mixers)
  White: 13,
  Black: 14,
  // PASTELS (Base + White)
  Pink: 15,
  SkyBlue: 16,
  Mint: 17,
  Lavender: 18,
  // SHADES (Base + Black)
  Maroon: 19,
  Navy: 20,
  Brown: 21,
  // ULTIMATE
  Rainbow: 22,
} as const;

export type BallColorCode = (typeof BallColor)[keyof typeof BallColor];

export const primaryColors = [BallColor.Red, BallColor.Blue, BallColor.Yellow] as const;
export const secondaryColors = [BallColor.Orange, BallColor.Purple, BallColor.Green] as const;
export const tertiaryColors = [
  BallColor.RedOrange,
  BallColor.RedPurple,
  BallColor.BluePurple,
  BallColor.BlueGreen,
  BallColor.YellowGreen,
  BallColor.YellowOrange,
] as const;

export const mixerColors = [BallColor.White, BallColor.Black] as const;

// Targets for each level - Level 3 now aims for Rainbow!
const levelTargetColors: Record<number, readonly BallColorCode[]> = {
  0: primaryColors,
  1: primaryColors,
  2: [...secondaryColors, BallColor.Pink, BallColor.SkyBlue, BallColor.Lavender] as const,
  3: [BallColor.Rainbow, BallColor.Maroon, BallColor.Navy, BallColor.Brown] as const,
};

const colorLabels: Record<BallColorCode, string> = {
  [BallColor.None]: 'None',
  [BallColor.Red]: 'Red',
  [BallColor.Blue]: 'Blue',
  [BallColor.Yellow]: 'Yellow',
  [BallColor.Orange]: 'Orange',
  [BallColor.Purple]: 'Purple',
  [BallColor.Green]: 'Green',
  [BallColor.RedOrange]: 'Red Orange',
  [BallColor.RedPurple]: 'Red Purple',
  [BallColor.BluePurple]: 'Blue Purple',
  [BallColor.BlueGreen]: 'Blue Green',
  [BallColor.YellowGreen]: 'Yellow Green',
  [BallColor.YellowOrange]: 'Yellow Orange',
  [BallColor.White]: 'White sugar',
  [BallColor.Black]: 'Black Pearl',
  [BallColor.Pink]: 'Sweet Pink',
  [BallColor.SkyBlue]: 'Sky Blue',
  [BallColor.Mint]: 'Minty Fresh',
  [BallColor.Lavender]: 'Lavender',
  [BallColor.Maroon]: 'Dark Maroon',
  [BallColor.Navy]: 'Midnight Navy',
  [BallColor.Brown]: 'Roasted Brown',
  [BallColor.Rainbow]: 'RAINBOW CANDY 🌈',
};

export const getBallColorLabel = (color: BallColorCode): string => colorLabels[color] ?? 'Unknown';

export const getHexColor = (color: BallColorCode): string => {
  switch (color) {
    case BallColor.Red: return '#ff4d4d';
    case BallColor.Blue: return '#4d79ff';
    case BallColor.Yellow: return '#ffd84d';
    case BallColor.Orange: return '#ff9f43';
    case BallColor.Purple: return '#a855f7';
    case BallColor.Green: return '#22c55e';
    case BallColor.RedOrange: return '#ff7a2f';
    case BallColor.RedPurple: return '#d96df0';
    case BallColor.BluePurple: return '#7c7dff';
    case BallColor.BlueGreen: return '#29d3c3';
    case BallColor.YellowGreen: return '#d9ea45';
    case BallColor.YellowOrange: return '#ffbf4d';
    case BallColor.White: return '#ffffff';
    case BallColor.Black: return '#1e293b';
    case BallColor.Pink: return '#fda4af';
    case BallColor.SkyBlue: return '#7dd3fc';
    case BallColor.Mint: return '#6ee7b7';
    case BallColor.Lavender: return '#c084fc';
    case BallColor.Maroon: return '#7f1d1d';
    case BallColor.Navy: return '#1e1b4b';
    case BallColor.Brown: return '#451a03';
    case BallColor.Rainbow: return '#ffffff'; // Will be handled by special shader/material
    default: return '#ffffff';
  }
};

export const getSpawnColorsForLevel = (level: number): readonly BallColorCode[] => {
  if (level === 2) return [...primaryColors, BallColor.White];
  if (level >= 3) return [...primaryColors, BallColor.White, BallColor.Black];
  return primaryColors;
};

export const getTargetColorsForLevel = (level: number): readonly BallColorCode[] => {
  return levelTargetColors[level] ?? levelTargetColors[1];
};

export const mixColors = (a: BallColorCode, b: BallColorCode): BallColorCode => {
  if (a === BallColor.None || b === BallColor.None) return BallColor.None;
  if (a === b) return a;

  const min = Math.min(a, b);
  const max = Math.max(a, b);

  // Rainbow Logic: Mix any Tertiary or advanced mix with another advanced color
  if (min >= 7 && max >= 7) return BallColor.Rainbow;

  // Primary Mixes
  if (min === BallColor.Red && max === BallColor.Blue) return BallColor.Purple;
  if (min === BallColor.Red && max === BallColor.Yellow) return BallColor.Orange;
  if (min === BallColor.Blue && max === BallColor.Yellow) return BallColor.Green;

  // White Mixes (Pastels/Tints)
  if (max === BallColor.White) {
    if (min === BallColor.Red) return BallColor.Pink;
    if (min === BallColor.Blue) return BallColor.SkyBlue;
    if (min === BallColor.Green) return BallColor.Mint;
    if (min === BallColor.Purple) return BallColor.Lavender;
    if (min === BallColor.Yellow) return BallColor.YellowGreen; // Light yellow
  }

  // Black Mixes (Shades)
  if (max === BallColor.Black) {
    if (min === BallColor.Red) return BallColor.Maroon;
    if (min === BallColor.Blue) return BallColor.Navy;
    if (min === BallColor.Orange) return BallColor.Brown;
    if (min === BallColor.Yellow) return BallColor.Brown;
  }

  // Tertiary Mixes
  if (min === BallColor.Red && max === BallColor.Orange) return BallColor.RedOrange;
  if (min === BallColor.Red && max === BallColor.Purple) return BallColor.RedPurple;
  if (min === BallColor.Blue && max === BallColor.Purple) return BallColor.BluePurple;
  if (min === BallColor.Blue && max === BallColor.Green) return BallColor.BlueGreen;
  if (min === BallColor.Yellow && max === BallColor.Green) return BallColor.YellowGreen;
  if (min === BallColor.Yellow && max === BallColor.Orange) return BallColor.YellowOrange;

  return BallColor.None;
};
