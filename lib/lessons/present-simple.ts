import type { LessonData } from "@/types/lesson";

export const presentSimpleLesson: LessonData = {
  slug: "present-simple",
  title: "Present Simple",
  steps: [
    {
      title: "Present Simple คืออะไร",
      description:
        "ใช้พูดถึงกิจวัตร ข้อเท็จจริง และสิ่งที่เกิดขึ้นเป็นประจำ",
      formula: "Subject + Verb 1",
      examples: ["I walk to school every day.", "We eat lunch at noon."],
      teacherTip: "เริ่มด้วยคำถามในชีวิตประจำวัน เช่น What do you do every morning?",
      estimatedMinutes: 5,
    },
    {
      title: "I / You / We / They",
      description: "ใช้คำกริยารูปปกติ",
      formula: "I/You/We/They + Verb 1",
      examples: [
        "I play football after school.",
        "They study English every day.",
      ],
      teacherTip: "ให้นักเรียนตอบประโยคของตัวเองด้วย I / We / They",
      estimatedMinutes: 5,
    },
    {
      title: "He / She / It",
      description: "คำกริยาส่วนใหญ่เติม s หรือ es",
      formula: "He/She/It + Verb-s/es",
      examples: [
        "He plays football after school.",
        "She watches TV in the evening.",
      ],
      teacherTip: "เน้นคำกริยาเติม -s / -es ด้วยตัวอย่าง He plays / She watches",
      estimatedMinutes: 7,
    },
    {
      title: "ประโยคปฏิเสธ",
      description: "ใช้ do not หรือ does not",
      formula: "Subject + do/does not + Verb 1",
      examples: ["I don't drink coffee.", "She doesn't walk to school."],
      teacherTip: "ฝึกแปลงประโยตบวกเป็นปฏิเสธทีละประโยค",
      estimatedMinutes: 8,
    },
  ],
};
