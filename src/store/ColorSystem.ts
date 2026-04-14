export const BallColor = {
  None: 0,
  Red: 1,
  Blue: 2,
  Yellow: 3,
  Orange: 4,
  Purple: 5,
  Green: 6,
  RedOrange: 7,
  RedPurple: 8,
  BluePurple: 9,
  BlueGreen: 10,
  YellowGreen: 11,
  YellowOrange: 12,
  // New "Premium" Colors
  White: 13,
  Pink: 14,
  Sky: 15,
  Cream: 16,
  Mint: 17,
  Lavender: 18,
  Peach: 19,
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

export const pastelColors = [
  BallColor.Pink,
  BallColor.Sky,
  BallColor.Cream,
  BallColor.Mint,
  BallColor.Lavender,
  BallColor.Peach,
] as const;

const levelTargetColors: Record<number, readonly BallColorCode[]> = {
  0: primaryColors,
  1: primaryColors,
  2: [...secondaryColors, BallColor.White, BallColor.Pink],
  3: [...tertiaryColors, ...pastelColors],
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
  [BallColor.White]: 'Sugar White',
  [BallColor.Pink]: 'Boba Pink',
  [BallColor.Sky]: 'Sky Blue',
  [BallColor.Cream]: 'Cream',
  [BallColor.Mint]: 'Mint Green',
  [BallColor.Lavender]: 'Lavender',
  [BallColor.Peach]: 'Peach',
};

export const getBallColorLabel = (color: BallColorCode): string => colorLabels[color] ?? 'Unknown';

export const getHexColor = (color: BallColorCode): string => {
  switch (color) {
    case BallColor.Red:
      return '#ff4d4d';
    case BallColor.Blue:
      return '#4d79ff';
    case BallColor.Yellow:
      return '#ffd84d';
    case BallColor.Orange:
      return '#ff9f43';
    case BallColor.Purple:
      return '#a855f7';
    case BallColor.Green:
      return '#22c55e';
    case BallColor.RedOrange:
      return '#ff7a2f';
    case BallColor.RedPurple:
      return '#d96df0';
    case BallColor.BluePurple:
      return '#7c7dff';
    case BallColor.BlueGreen:
      return '#29d3c3';
    case BallColor.YellowGreen:
      return '#d9ea45';
    case BallColor.YellowOrange:
      return '#ffbf4d';
    case BallColor.White:
      return '#ffffff';
    case BallColor.Pink:
      return '#ff85a2';
    case BallColor.Sky:
      return '#a5d8ff';
    case BallColor.Cream:
      return '#faf3e0';
    case BallColor.Mint:
      return '#b2f2bb';
    case BallColor.Lavender:
      return '#d0bfff';
    case BallColor.Peach:
      return '#ffcc99';
    default:
      return '#ffffff';
  }
};

export const getSpawnColorsForLevel = (level: number): readonly BallColorCode[] => {
  if (level >= 2) return [...primaryColors, BallColor.White];
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

  // Classic Mixes
  if (min === BallColor.Red && max === BallColor.Blue) return BallColor.Purple;
  if (min === BallColor.Red && max === BallColor.Yellow) return BallColor.Orange;
  if (min === BallColor.Blue && max === BallColor.Yellow) return BallColor.Green;
  
  // Tertiary Mixes
  if (min === BallColor.Red && max === BallColor.Orange) return BallColor.RedOrange;
  if (min === BallColor.Red && max === BallColor.Purple) return BallColor.RedPurple;
  if (min === BallColor.Blue && max === BallColor.Purple) return BallColor.BluePurple;
  if (min === BallColor.Blue && max === BallColor.Green) return BallColor.BlueGreen;
  if (min === BallColor.Yellow && max === BallColor.Green) return BallColor.YellowGreen;
  if (min === BallColor.Yellow && max === BallColor.Orange) return BallColor.YellowOrange;

  // Pastel Mixes (Anything + White)
  if (max === BallColor.White) {
    if (min === BallColor.Red) return BallColor.Pink;
    if (min === BallColor.Blue) return BallColor.Sky;
    if (min === BallColor.Yellow) return BallColor.Cream;
    if (min === BallColor.Green) return BallColor.Mint;
    if (min === BallColor.Purple) return BallColor.Lavender;
    if (min === BallColor.Orange) return BallColor.Peach;
  }
  
  // Fallback for White as min
  if (min === BallColor.White) {
     if (max === BallColor.Red) return BallColor.Pink;
     // ... already covered by max check if max is color, but let's be safe
  }

  return BallColor.None;
};
