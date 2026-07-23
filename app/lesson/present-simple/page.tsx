import { ClassroomCompanion } from "@/components/classroom-companion";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function PresentSimpleLessonPage({
  searchParams,
}: PageProps) {
  const { from } = await searchParams;
  const isTeacherContext = from === "teacher";

  return (
    <ClassroomCompanion
      lesson={presentSimpleLesson}
      backHref={isTeacherContext ? "/teacher" : "/student"}
      backLabel={isTeacherContext ? "แดชบอร์ดครู" : "Dashboard"}
      defaultMode={isTeacherContext ? "planning" : "teaching"}
    />
  );
}
