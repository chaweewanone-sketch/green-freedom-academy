import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GfaWorldLeadTitles } from "./GfaWorldLeadTitles";
import { GFA_SECTION3_ART } from "@/lib/student-ui/gfaArtAssets";
import { PRESENT_SIMPLE_WORLD_TITLES } from "@/lib/student-ui/presentSimpleWorldTitles";
import type { LessonStep } from "@/types/lesson";

const SINGULAR_VERBS = ["plays", "watches", "sleeps", "fixes"] as const;

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

function emphasizeSingularVerb(example: string) {
  for (const verb of SINGULAR_VERBS) {
    const at = example.indexOf(` ${verb} `);
    if (at === -1) {
      continue;
    }

    const stem = verb.endsWith("es") ? verb.slice(0, -2) : verb.slice(0, -1);
    const ending = verb.slice(stem.length);

    return (
      <>
        {example.slice(0, at + 1)}
        <em>
          {stem}
          <span className="gfaEndingMark">{ending}</span>
        </em>
        {example.slice(at + 1 + verb.length)}
      </>
    );
  }

  return example;
}

type EverydayGardenWorkshopSection3Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenWorkshopSection3({
  step,
  lessonTitle,
}: EverydayGardenWorkshopSection3Props) {
  const okLine = takeAfterMark(step.description, "✓");
  const badLine = takeAfterMark(step.description, "✗");
  const remember = memoryLine(step.description);

  return (
    <div className="gfaWorkshop">
      <header className="gfaLearnLead">
        <GfaWorldLeadTitles
          worldTitle={PRESENT_SIMPLE_WORLD_TITLES[2]}
          lessonTitle={lessonTitle}
          teachingTitle={step.title}
        />
        <GfaMission>
          He / She / It / คำนามเอกพจน์
          <br />
          กริยาเติม -s หรือ -es
        </GfaMission>
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION3_ART.workshopHeSheIt.src}
          alt="โรงงานคนเดียว He plays, She watches, It sleeps, Dad fixes"
          aspect={GFA_SECTION3_ART.workshopHeSheIt.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">
          คนเดียวทำกิจวัตร · He / She / It / Dad
        </figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์ He She It">
        <p className="gfaLearnBeat">
          คนเดียว / He She It → กริยาเติม <strong>-s / -es</strong>
        </p>
        <p className="gfaLearnFormula">{step.formula}</p>
        <ul className="gfaExampleList" aria-label="ตัวอย่าง Verb-s/es">
          {step.examples.map((example) => (
            <li key={example} className="gfaExampleLine">
              {emphasizeSingularVerb(example)}
            </li>
          ))}
        </ul>
        <div className="gfaEndingRule" aria-label="กฎเติม -s และ -es">
          <div className="gfaEndingRuleGroup">
            <p className="gfaEndingRuleTitle">เติม -s</p>
            <ul className="gfaEndingRulePairs">
              <li>
                play → <em>plays</em>
              </li>
              <li>
                sleep → <em>sleeps</em>
              </li>
            </ul>
          </div>
          <div className="gfaEndingRuleGroup">
            <p className="gfaEndingRuleTitle">
              ลงท้าย ch / sh / x / s → เติม -es
            </p>
            <ul className="gfaEndingRulePairs">
              <li>
                watch → <em>watches</em>
              </li>
              <li>
                fix → <em>fixes</em>
              </li>
            </ul>
          </div>
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
