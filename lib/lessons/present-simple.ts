import type { LessonData } from "@/types/lesson";

/** Original lesson generation data — preserved exactly, with optional planning metadata added. */
export const presentSimpleLesson: LessonData = {
  slug: "present-simple",
  title: "Present Simple",
  steps: [
    {
      title: "Present Simple คืออะไร",
      description:
        "ใช้พูดถึงกิจวัตร ข้อเท็จจริง และสิ่งที่เกิดขึ้นเป็นประจำ",
      formula: "Subject + Verb 1",
      examples: ["I go to school every day.", "She reads every night."],
      teacherTip: "เริ่มด้วยคำถามในชีวิตประจำวัน เช่น What do you do every morning?",
      estimatedMinutes: 5,
    },
    {
      title: "I / You / We / They",
      description: "ใช้คำกริยารูปปกติ",
      formula: "I/You/We/They + Verb 1",
      examples: ["I go to school every day.", "She reads every night."],
      teacherTip: "ให้นักเรียนตอบประโยคของตัวเองด้วย I / We / They",
      estimatedMinutes: 5,
    },
    {
      title: "He / She / It",
      description: "คำกริยาส่วนใหญ่เติม s หรือ es",
      formula: "He/She/It + Verb-s/es",
      examples: ["I go to school every day.", "She reads every night."],
      teacherTip: "เน้นคำกริยาเติม -s / -es ด้วยตัวอย่าง He plays / She watches",
      estimatedMinutes: 7,
    },
    {
      title: "ประโยคปฏิเสธ",
      description: "ใช้ do not หรือ does not",
      formula: "Subject + do/does not + Verb 1",
      examples: ["I go to school every day.", "She reads every night."],
      teacherTip: "ฝึกแปลงประโยตบวกเป็นปฏิเสธทีละประโยค",
      estimatedMinutes: 8,
    },
  ],
};
