import type { LessonData } from "@/types/lesson";

export const pastSimpleLesson: LessonData = {
  slug: "past-simple",
  title: "Past Simple",
  steps: [
    {
      title: "Past Simple คืออะไร",
      description:
        "ใช้พูดถึงเหตุการณ์ที่เกิดขึ้นและจบแล้วในอดีต",
      formula: "Subject + Verb 2 / Verb-ed",
      examples: [
        "I visited my grandma yesterday.",
        "She watched a movie last night.",
      ],
      teacherTip:
        "เริ่มด้วยคำถาม When did you...? ให้นักเรียนตอบด้วยประโยคของตัวเอง",
      estimatedMinutes: 5,
    },
    {
      title: "คำกริยาช่องที่ 2",
      description: "คำกริยาปกติเติม -ed คำกริยาไม่ปกติเปลี่ยนรูป",
      formula: "Regular: Verb-ed · Irregular: Verb 2",
      examples: ["I played football.", "He went to school."],
      teacherTip: "แยกตัวอย่าง regular / irregular แล้วให้จำคู่ go → went",
      estimatedMinutes: 6,
    },
    {
      title: "เวลาในอดีต",
      description: "มักใช้กับ yesterday, last week, ago",
      formula: "Subject + Past Verb + time expression",
      examples: [
        "We studied English two days ago.",
        "They traveled last summer.",
      ],
      teacherTip: "ให้นักเรียนเติม time expression ในประโยคที่ครูอ่าน",
      estimatedMinutes: 5,
    },
    {
      title: "ประโยคปฏิเสธและคำถาม",
      description: "ใช้ did not + Verb 1 และ Did + Subject + Verb 1?",
      formula: "Did not / Did + Subject + Verb 1",
      examples: [
        "I did not go home early.",
        "Did you finish your homework?",
      ],
      teacherTip: "เน้นว่าหลัง did / did not ใช้ Verb 1 เสมอ",
      estimatedMinutes: 8,
    },
  ],
};
