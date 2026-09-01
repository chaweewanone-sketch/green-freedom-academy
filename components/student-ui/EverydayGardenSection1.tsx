import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GFA_SECTION1_ART } from "@/lib/student-ui/gfaArtAssets";
import type { LessonStep } from "@/types/lesson";

const HABIT_EXAMPLE = "I walk to school every day.";
const FACT_EXAMPLE = "The sun rises in the east.";

function renderSupportExample(example: string) {
  const lunchAt = example.indexOf("lunch");
  const noonAt = example.indexOf("at noon");
  if (lunchAt === -1 || noonAt === -1) {
    return example;
  }

  return (
    <>
      {example.slice(0, lunchAt)}
      <em>lunch</em>
      {example.slice(lunchAt + 5, noonAt)}
      <em>at noon</em>
      {example.slice(noonAt + 7)}
    </>
  );
}

type EverydayGardenSection1Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenSection1({
  step,
  lessonTitle,
}: EverydayGardenSection1Props) {
  const remainingExamples = step.examples.filter(
    (example) => example !== HABIT_EXAMPLE && example !== FACT_EXAMPLE,
  );

  return (
    <div className="gfaGardenGate">
      <div className="gfaGardenGateLead">
        <p className="gfaGardenKicker">LEARN / เรียนรู้ · ลานเขียวอิสระ</p>
        <h1 className="gfaGardenTitle">{lessonTitle}</h1>
        <h2 className="gfaGardenSection">{step.title}</h2>
        <GfaMission>
          แยกสิ่งที่ทำเป็นประจำ
          <br />
          กับสิ่งที่เป็นจริงเสมอ
        </GfaMission>

        <div className="gfaGardenCompanion">
          <GfaArtSlot
            src={GFA_SECTION1_ART.baiTongExplaining.src}
            alt="ใบตองกำลังอธิบาย"
            aspect={GFA_SECTION1_ART.baiTongExplaining.aspect}
            className="gfaGardenCompanionArt"
            sizes="(max-width: 560px) 180px, 142px"
            fit="contain"
            priority
          />
          <p className="gfaGardenSpeech">
            มาดูกันว่าอะไรคือสิ่งที่เราทำเป็นประจำ และอะไรคือสิ่งที่เป็นจริงเสมอ
          </p>
        </div>

        <div className="gfaGrammarBoard" aria-label="โครงไวยากรณ์">
          <p className="gfaGrammarBoardText">{step.formula}</p>
          <p className="gfaGrammarBoardCue">ทำประจำ / เป็นจริงเสมอ</p>
        </div>
      </div>

      <div className="gfaTeachWindows">
        <figure className="gfaTeachWindow">
          <GfaArtSlot
            src={GFA_SECTION1_ART.habitWalkToSchool.src}
            alt="เดินไปโรงเรียนในตอนเช้า"
            aspect={GFA_SECTION1_ART.habitWalkToSchool.aspect}
            className="gfaTeachArt"
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 42vw"
          />
          <figcaption>
            <strong>ทำเป็นประจำ</strong>
            <span className="gfaTeachSentence">
              I <em>walk</em> to school <em>every day</em>.
            </span>
          </figcaption>
        </figure>
        <figure className="gfaTeachWindow">
          <GfaArtSlot
            src={GFA_SECTION1_ART.generalTruthSunrise.src}
            alt="พระอาทิตย์ขึ้นทางทิศตะวันออก"
            aspect={GFA_SECTION1_ART.generalTruthSunrise.aspect}
            className="gfaTeachArt"
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 42vw"
          />
          <figcaption>
            <strong>เป็นจริงเสมอ</strong>
            <span className="gfaTeachSentence">
              The sun <em>rises</em> in the <em>east</em>.
            </span>
          </figcaption>
        </figure>
      </div>

      <p className="gfaGardenTeach">{step.description}</p>

      {remainingExamples.length > 0 ? (
        <div className="gfaLunchStrip">
          <GfaArtSlot
            src={GFA_SECTION1_ART.lunchSupport.src}
            alt="มื้อเที่ยง"
            aspect={GFA_SECTION1_ART.lunchSupport.aspect}
            className="gfaLunchArt"
            sizes="(max-width: 560px) 128px, 118px"
            fit="contain"
          />
          <div>
            {remainingExamples.map((example) => (
              <p key={example} className="gfaGardenExample">
                {renderSupportExample(example)}
              </p>
            ))}
            <p className="gfaLunchCue">ทำเป็นประจำ</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
