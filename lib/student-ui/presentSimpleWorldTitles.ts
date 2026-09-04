export const PRESENT_SIMPLE_WORLD_TITLES = [
  "Garden Gate",
  "Playground",
  "One-Helper Workshop",
  "Quiet Shelter",
  "Question Booth",
  "Clue Trail",
  "Clock Garden",
  "Clubhouse Map",
] as const;

export type PresentSimpleWorldTitle =
  (typeof PRESENT_SIMPLE_WORLD_TITLES)[number];
