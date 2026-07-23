import { notFound } from "next/navigation";
import { ClassroomCompanion } from "@/components/classroom-companion";
import { getLessonBySlug } from "@/lib/lessons";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

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
