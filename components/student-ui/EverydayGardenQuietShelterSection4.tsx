import { GfaArtSlot } from "./GfaArtSlot";
import { GfaMission } from "./GfaMission";
import { GFA_SECTION4_ART } from "@/lib/student-ui/gfaArtAssets";
import type { LessonStep } from "@/types/lesson";

const GROUP_VERBS = ["drink", "use"] as const;
const SINGULAR_VERBS = ["walk", "rain"] as const;

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

function emphasizeVerb(example: string, verbs: readonly string[]) {
  for (const verb of verbs) {
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

function isGroupNegative(example: string) {
  return /\b(don't|do not)\b/.test(example);
}

function isSingularNegative(example: string) {
  return /\b(doesn't|does not)\b/.test(example);
}

type EverydayGardenQuietShelterSection4Props = {
  step: LessonStep;
  lessonTitle: string;
};

export function EverydayGardenQuietShelterSection4({
  step,
  lessonTitle,
}: EverydayGardenQuietShelterSection4Props) {
  const groupExamples = step.examples.filter(isGroupNegative);
  const singularExamples = step.examples.filter(isSingularNegative);
  const okLine = takeAfterMark(step.description, "✓");
  const badLine = takeAfterMark(step.description, "✗");
  const remember = memoryLine(step.description);

  return (
    <div className="gfaShelter">
      <header className="gfaLearnLead gfaShelterLead">
        <div className="gfaShelterLeadCopy">
          <p className="gfaGardenKicker">LEARN / เรียนรู้ · ที่พักเงียบ</p>
          <h1 className="gfaGardenTitle">{lessonTitle}</h1>
          <h2 className="gfaGardenSection">{step.title}</h2>
          <GfaMission>
            บอกว่า “ไม่ได้ทำ”
            <br />
            <span className="gfaShelterMissionPattern">
              don't / doesn't + Verb 1
            </span>
          </GfaMission>
        </div>
        <GfaArtSlot
          src={GFA_SECTION4_ART.baiTongPauseGuide.src}
          alt="ใบตองชวนพักก่อน ยังไม่ทำตอนนี้"
          aspect={GFA_SECTION4_ART.baiTongPauseGuide.aspect}
          className="gfaShelterGuide"
          sizes="(max-width: 560px) 96px, 132px"
          fit="contain"
          priority
        />
      </header>

      <figure className="gfaWorldStage">
        <GfaArtSlot
          src={GFA_SECTION4_ART.quietShelterNotDoing.src}
          alt="ที่พักเงียบในสวน ลูกบอลวางอยู่ เด็กนั่งพัก และแมวนอน"
          aspect={GFA_SECTION4_ART.quietShelterNotDoing.aspect}
          className="gfaWorldStageArt"
          sizes="100vw"
          fit="contain"
          priority
        />
        <figcaption className="gfaWorldStageCaption">ยังไม่ได้ทำ</figcaption>
      </figure>

      <section className="gfaLearnSurface" aria-label="ไวยากรณ์ประโยคปฏิเสธ">
        <p className="gfaLearnBeat">
          ความหมาย: <strong>บอกว่าไม่ได้ทำ</strong>
        </p>

        <div className="gfaShelterGroup" aria-label="I You We They">
          <p className="gfaLearnBeat">
            I / You / We / They → <strong>don't / do not + Verb 1</strong>
          </p>
          <ul className="gfaExampleList" aria-label="ตัวอย่าง I You We They">
            {groupExamples.map((example) => (
              <li key={example} className="gfaExampleLine">
                {emphasizeVerb(example, GROUP_VERBS)}
              </li>
            ))}
          </ul>
        </div>

        <div className="gfaShelterSingular" aria-label="He She It">
          <p className="gfaLearnBeat">
            He / She / It → <strong>doesn't / does not + Verb 1</strong>
          </p>
          <ul className="gfaExampleList" aria-label="ตัวอย่าง He She It">
            {singularExamples.map((example) => (
              <li key={example} className="gfaExampleLine">
                {emphasizeVerb(example, SINGULAR_VERBS)}
              </li>
            ))}
          </ul>
        </div>

        <div className="gfaShelterReturn" aria-label="กริยาหลักกลับ Verb 1">
          <p className="gfaShelterReturnTitle">กริยาหลักกลับ Verb 1</p>
          <p className="gfaShelterReturnOk">
            doesn't + <em>walk</em>
          </p>
          <p className="gfaShelterReturnNo">ไม่ใช่ doesn't + walks</p>
        </div>

        <div className="gfaShelterFlip" aria-label="บอกเล่าเป็นปฏิเสธ">
          <p>
            They play football.
            <span> → They don't play football.</span>
          </p>
          <p>
            She walks to school.
            <span> → She doesn't walk to school.</span>
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
