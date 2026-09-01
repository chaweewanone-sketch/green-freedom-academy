import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GFA_SECTION2_ART } from "@/lib/student-ui/gfaArtAssets";
import type { LessonStep } from "@/types/lesson";

const PLAIN_VERBS = ["play", "study", "eat"] as const;

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

function emphasizePlainVerb(example: string) {
  for (const verb of PLAIN_VERBS) {
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

  return example;
}

type EverydayGardenPlaygroundSection2Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenPlaygroundSection2({
  step,
  lessonTitle,
}: EverydayGardenPlaygroundSection2Props) {
  const okLine = takeAfterMark(step.description, "✓");
  const badLine = takeAfterMark(step.description, "✗");
  const remember = memoryLine(step.description);

  return (
    <div className="gfaPlayground">
      <header className="gfaLearnLead">
        <p className="gfaGardenKicker">LEARN / เรียนรู้ · สนามเล่น</p>
        <h1 className="gfaGardenTitle">{lessonTitle}</h1>
        <h2 className="gfaGardenSection">{step.title}</h2>
        <GfaMission>
          I / You / We / They
          <br />
          ใช้กริยารูปปกติ ไม่เติม -s
        </GfaMission>
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION2_ART.playgroundIYouWeThey.src}
          alt="สนามเล่นในสวนกิจวัตร กลุ่ม I You We They กำลังเล่น เรียน และกิน"
          aspect={GFA_SECTION2_ART.playgroundIYouWeThey.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">
          หลายคนทำกิจวัตรด้วยกัน
        </figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์ I You We They">
        <p className="gfaLearnBeat">
          หลายคน / I You We They → <strong>Verb 1</strong> → ไม่เติม -s
        </p>
        <ul className="gfaExampleList" aria-label="ตัวอย่าง Verb 1">
          {step.examples.map((example) => (
            <li key={example} className="gfaExampleLine">
              {emphasizePlainVerb(example)}
            </li>
          ))}
        </ul>
        <p className="gfaLearnFormula">{step.formula}</p>
        <div className="gfaLearnPair" aria-label="ถูกและผิด">
          {okLine ? <p className="gfaContrastOk">✓ {okLine}</p> : null}
          {badLine ? <p className="gfaContrastBad">✗ {badLine}</p> : null}
        </div>
        {remember ? <p className="gfaMemoryLine">{remember}</p> : null}
      </section>
    </div>
  );
}
