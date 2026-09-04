import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GfaWorldLeadTitles } from "./GfaWorldLeadTitles";
import { GFA_SECTION5_ART } from "@/lib/student-ui/gfaArtAssets";
import { PRESENT_SIMPLE_WORLD_TITLES } from "@/lib/student-ui/presentSimpleWorldTitles";
import type { LessonStep } from "@/types/lesson";

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

function splitAskAnswer(example: string) {
  const at = example.indexOf(" — ");
  if (at === -1) {
    return { ask: example, answer: "" };
  }

  return {
    ask: example.slice(0, at).trim(),
    answer: example.slice(at + 3).trim(),
  };
}

function isDoQuestion(example: string) {
  return /^Do\b/.test(example);
}

function isDoesQuestion(example: string) {
  return /^Does\b/.test(example);
}

function emphasizeAskVerb(ask: string) {
  for (const verb of ["study", "clean", "walk"] as const) {
    const at = ask.indexOf(` ${verb} `);
    if (at === -1) {
      continue;
    }

    return (
      <>
        {ask.slice(0, at + 1)}
        <em>{verb}</em>
        {ask.slice(at + 1 + verb.length)}
      </>
    );
  }

  return ask;
}

type EverydayGardenQuestionBoothSection5Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenQuestionBoothSection5({
  step,
  lessonTitle,
}: EverydayGardenQuestionBoothSection5Props) {
  const doExamples = step.examples.filter(isDoQuestion).map(splitAskAnswer);
  const doesExamples = step.examples.filter(isDoesQuestion).map(splitAskAnswer);
  const okLine = takeAfterMark(step.description, "✓");
  const badLine = takeAfterMark(step.description, "✗");
  const remember = memoryLine(step.description);

  return (
    <div className="gfaBooth">
      <header className="gfaLearnLead gfaBoothLead">
        <div className="gfaBoothLeadCopy">
          <GfaWorldLeadTitles
            worldTitle={PRESENT_SIMPLE_WORLD_TITLES[4]}
            lessonTitle={lessonTitle}
            teachingTitle={step.title}
          />
          <GfaMission>
            ถามว่า “…ไหม?”
            <br />
            <span className="gfaBoothMissionPattern">Do / Does + ... + Verb 1?</span>
          </GfaMission>
        </div>
        <GfaArtSlot
          src={GFA_SECTION5_ART.baiTongQuestionGuide.src}
          alt="ใบตองชวนลองถามที่บูธถาม"
          aspect={GFA_SECTION5_ART.baiTongQuestionGuide.aspect}
          className="gfaBoothGuide"
          sizes="(max-width: 560px) 96px, 132px"
          fit="contain"
          priority
        />
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION5_ART.questionBoothAskAnswer.src}
          alt="บูธถามในสวน เด็กถาม ฟัง และส่งบัตรตอบ"
          aspect={GFA_SECTION5_ART.questionBoothAskAnswer.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">ถามแล้วตอบ</figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์คำถาม Yes/No">
        <p className="gfaLearnBeat">
          ถามว่า <strong>“…ไหม?”</strong>
          <span className="gfaBoothMeaningRule">
            ขึ้นต้นด้วย Do หรือ Does แล้วตามด้วยประธานและ Verb 1
          </span>
        </p>

        <div className="gfaBoothFamily" aria-label="I You We They">
          <p className="gfaLearnBeat">
            I / You / We / They → <strong>Do + Verb 1 …?</strong>
          </p>
          <ul className="gfaBoothPairs" aria-label="ตัวอย่าง Do">
            {doExamples.map((pair) => (
              <li key={pair.ask}>
                <p className="gfaBoothAsk">{emphasizeAskVerb(pair.ask)}</p>
                {pair.answer ? (
                  <p className="gfaBoothAnswer">→ {pair.answer}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="gfaBoothFamily" aria-label="He She It">
          <p className="gfaLearnBeat">
            He / She / It → <strong>Does + Verb 1 …?</strong>
          </p>
          <ul className="gfaBoothPairs" aria-label="ตัวอย่าง Does">
            {doesExamples.map((pair) => (
              <li key={pair.ask}>
                <p className="gfaBoothAsk">{emphasizeAskVerb(pair.ask)}</p>
                {pair.answer ? (
                  <p className="gfaBoothAnswer">→ {pair.answer}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="gfaBoothReturn" aria-label="กริยาหลักเป็น Verb 1">
          <p className="gfaBoothReturnTitle">
            Does ขึ้นหน้า → กริยาหลักเป็น Verb 1
          </p>
          <p className="gfaBoothReturnOk">
            Does + ... + <em>walk</em>
          </p>
          <p className="gfaBoothReturnNo">ไม่ใช่ Does + ... + walks</p>
        </div>

        <div className="gfaBoothReply" aria-label="คำตอบสั้น">
          <p className="gfaLearnBeat">ถาม → ตอบสั้น</p>
          <p className="gfaBoothReplyLine">
            Do …? → … <strong>do / don't</strong>
          </p>
          <p className="gfaBoothReplyLine">
            Does …? → … <strong>does / doesn't</strong>
          </p>
          <p className="gfaBoothReplyRule">
            คำตอบสั้นใช้ do/does ซ้ำ ไม่ใช้กริยาหลัก
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
