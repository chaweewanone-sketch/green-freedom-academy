/**
 * Section 1 original-art slots.
 * Files are optional until GFA illustrations are supplied.
 * Preferred: WebP at the listed path. PNG or SVG with the same basename is also accepted
 * by renaming to the listed filename or updating `src`.
 * Do not bake educational text into artwork.
 */
export type GfaArtSlotId =
  | "bai-tong-explaining"
  | "habit-walk-to-school"
  | "general-truth-sunrise-east"
  | "everyday-garden-background"
  | "lunch-support"
  | "bai-tong-group-coach"
  | "playground-i-you-we-they"
  | "verb-leaf-s"
  | "bai-tong-singular-stamp"
  | "workshop-he-she-it";

export type GfaArtSlotSpec = {
  id: GfaArtSlotId;
  src: string;
  aspect: `${number} / ${number}`;
  transparent: boolean;
};

export const GFA_SECTION1_ART = {
  baiTongExplaining: {
    id: "bai-tong-explaining",
    src: "/gfa/characters/bai-tong-explaining.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  habitWalkToSchool: {
    id: "habit-walk-to-school",
    src: "/gfa/scenes/habit-walk-to-school.webp",
    aspect: "16 / 10",
    transparent: false,
  },
  generalTruthSunrise: {
    id: "general-truth-sunrise-east",
    src: "/gfa/scenes/general-truth-sunrise-east.webp",
    aspect: "16 / 10",
    transparent: false,
  },
  everydayGardenBackground: {
    id: "everyday-garden-background",
    src: "/gfa/scenes/everyday-garden-background.webp",
    aspect: "16 / 9",
    transparent: false,
  },
  lunchSupport: {
    id: "lunch-support",
    src: "/gfa/props/lunch-support.webp",
    aspect: "1 / 1",
    transparent: true,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION2_ART = {
  baiTongGroupCoach: {
    id: "bai-tong-group-coach",
    src: "/gfa/characters/bai-tong-group-coach.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  playgroundIYouWeThey: {
    id: "playground-i-you-we-they",
    src: "/gfa/scenes/playground-i-you-we-they.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION3_ART = {
  baiTongSingularStamp: {
    id: "bai-tong-singular-stamp",
    src: "/gfa/characters/bai-tong-singular-stamp.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  workshopHeSheIt: {
    id: "workshop-he-she-it",
    src: "/gfa/scenes/workshop-he-she-it.webp",
    aspect: "16 / 10",
    transparent: false,
  },
  verbLeafS: {
    id: "verb-leaf-s",
    src: "/gfa/props/verb-leaf-s.webp",
    aspect: "1 / 1",
    transparent: true,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;
