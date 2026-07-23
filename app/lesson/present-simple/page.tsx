import { notFound } from "next/navigation";
import { ClassroomCompanion } from "@/components/classroom-companion";
import { getLessonBySlug } from "@/lib/lessons";

const LESSON_SLUG = "present-simple";

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function PresentSimpleLessonPage({
  searchParams,
}: PageProps) {
  const lesson = getLessonBySlug(LESSON_SLUG);

  if (!lesson) {
    notFound();
  }

  const { from } = await searchParams;
  const isTeacherContext = from === "teacher";

  return (
    <ClassroomCompanion
      lesson={lesson}
      backHref={isTeacherContext ? "/teacher" : "/student"}
      backLabel={isTeacherContext ? "แดชบอร์ดครู" : "Dashboard"}
      defaultMode={isTeacherContext ? "planning" : "teaching"}
    />
  );
}
