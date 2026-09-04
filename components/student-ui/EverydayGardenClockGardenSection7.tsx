import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GfaWorldLeadTitles } from "./GfaWorldLeadTitles";
import { GFA_SECTION7_ART } from "@/lib/student-ui/gfaArtAssets";
import { PRESENT_SIMPLE_WORLD_TITLES } from "@/lib/student-ui/presentSimpleWorldTitles";
import type { LessonStep } from "@/types/lesson";

const FREQUENCY_AIDS = [
  { word: "always", meaning: "เสมอ / เป็นประจำ", aid: "≈ 100%" },
  { word: "usually", meaning: "โดยปกติ", aid: "≈ 80–90%" },
  { word: "often", meaning: "บ่อย ๆ", aid: "≈ 60–70%" },
  { word: "sometimes", meaning: "บางครั้ง", aid: "≈ 40–50%" },
  { word: "rarely", meaning: "นาน ๆ ครั้ง", aid: "≈ 10–20%" },
  { word: "never", meaning: "ไม่เคย", aid: "0%" },
] as const;

const EXAMPLE_MARKS: Record<string, string> = {
  "She often listens to English songs.": "often",
  "How often do you exercise?": "How often",
  "I brush my teeth twice a day.": "twice a day",
  "He plays football on Saturdays.": "on Saturdays",
  "They read the news in the morning.": "in the morning",
};

function memoryLine(text: string) {
  const at = text.indexOf("จำไว้");
  return at === -1 ? "" : text.slice(at).trim();
}

function markExample(example: string) {
  const word = EXAMPLE_MARKS[example];
  if (!word) {
    return example;
  }

  const [before, ...rest] = example.split(word);
  if (rest.length === 0) {
    return example;
  }

  return (
    <>
      {before}
      <em>{word}</em>
      {rest.join(word)}
    </>
  );
}

type EverydayGardenClockGardenSection7Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenClockGardenSection7({
  step,
  lessonTitle,
}: EverydayGardenClockGardenSection7Props) {
  const remember = memoryLine(step.description);

  return (
    <div className="gfaClock">
      <header className="gfaLearnLead gfaClockLead">
        <div className="gfaClockLeadCopy">
          <GfaWorldLeadTitles
            worldTitle={PRESENT_SIMPLE_WORLD_TITLES[6]}
            lessonTitle={lessonTitle}
            teachingTitle={step.title}
          />
          <GfaMission>
            บ่อยแค่ไหน? เมื่อไร?
            <span className="gfaClockMissionPattern">
              Subject + adverb + Verb
            </span>
            <span className="gfaClockMissionPattern">
              How often + do/does + ... + Verb 1?
            </span>
            <span className="gfaClockMissionPattern">at · on · in</span>
          </GfaMission>
        </div>
        <GfaArtSlot
          src={GFA_SECTION7_ART.baiTongClockGuide.src}
          alt="ใบตองถือนาฬิกา ชวนดูว่าบ่อยแค่ไหนและเมื่อไร"
          aspect={GFA_SECTION7_ART.baiTongClockGuide.aspect}
          className="gfaClockGuide"
          sizes="(max-width: 560px) 96px, 132px"
          fit="contain"
          priority
        />
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION7_ART.clockGardenRoutines.src}
          alt="สวนนาฬิกา มีนาฬิกาใหญ่ ป้าย Morning Evening และเด็กทำกิจวัตร"
          aspect={GFA_SECTION7_ART.clockGardenRoutines.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">
          บ่อยแค่ไหน? เมื่อไร?
        </figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์ความถี่และเวลา">
        <div className="gfaClockMeaning" aria-label="ความหมายความถี่และเวลา">
          <p>
            คำความถี่
            <span> = บอกว่า “บ่อยแค่ไหน”</span>
          </p>
          <p>
            คำบอกเวลา
            <span> = บอกว่า “เมื่อไร”</span>
          </p>
        </div>

        <div className="gfaClockScale" aria-label="คำบอกความถี่">
          <p className="gfaLearnBeat">A. คำบอกความถี่</p>
          <ul>
            {FREQUENCY_AIDS.map((item) => (
              <li key={item.word}>
                <strong>{item.word}</strong>
                <span className="gfaClockScaleMeaning">{item.meaning}</span>
                <span className="gfaClockScaleAid">{item.aid}</span>
              </li>
            ))}
          </ul>
          <p className="gfaClockScaleNote">
            เปอร์เซ็นต์เป็นค่าประมาณเพื่อช่วยให้เห็นระดับความถี่
          </p>
        </div>

        <div className="gfaClockPosition" aria-label="ตำแหน่งคำบอกความถี่">
          <p className="gfaLearnBeat">คำบอกความถี่วางหน้ากริยาหลัก</p>
          <div className="gfaLearnPair">
            <p className="gfaContrastOk">✓ I usually finish my homework.</p>
            <p className="gfaContrastBad">✗ I finish usually my homework.</p>
          </div>
        </div>

        <div className="gfaClockHow" aria-label="How often">
          <p className="gfaLearnBeat">
            How often
            <span className="gfaClockHowMeaning"> = บ่อยแค่ไหน</span>
          </p>
          <p className="gfaClockHowBridge">
            {PRESENT_SIMPLE_WORLD_TITLES[5]} มี Wh แล้ว ตอนนี้ใช้ How often
            ถามว่าบ่อยแค่ไหน
          </p>
          <p className="gfaLearnBeat">
            How often + do/does + Subject + Verb 1?
          </p>
          <p className="gfaClockAnswers">
            every day · once a week · twice a day
          </p>
          <p className="gfaClockNote">
            every day
            <span> ไม่ใช่ every days</span>
          </p>
        </div>

        <div className="gfaClockTime" aria-label="at on in">
          <p className="gfaLearnBeat">C. การบอกเวลา</p>
          <ul>
            <li>
              <strong>at</strong> + นาฬิกา
            </li>
            <li>
              <strong>at night</strong>
            </li>
            <li>
              <strong>on</strong> + วัน
            </li>
            <li>
              <strong>in</strong> + ช่วงวัน
            </li>
          </ul>
        </div>

        <ul className="gfaExampleList" aria-label="ตัวอย่างความถี่และเวลา">
          {step.examples.map((example) => (
            <li key={example} className="gfaExampleLine">
              {markExample(example)}
            </li>
          ))}
        </ul>

        {remember ? <p className="gfaMemoryLine">{remember}</p> : null}
      </section>
    </div>
  );
}
