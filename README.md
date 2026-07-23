# Green Freedom Academy v1.0

## เปิดในเครื่อง
1. ติดตั้ง Node.js 20+
2. เปิดโฟลเดอร์ใน VS Code
3. รัน `npm install`
4. รัน `npm run dev`
5. เปิด http://localhost:3000

## ขึ้นเว็บด้วย GitHub + Vercel
1. สร้าง GitHub repository
2. อัปโหลดไฟล์ทั้งหมด
3. เข้า Vercel > Add New > Project
4. Import repository แล้วกด Deploy
5. จะได้ URL แบบ HTTPS สำหรับมือถือ iPad และคอมพิวเตอร์

## เชื่อม Supabase
- สร้าง Supabase project
- รันไฟล์ `supabase/schema.sql`
- คัดลอก `.env.example` เป็น `.env.local`
- ใส่ Project URL และ anon public key

ขณะนี้ระบบหน้าเว็บและ Demo Mode พร้อมแล้ว ส่วน Login จริง, Cloud Save และข้อมูลห้องเรียนจริงต้องเชื่อม Supabase ในขั้นถัดไป
