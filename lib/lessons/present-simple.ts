import type { LessonData } from "@/types/lesson";

export const presentSimpleLesson: LessonData = {
  slug: "present-simple",
  title: "Present Simple",
  contentVersion: 2,
  steps: [
    {
      title: "Present Simple คืออะไร",
      description: `ใช้พูดถึงสิ่งที่ทำเป็นประจำ สิ่งที่เกิดขึ้นเป็นปกติ หรือสิ่งที่เป็นจริงทั่วไป ไม่ใช้กับสิ่งที่กำลังทำอยู่ตอนนี้
จำไว้ : Present Simple = ทำประจำ หรือ เป็นจริงเสมอ`,
      formula: "Subject + Verb 1",
      examples: [
        "I walk to school every day.",
        "We eat lunch at noon.",
        "The sun rises in the east.",
      ],
      teacherTip: "ให้นักเรียนบอกกิจวัตรหนึ่งประโยค และข้อเท็จจริงหนึ่งประโยค",
      estimatedMinutes: 5,
    },
    {
      title: "ประโยคบอกเล่า I / You / We / They",
      description:
        "I / You / We / They ใช้กริยารูปปกติ ไม่เติม -s ✓ They play football. ✗ They plays football. จำไว้: หลายคน และ I/You = ไม่เติม s",
      formula: "I/You/We/They + Verb 1",
      examples: [
        "I play football after school.",
        "You play the piano very well.",
        "We study English every day.",
        "They eat lunch at school.",
      ],
      teacherTip: "ให้นักเรียนสร้างประโยคของตัวเองด้วย I / We / They",
      estimatedMinutes: 5,
    },
    {
      title: "ประโยคบอกเล่า He / She / It และ -s / -es",
      description:
        "He / She / It และคำนามเอกพจน์ เติม -s คำที่ลงท้ายด้วย ch / sh / x / s มักเติม -es เช่น watch → watches, fix → fixes ✓ She watches TV. ✗ She watch TV. จำไว้: คนเดียวหรือสิ่งเดียว เติม s",
      formula: "He/She/It/singular noun + Verb-s/es",
      examples: [
        "He plays football after school.",
        "She watches TV in the evening.",
        "The cat sleeps on the sofa.",
        "My dad fixes bikes on weekends.",
      ],
      teacherTip: "ชี้ให้เห็น plays / watches / sleeps / fixes บนกระดาน",
      estimatedMinutes: 7,
    },
    {
      title: "ประโยคปฏิเสธ don't / doesn't",
      description:
        "don't = do not ใช้กับ I/You/We/They · doesn't = does not ใช้กับ He/She/It หลัง don't/doesn't กริยาหลักเป็น Verb 1 ไม่เติม -s ✓ She doesn't walk to school. ✗ She doesn't walks to school. จำไว้: ปฏิเสธแล้ว กริยาหลักกลับตัวเปล่า",
      formula: "I/You/We/They + don't/do not + Verb 1 · He/She/It + doesn't/does not + Verb 1",
      examples: [
        "I don't drink coffee.",
        "We do not use phones in class.",
        "She doesn't walk to school.",
        "It does not rain much here.",
      ],
      teacherTip: "ฝึกแปลงประโยคบอกเล่าเป็นปฏิเสธทีละประโยค",
      estimatedMinutes: 7,
    },
    {
      title: "คำถาม Yes/No และคำตอบสั้น",
      description:
        "ขึ้นต้นด้วย Do หรือ Does แล้วตามด้วยประธานและ Verb 1 หลัง Does กริยาหลักไม่เติม -s คำตอบสั้นใช้ do/does ซ้ำ ไม่ใช้กริยาหลัก ✓ Does she walk to school? ✗ Does she walks to school? จำไว้: ถามด้วย Do/Does — ตอบด้วย do/does",
      formula: "Do + I/you/we/they + Verb 1? · Does + he/she/it + Verb 1?",
      examples: [
        "Do you study English every day? — Yes, I do.",
        "Does she walk to school? — No, she doesn't.",
        "Do they clean the classroom after lunch? — Yes, they do.",
      ],
      teacherTip: "ถามนักเรียนจริงแล้วให้ตอบสั้น Yes, I do. / No, I don't.",
      estimatedMinutes: 8,
    },
    {
      title: "คำถาม Wh-",
      description:
        "วาง What / Where / When / Why / Who / How / What time ไว้หน้าโครง Do/Does ที่เรียนแล้ว Wh-word + do/does + Subject + Verb 1? ✓ Where does he keep his books? ✗ Where does he keeps his books? จำไว้: Wh + Do/Does + ประธาน + กริยาเปล่า",
      formula: "Wh-word + do/does + Subject + Verb 1?",
      examples: [
        "What do you do after school?",
        "Where does he keep his books?",
        "How do you get to school?",
        "What time do you go to bed?",
      ],
      teacherTip: "ให้นักเรียนถามเพื่อนด้วย What / Where / What time",
      estimatedMinutes: 8,
    },
    {
      title: "ความถี่และเวลา",
      description:
        "A. คำบอกความถี่\nalways usually often sometimes rarely never วางหน้ากริยาหลัก\n✓ I usually finish my homework.\n✗ I finish usually my homework.\n\nB. How often / บ่อยแค่ไหน\nHow often + do/does + Subject + Verb 1?\nใช้กับ every day, once a week, twice a day\n\nC. การบอกเวลา at / on / in\nat + นาฬิกาหรือ at night · on + วัน · in + ช่วงวัน\n\nจำไว้: คำความถี่อยู่หน้ากริยา · at นาฬิกา · on วัน · in ช่วงวัน",
      formula:
        "Subject + adverb + Verb · How often + do/does + Subject + Verb 1? · at + clock/night · on + day · in + part of day",
      examples: [
        "She often listens to English songs.",
        "How often do you exercise?",
        "I brush my teeth twice a day.",
        "He plays football on Saturdays.",
        "They read the news in the morning.",
      ],
      teacherTip: "เขียน always / usually / never แล้วให้นักเรียนวางลงในประโยค",
      estimatedMinutes: 8,
    },
    {
      title: "สรุปโครงสร้าง Present Simple",
      description:
        "เรียนครบโครง Present Simple แล้ว ไปฝึก Quiz 10 ข้อได้ ไม่มีกฎใหม่ในหน้านี้ จำไว้: + S+V · − don't/doesn't + V1 · ? Do/Does + S + V1 · Wh + do/does + S + V1",
      formula:
        "+ S + Verb / Verb-s/es · − S + don't/doesn't + Verb 1 · ? Do/Does + S + Verb 1 · Wh + do/does + S + Verb 1",
      examples: [
        "I play football after school.",
        "She doesn't walk to school.",
        "Do you study English every day?",
        "What do you do after school?",
      ],
      teacherTip: "ทบทวนสี่โครงบนกระดาน แล้วส่งนักเรียนไปทำ Quiz",
      estimatedMinutes: 4,
    },
  ],
};
