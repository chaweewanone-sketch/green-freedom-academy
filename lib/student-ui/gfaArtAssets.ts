/**
 * Section 1 original-art slots.
 * Files are optional until GFA illustrations are supplied.
 * Preferred: WebP at the listed path. PNG or SVG with the same basename is also accepted
 * by renaming to the listed filename or updating `src`.
 * ART = visual meaning + world storytelling. HTML = grammar authority.
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
  | "workshop-he-she-it"
  | "bai-tong-pause-guide"
  | "quiet-shelter-not-doing"
  | "bai-tong-question-guide"
  | "question-booth-ask-answer"
  | "bai-tong-clue-guide"
  | "clue-trail-garden"
  | "bai-tong-clock-guide"
  | "clock-garden-routines"
  | "bai-tong-clubhouse-guide"
  | "clubhouse-map-finale"
  | "quiz-practice-garden"
  | "bai-tong-quiz-coach"
  | "bai-tong-quiz-coach-pointing"
  | "millionaire-adventure-clearing"
  | "bai-tong-millionaire-companion"
  | "memory-garden-background";

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

export const GFA_SECTION4_ART = {
  baiTongPauseGuide: {
    id: "bai-tong-pause-guide",
    src: "/gfa/characters/bai-tong-pause-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  quietShelterNotDoing: {
    id: "quiet-shelter-not-doing",
    src: "/gfa/scenes/quiet-shelter-not-doing.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION5_ART = {
  baiTongQuestionGuide: {
    id: "bai-tong-question-guide",
    src: "/gfa/characters/bai-tong-question-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  questionBoothAskAnswer: {
    id: "question-booth-ask-answer",
    src: "/gfa/scenes/question-booth-ask-answer.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION6_ART = {
  baiTongClueGuide: {
    id: "bai-tong-clue-guide",
    src: "/gfa/characters/bai-tong-clue-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  clueTrailGarden: {
    id: "clue-trail-garden",
    src: "/gfa/scenes/clue-trail-garden.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION7_ART = {
  baiTongClockGuide: {
    id: "bai-tong-clock-guide",
    src: "/gfa/characters/bai-tong-clock-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  clockGardenRoutines: {
    id: "clock-garden-routines",
    src: "/gfa/scenes/clock-garden-routines.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_SECTION8_ART = {
  baiTongClubhouseGuide: {
    id: "bai-tong-clubhouse-guide",
    src: "/gfa/characters/bai-tong-clubhouse-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
  clubhouseMapFinale: {
    id: "clubhouse-map-finale",
    src: "/gfa/scenes/clubhouse-map-finale.webp",
    aspect: "16 / 10",
    transparent: false,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_QUIZ_ART = {
  quizPracticeGarden: {
    id: "quiz-practice-garden",
    src: "/gfa/scenes/quiz-practice-garden.webp",
    aspect: "16 / 9",
    transparent: false,
  },
  baiTongQuizCoach: {
    id: "bai-tong-quiz-coach",
    src: "/gfa/characters/bai-tong-quiz-coach.webp",
    aspect: "2 / 3",
    transparent: true,
  },
  baiTongQuizCoachPointing: {
    id: "bai-tong-quiz-coach-pointing",
    src: "/gfa/characters/bai-tong-quiz-coach-pointing.webp",
    aspect: "2 / 3",
    transparent: true,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

export const GFA_MILLIONAIRE_ART = {
  adventureClearing: {
    id: "millionaire-adventure-clearing",
    src: "/gfa/scenes/millionaire-adventure-clearing.webp",
    aspect: "16 / 9",
    transparent: false,
  },
  baiTongCompanion: {
    id: "bai-tong-millionaire-companion",
    src: "/gfa/characters/bai-tong-millionaire-companion.webp",
    aspect: "2 / 3",
    transparent: true,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;

/** Flash Cards / Memory Garden — calm review world (Sprint 58D). */
export const GFA_FLASH_ART = {
  memoryGardenBackground: {
    id: "memory-garden-background",
    src: "/gfa/scenes/memory-garden-background.png",
    aspect: "16 / 9",
    transparent: false,
  },
  baiTongPauseGuide: {
    id: "bai-tong-pause-guide",
    src: "/gfa/characters/bai-tong-pause-guide.webp",
    aspect: "5 / 6",
    transparent: true,
  },
} as const satisfies Record<string, GfaArtSlotSpec>;
