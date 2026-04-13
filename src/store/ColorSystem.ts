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

const levelTargetColors: Record<number, readonly BallColorCode[]> = {
  0: primaryColors,
  1: primaryColors,
  2: secondaryColors,
  3: tertiaryColors,
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
    default:
      return '#ffffff';
  }
};

export const getSpawnColorsForLevel = (): readonly BallColorCode[] => {
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

  if (min === BallColor.Red && max === BallColor.Blue) return BallColor.Purple;
  if (min === BallColor.Red && max === BallColor.Yellow) return BallColor.Orange;
  if (min === BallColor.Blue && max === BallColor.Yellow) return BallColor.Green;
  if (min === BallColor.Red && max === BallColor.Orange) return BallColor.RedOrange;
  if (min === BallColor.Red && max === BallColor.Purple) return BallColor.RedPurple;
  if (min === BallColor.Blue && max === BallColor.Purple) return BallColor.BluePurple;
  if (min === BallColor.Blue && max === BallColor.Green) return BallColor.BlueGreen;
  if (min === BallColor.Yellow && max === BallColor.Green) return BallColor.YellowGreen;
  if (min === BallColor.Yellow && max === BallColor.Orange) return BallColor.YellowOrange;

  return BallColor.None;
};
