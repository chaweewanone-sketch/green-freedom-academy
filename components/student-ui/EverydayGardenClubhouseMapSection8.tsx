import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GFA_SECTION8_ART } from "@/lib/student-ui/gfaArtAssets";
import type { LessonStep } from "@/types/lesson";

const STRUCTURE_FRAMES = [
  {
    id: "positive",
    mark: "+",
    label: "บอกเล่า",
    formula: "S + Verb / Verb-s/es",
  },
  {
    id: "negative",
    mark: "−",
    label: "ปฏิเสธ",
    formula: "S + don't/doesn't + Verb 1",
  },
  {
    id: "yesNo",
    mark: "?",
    label: "คำถาม Yes/No",
    formula: "Do/Does + S + Verb 1",
  },
  {
    id: "wh",
    mark: "Wh",
    label: "คำถาม Wh",
    formula: "Wh + do/does + S + V1",
  },
] as const;

function memoryLine(text: string) {
  const at = text.indexOf("จำไว้");
  return at === -1 ? "" : text.slice(at).trim();
}

function memoryParts(text: string) {
  const line = memoryLine(text);
  if (!line) {
    return [];
  }

  const body = line.replace(/^จำไว้[:：]\s*/, "");
  return body
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
}

type EverydayGardenClubhouseMapSection8Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenClubhouseMapSection8({
  step,
  lessonTitle,
}: EverydayGardenClubhouseMapSection8Props) {
  const remember = memoryLine(step.description);
  const rememberParts = memoryParts(step.description);

  return (
    <div className="gfaClub">
      <header className="gfaLearnLead gfaClubLead">
        <div className="gfaClubLeadCopy">
          <p className="gfaGardenKicker">
            LEARN / เรียนรู้ · <span className="gfaClubPlace">บ้านแผนที่</span>
          </p>
          <h1 className="gfaGardenTitle">{lessonTitle}</h1>
          <h2 className="gfaGardenSection">{step.title}</h2>
          <GfaMission>
            เรียนครบแล้ว!
            <span className="gfaClubMissionLine">
              มาดูแผนที่ Present Simple ก่อนออกไปลอง Quiz
            </span>
          </GfaMission>
        </div>
        <GfaArtSlot
          src={GFA_SECTION8_ART.baiTongClubhouseGuide.src}
          alt="ใบตองถือแผนที่การเรียน ยินดีต้อนรับที่บ้านคลับเฮาส์"
          aspect={GFA_SECTION8_ART.baiTongClubhouseGuide.aspect}
          className="gfaClubGuide"
          sizes="(max-width: 560px) 96px, 132px"
          fit="contain"
          priority
        />
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION8_ART.clubhouseMapFinale.src}
          alt="แผนที่การเรียนแปดจุด และบ้านคลับเฮาส์ในสวนประจำวัน"
          aspect={GFA_SECTION8_ART.clubhouseMapFinale.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">
          เรียนครบแล้ว · พร้อมไปฝึก
        </figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="สรุปโครงสร้าง Present Simple">
        <div className="gfaClubIdea" aria-label="ความหมาย Present Simple">
          <p>
            Present Simple ใช้พูดถึง
            <span> “สิ่งที่ทำเป็นประจำ”</span>
            และ
            <span> “สิ่งที่เป็นจริงเสมอ”</span>
          </p>
        </div>

        <div className="gfaClubMap" aria-label="แผนที่สี่โครง">
          <p className="gfaLearnBeat">สี่โครง Present Simple</p>
          <ul className="gfaClubFrames">
            {STRUCTURE_FRAMES.map((frame, index) => {
              const example = step.examples[index];

              return (
                <li
                  key={frame.id}
                  className={`gfaClubFrame gfaClubFrame-${frame.id}`}
                >
                  <p className="gfaClubMark">
                    <strong>{frame.mark}</strong>
                    <span>{frame.label}</span>
                  </p>
                  <p className="gfaClubFormula">{frame.formula}</p>
                  {example ? (
                    <p className="gfaClubExample">{example}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {remember ? (
          <div className="gfaClubMemory" aria-label="จำสี่โครง">
            <p className="gfaClubConfidence">มีแผนที่แล้ว</p>
            {rememberParts.length > 0 ? (
              <ul>
                <li>จำไว้:</li>
                {rememberParts.map((part) => (
                  <li key={part}>{part}</li>
                ))}
              </ul>
            ) : (
              <p className="gfaMemoryLine">{remember}</p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
