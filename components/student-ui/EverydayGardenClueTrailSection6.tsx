import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GfaWorldLeadTitles } from "./GfaWorldLeadTitles";
import { GFA_SECTION6_ART } from "@/lib/student-ui/gfaArtAssets";
import { PRESENT_SIMPLE_WORLD_TITLES } from "@/lib/student-ui/presentSimpleWorldTitles";
import type { LessonStep } from "@/types/lesson";

const CLUE_MEANINGS = [
  ["What", "สิ่ง / เรื่องอะไร"],
  ["Where", "ที่ไหน"],
  ["When", "เมื่อไร"],
  ["What time", "กี่โมง"],
  ["Why", "ทำไม"],
  ["Who", "ใคร"],
  ["How", "อย่างไร"],
] as const;

function takeAfterMark(text: string, mark: "✓" | "✗") {
  const start = text.indexOf(mark);
  if (start === -1) {
    return "";
  }

  const rest = text.slice(start + mark.length).trim();
  const next = rest.search(/[✓✗]/);
  const chunk = (next === -1 ? rest : rest.slice(0, next)).trim();
  const memoryAt = chunk.indexOf("จำไว้");
  return (memoryAt === -1 ? chunk : chunk.slice(0, memoryAt)).replace(/\.$/, "").trim();
}

function memoryLine(text: string) {
  const at = text.indexOf("จำไว้");
  return at === -1 ? "" : text.slice(at).trim();
}

function emphasizeWhVerb(example: string) {
  for (const verb of ["keep", "get", "go"] as const) {
    const at = example.indexOf(` ${verb} `);
    if (at === -1) {
      continue;
    }

    return (
      <>
        {example.slice(0, at + 1)}
        <em>{verb}</em>
        {example.slice(at + 1 + verb.length)}
      </>
    );
  }

  const doAfter = example.indexOf(" do after ");
  if (doAfter !== -1) {
    return (
      <>
        {example.slice(0, doAfter + 1)}
        <em>do</em>
        {example.slice(doAfter + 1 + "do".length)}
      </>
    );
  }

  return example;
}

type EverydayGardenClueTrailSection6Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenClueTrailSection6({
  step,
  lessonTitle,
}: EverydayGardenClueTrailSection6Props) {
  const okLine = takeAfterMark(step.description, "✓");
  const badLine = takeAfterMark(step.description, "✗");
  const remember = memoryLine(step.description);

  return (
    <div className="gfaTrail">
      <header className="gfaLearnLead gfaTrailLead">
        <div className="gfaTrailLeadCopy">
          <GfaWorldLeadTitles
            worldTitle={PRESENT_SIMPLE_WORLD_TITLES[5]}
            lessonTitle={lessonTitle}
            teachingTitle={step.title}
          />
          <GfaMission>
            อยากรู้อะไร?
            <br />
            <span className="gfaTrailMissionPattern">
              Wh + do/does + ... + Verb 1?
            </span>
          </GfaMission>
        </div>
        <GfaArtSlot
          src={GFA_SECTION6_ART.baiTongClueGuide.src}
          alt="ใบตองชวนตามคำใบ้บนทางเดินในสวน"
          aspect={GFA_SECTION6_ART.baiTongClueGuide.aspect}
          className="gfaTrailGuide"
          sizes="(max-width: 560px) 96px, 132px"
          fit="contain"
          priority
        />
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION6_ART.clueTrailGarden.src}
          alt="ทางล่าคำใบ้ในสวน มีป้าย What Where When Why Who How และบูธถามอยู่ด้านหลัง"
          aspect={GFA_SECTION6_ART.clueTrailGarden.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">อยากรู้อะไร?</figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์คำถาม Wh-">
        <ol className="gfaTrailMeaning" aria-label="อยากรู้อะไร">
          <li>อยากรู้อะไร?</li>
          <li>เลือกคำถามให้ตรงกับข้อมูลที่อยากรู้</li>
          <li>ใช้โครง Do/Does ที่เรียนแล้ว</li>
        </ol>
        <p className="gfaTrailBridge">
          วาง What / Where / When / Why / Who / How / What time
          ไว้หน้าโครง Do/Does ที่เรียนแล้ว
        </p>

        <ul className="gfaTrailClues" aria-label="ความหมายคำถาม Wh">
          {CLUE_MEANINGS.map(([word, meaning]) => (
            <li key={word}>
              <strong>{word}</strong>
              <span> → {meaning}</span>
            </li>
          ))}
        </ul>

        <div className="gfaTrailBuild" aria-label="โครงคำถาม Wh">
          <p className="gfaTrailBuildFrom">
            {PRESENT_SIMPLE_WORLD_TITLES[4]}: Do / Does + ... + Verb 1?
          </p>
          <p className="gfaLearnBeat">
            {PRESENT_SIMPLE_WORLD_TITLES[5]}: {step.formula}
          </p>
        </div>

        <ul className="gfaExampleList" aria-label="ตัวอย่างคำถาม Wh">
          {step.examples.map((example) => (
            <li key={example} className="gfaExampleLine">
              {emphasizeWhVerb(example)}
            </li>
          ))}
        </ul>

        <div className="gfaTrailReturn" aria-label="กริยาหลักเป็น Verb 1">
          <p className="gfaTrailReturnTitle">
            Wh- มาเพิ่มข้างหน้า — กฎ Verb 1 ยังเหมือนเดิม
          </p>
          <p className="gfaTrailReturnOk">
            Where + does + he + <em>keep</em> ...?
          </p>
          <p className="gfaTrailReturnNo">
            Does แล้ว → <em>keep</em> ไม่ใช่ keeps
          </p>
        </div>

        <div className="gfaLearnPair" aria-label="ถูกและผิด">
          {okLine ? <p className="gfaContrastOk">✓ {okLine}</p> : null}
          {badLine ? <p className="gfaContrastBad">✗ {badLine}</p> : null}
        </div>
        {remember ? <p className="gfaMemoryLine">{remember}</p> : null}
      </section>
    </div>
  );
}
