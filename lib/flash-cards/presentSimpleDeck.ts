import type { FlashCard } from "@/types/recall";

export const FLASH_CARD_DECK_SIZE = 12;

export const PRESENT_SIMPLE_FLASH_CARDS: FlashCard[] = [
  {
    id: "present-simple-flash-1",
    lessonSlug: "present-simple",
    front: "When do we use Present Simple?",
    back: "ใช้พูดถึงกิจวัตร สิ่งที่ทำเป็นประจำ และข้อเท็จจริง",
    cue: "Subject + Verb 1",
    family: "meaning",
    section: 1,
  },
  {
    id: "present-simple-flash-2",
    lessonSlug: "present-simple",
    front: "I go to school every day.\nWhat does this sentence show?",
    back: "กิจวัตร / สิ่งที่ทำเป็นประจำ",
    family: "meaning",
    section: 1,
  },
  {
    id: "present-simple-flash-3",
    lessonSlug: "present-simple",
    front: "They ___ football after school.",
    back: "play",
    cue: "I / You / We / They + Verb 1",
    family: "recognition",
    section: 2,
  },
  {
    id: "present-simple-flash-4",
    lessonSlug: "present-simple",
    front: "He ___ football every day.",
    back: "plays",
    cue: "He / She / It → กริยาเติม -s / -es",
    family: "recognition",
    section: 3,
  },
  {
    id: "present-simple-flash-5",
    lessonSlug: "present-simple",
    front: "She ___ to school by bus.",
    back: "goes",
    cue: "คำกริยาบางคำเติม -es",
    family: "recognition",
    section: 3,
  },
  {
    id: "present-simple-flash-6",
    lessonSlug: "present-simple",
    front: "She plays tennis.\nMake it negative.",
    back: "She doesn't play tennis.",
    cue: "doesn't + Verb 1",
    family: "transformation",
    section: 4,
  },
  {
    id: "present-simple-flash-7",
    lessonSlug: "present-simple",
    front: "They like milk.\nMake it negative.",
    back: "They don't like milk.",
    cue: "don't + Verb 1",
    family: "transformation",
    section: 4,
  },
  {
    id: "present-simple-flash-8",
    lessonSlug: "present-simple",
    front: "Make a Yes/No question:\nhe / play football",
    back: "Does he play football?",
    cue: "Does + subject + Verb 1?",
    family: "question",
    section: 5,
  },
  {
    id: "present-simple-flash-9",
    lessonSlug: "present-simple",
    front: "Do you like English?\nGive a short positive answer.",
    back: "Yes, I do.",
    family: "question",
    section: 5,
  },
  {
    id: "present-simple-flash-10",
    lessonSlug: "present-simple",
    front: "you / go to school / How",
    back: "How do you go to school?",
    cue: "Wh-word + do/does + subject + Verb 1?",
    family: "question",
    section: 6,
  },
  {
    id: "present-simple-flash-11",
    lessonSlug: "present-simple",
    front: 'Which word means "เสมอ"?',
    back: "always",
    cue: "always ≈ 100%",
    family: "meaning",
    section: 7,
  },
  {
    id: "present-simple-flash-12",
    lessonSlug: "present-simple",
    front: 'Which word means "ไม่เคย"?',
    back: "never",
    cue: "never = 0%",
    family: "meaning",
    section: 7,
  },
];

export function getFlashCardDeck(lessonSlug: string): FlashCard[] {
  if (lessonSlug === "present-simple") {
    return PRESENT_SIMPLE_FLASH_CARDS;
  }

  return [];
}
