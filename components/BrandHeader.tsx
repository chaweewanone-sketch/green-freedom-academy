import Link from "next/link";
import { getDashboardPath, getStudentPath } from "@/lib/routes";

export function BrandHeader() {
  return (
    <header className="brandHeader">
      <Link href="/" className="brand">
        <span className="brandMark">🌿</span>
        <span>
          <strong>Green Freedom Academy</strong>
          <small>Learn • Practice • Grow</small>
        </span>
      </Link>
      <nav aria-label="เมนูหลัก">
        <Link href={getStudentPath()}>นักเรียน</Link>
        <Link href={getDashboardPath()}>ผลการเรียน</Link>
        <Link href="/teacher">ครู</Link>
        <Link className="navLogin" href="/login">
          เข้าสู่ระบบ
        </Link>
      </nav>
    </header>
  );
}
