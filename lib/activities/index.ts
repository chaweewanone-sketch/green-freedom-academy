import type { Activity } from "@/types/activity";

export const activities: Activity[] = [
  {
    id: "millionaire",
    title: "Millionaire Challenge",
    description: "ตอบคำถามแบบเกมเศรษฐีเพื่อทบทวนบทเรียน",
    icon: "💰",
    status: "available",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "ทำแบบทดสอบหลายข้อเพื่อทบทวนบทเรียน",
    icon: "📝",
    status: "available",
  },
  {
    id: "monopoly",
    title: "Monopoly Challenge",
    description: "เรียนรู้ผ่านเกม Monopoly แบบโต้ตอบ",
    icon: "🎲",
    status: "coming-soon",
  },
  {
    id: "flash-cards",
    title: "Flash Cards",
    description: "ทบทวนด้วยการจำคำตอบเอง แล้วประเมินความคล่อง",
    icon: "🃏",
    status: "available",
  },
  {
    id: "matching",
    title: "Matching Game",
    description: "จับคู่คำศัพท์กับความหมายหรือตัวอย่างประโยค",
    icon: "🧩",
    status: "coming-soon",
  },
  {
    id: "spin-wheel",
    title: "Spin Wheel",
    description: "หมุนวงล้อเพื่อสุ่มกิจกรรมฝึกฝน",
    icon: "🎡",
    status: "coming-soon",
  },
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description: "เรียงคำหรือเลือกคำเพื่อสร้างประโยคที่ถูกต้อง",
    icon: "✍️",
    status: "coming-soon",
  },
];

export function getLearningActivities(): Activity[] {
  return activities;
}

export function getActivityPath(lessonSlug: string, activityId: string): string {
  return `/lesson/${lessonSlug}/activity/${activityId}`;
}
