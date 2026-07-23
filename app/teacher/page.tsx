import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { getLessonPath, getTeachableLessons } from "@/lib/lessons";

const rows = [
  ["ด.ญ. แพร", "82%", "420", "กำลังเรียน"],
  ["ด.ช. ภูมิ", "64%", "280", "ควรช่วยเหลือ"],
  ["ด.ญ. มินตรา", "96%", "610", "ยอดเยี่ยม"],
];

export default function Teacher() {
  const teachableLessons = getTeachableLessons();

  return (
    <main className="page">
      <BrandHeader />
      <section className="dashboardHero">
        <div>
          <span className="eyebrow">TEACHER DASHBOARD</span>
          <h1>ภาพรวมชั้นเรียน</h1>
          <p>ติดตามนักเรียน คะแนน และความก้าวหน้า</p>
        </div>
        <button className="button primary">+ สร้างห้องเรียน</button>
      </section>
      <section className="statGrid">
        {[
          ["นักเรียน", "24 คน"],
          ["เรียนวันนี้", "18 คน"],
          ["คะแนนเฉลี่ย", "78%"],
          ["ต้องช่วยเหลือ", "3 คน"],
        ].map(([a, b]) => (
          <article className="card" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </article>
        ))}
      </section>
      <section className="panel">
        <h2>บทเรียนสำหรับสอน</h2>
        {teachableLessons.map((lesson) => (
          <Link
            href={`${getLessonPath(lesson.slug)}?from=teacher`}
            className="stage"
            key={lesson.slug}
          >
            <span>🎓</span>
            <div>
              <strong>{lesson.title}</strong>
              <small>🎓 เปิดโหมดสอน</small>
            </div>
            <b>→</b>
          </Link>
        ))}
      </section>
      <section className="panel">
        <h2>ความก้าวหน้ารายบุคคล</h2>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>นักเรียน</th>
                <th>คะแนน</th>
                <th>XP</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((v) => (
                    <td key={v}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
