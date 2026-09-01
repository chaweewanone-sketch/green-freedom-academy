import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function runStudentVisualFoundationVerification(): void {
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  const world = readFileSync(
    resolve(process.cwd(), "components/student-ui/GfaStudentWorld.tsx"),
    "utf8",
  );
  const learningWorld = readFileSync(
    resolve(process.cwd(), "components/student-ui/GfaLearningWorld.tsx"),
    "utf8",
  );
  const character = readFileSync(
    resolve(process.cwd(), "components/student-ui/GfaCharacter.tsx"),
    "utf8",
  );
  const companion = readFileSync(
    resolve(
      process.cwd(),
      "components/classroom-companion/ClassroomCompanion.tsx",
    ),
    "utf8",
  );
  const section1 = readFileSync(
    resolve(process.cwd(), "components/student-ui/EverydayGardenSection1.tsx"),
    "utf8",
  );
  const section2 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenPlaygroundSection2.tsx",
    ),
    "utf8",
  );
  const section3 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenWorkshopSection3.tsx",
    ),
    "utf8",
  );
  const quiz = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  const choice = readFileSync(
    resolve(process.cwd(), "components/millionaire/ChoiceButton.tsx"),
    "utf8",
  );
  const game = readFileSync(
    resolve(process.cwd(), "components/millionaire/MillionaireGame.tsx"),
    "utf8",
  );
  const artAssets = readFileSync(
    resolve(process.cwd(), "lib/student-ui/gfaArtAssets.ts"),
    "utf8",
  );
  const artSlot = readFileSync(
    resolve(process.cwd(), "components/student-ui/GfaArtSlot.tsx"),
    "utf8",
  );
  const artContract = readFileSync(
    resolve(process.cwd(), "public/gfa/ASSET-CONTRACT.md"),
    "utf8",
  );
  const lesson = readFileSync(
    resolve(process.cwd(), "lib/lessons/present-simple.ts"),
    "utf8",
  );

  assert(css.includes("--gfa-primary:#176b4d"), "tokens: primary");
  assert(css.includes("--gfa-cream:#fff8e8"), "tokens: cream");
  assert(css.includes("--g:#176b4d"), "tokens: teacher --g preserved");
  assert(css.includes(".gfaLearningWorld"), "css: learning world");
  assert(css.includes(".gfaStudentWorld-quiz"), "css: quiz world foundation");
  assert(css.includes(".gfaAdventureMap"), "css: game map still present");
  assert(!css.includes(".gfaStudentLearnStage"), "css: rejected 44A stage removed");
  assert(
    css.includes(
      ".millionaireChoice{width:100%;min-height:52px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;font-weight:700;text-align:left;cursor:pointer;transition:background .15s ease,border-color .15s ease}",
    ),
    "css: shared quiz choice rule frozen",
  );

  assert(world.includes('intensity === "learn"'), "world: learn intensity");
  assert(world.includes("quiz"), "world: quiz intensity ready");
  assert(learningWorld.includes('aria-hidden="true"'), "world: grounds art hidden");
  assert(learningWorld.includes("GfaArtSlot"), "world: background uses art slot");
  assert(learningWorld.includes("everydayGardenBackground"), "world: background slot");
  assert(!learningWorld.includes("AdventureMap"), "world: no adventure map");
  assert(!learningWorld.includes("GroundsBackdrop"), "world: primitive backdrop removed");
  assert(css.includes(".gfaArtSlot"), "css: art slot");
  assert(!css.includes(".gfaSignboardArt"), "css: signboard svg removed");

  assert(character.includes("bai-tong"), "character: Bai Tong");
  assert(character.includes('"neutral"'), "character: neutral");
  assert(character.includes('"explaining"'), "character: explaining");
  assert(character.includes("decorative"), "character: decorative a11y");

  assert(companion.includes("GfaLearningWorld"), "learn: world wrapped");
  assert(companion.includes('plot="everyday-garden"'), "learn: everyday garden");
  assert(companion.includes("isStudentLearn"), "learn: teacher split preserved");
  assert(
    companion.includes("showClassroomControls={!isStudentLearn}"),
    "learn: teacher chrome gated",
  );
  assert(companion.includes("EverydayGardenSection1"), "learn: section 1 prototype");
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 0'),
    "learn: section 1 only",
  );
  assert(
    companion.includes("EverydayGardenPlaygroundSection2"),
    "learn: section 2 prototype",
  );
  assert(
    companion.includes("EverydayGardenWorkshopSection3"),
    "learn: section 3 prototype",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 1'),
    "learn: section 2 step",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 2'),
    "learn: section 3 step",
  );
  assert(
    companion.includes("everyday-garden-playground"),
    "learn: playground scene",
  );
  assert(
    companion.includes("everyday-garden-workshop"),
    "learn: workshop scene",
  );
  assert(companion.includes("TeachingPanel"), "learn: sections 4-8 fallback");
  assert(companion.includes("showActivityGrid={!isStudentLearn}"), "learn: grid gated");
  assert(css.includes(".gfaLearningWorld .guidedLearnFooter .primary"), "css: student CTA");

  assert(section1.includes("I walk to school every day."), "s1: habit example");
  assert(section1.includes("The sun rises in the east."), "s1: fact example");
  assert(section1.includes("<em>walk</em>"), "s1: habit walk emphasis");
  assert(section1.includes("<em>every day</em>"), "s1: habit every day emphasis");
  assert(section1.includes("<em>rises</em>"), "s1: truth rises emphasis");
  assert(section1.includes("<em>east</em>"), "s1: truth east emphasis");
  assert(!section1.includes("GfaCharacter"), "s1: geometric Bai Tong not primary");
  assert(section1.includes("priority"), "s1: Bai Tong priority");
  assert(section1.includes("GfaArtSlot"), "s1: real art slots");
  assert(section1.includes("GFA_SECTION1_ART"), "s1: asset map");
  assert(section1.includes("habitWalkToSchool"), "s1: habit slot");
  assert(section1.includes("generalTruthSunrise"), "s1: general truth slot");
  assert(section1.includes("lunchSupport"), "s1: lunch slot");
  assert(!section1.includes("HabitIllustration"), "s1: primitive habit art removed");
  assert(!section1.includes("FactIllustration"), "s1: primitive fact art removed");
  assert(section1.includes("{step.formula}"), "s1: formula from content");
  assert(section1.includes("{step.description}"), "s1: description from content");
  assert(!section1.includes("ป้ายสวน"), "s1: no garden-sign UI label");
  assert(section1.includes("ทำประจำ / เป็นจริงเสมอ"), "s1: grammar cue preserved");
  assert(section1.includes("We eat lunch at noon.") === false, "s1: third example not hardcoded rewrite");
  assert(section1.includes("remainingExamples"), "s1: remaining examples preserved");
  assert(section1.includes("<em>lunch</em>"), "s1: lunch emphasis");
  assert(section1.includes("<em>at noon</em>"), "s1: noon emphasis");
  assert(css.includes("minmax(0, 0.38fr) minmax(0, 0.62fr)"), "css: desktop 38/62 composition");
  assert(css.includes("grid-template-columns: 1fr 1fr"), "css: habit/truth pair");
  assert(css.includes("clamp(1.45rem, 2.1vw, 2rem)"), "css: compact title scale");
  assert(css.includes("clamp(92px, 7.5vw, 118px)"), "css: lunch art prominence");
  assert(css.includes("repeat(8, minmax(0, 1fr))"), "css: mobile 8-stone row");
  assert(css.includes("clamp(116px, 30vw, 128px)"), "css: mobile lunch art scale");
  assert(css.includes("object-position: 78% 32%"), "css: background focal control");
  assert(css.includes("min(180px, 46vw)"), "css: mobile Bai Tong readable");
  assert(!section2.includes("gfaGardenGate"), "s2: not section 1 composition");
  assert(section2.includes("GFA_SECTION2_ART"), "s2: asset map");
  assert(!section2.includes("baiTongGroupCoach"), "s2 r1: no competing coach");
  assert(section2.includes("playgroundIYouWeThey"), "s2: playground slot");
  assert(section2.includes('fit="contain"'), "s2: scene contain");
  assert(section2.includes("{step.formula}"), "s2: formula from content");
  assert(section2.includes("{step.examples.map"), "s2: examples from content");
  assert(section2.includes("<em>{verb}</em>"), "s2: verb 1 emphasis");
  assert(!section2.includes("ป้ายสวน"), "s2: no garden-sign UI label");
  assert(!section3.includes("gfaGardenGate"), "s3: not section 1 composition");
  assert(section3.includes("GFA_SECTION3_ART"), "s3: asset map");
  assert(!section3.includes("baiTongSingularStamp"), "s3 r1: stamp retained unused");
  assert(section3.includes("workshopHeSheIt"), "s3: workshop slot");
  assert(!section3.includes("verbLeafS"), "s3 r1: leaf hidden");
  assert(section3.includes("{step.formula}"), "s3: formula from content");
  assert(section3.includes("{step.examples.map"), "s3: examples from content");
  assert(section3.includes("gfaEndingMark"), "s3: ending stays HTML");
  assert(section3.includes("gfaEndingRule"), "s3 r2: scannable s/es rule");
  assert(section3.includes("play →"), "s3 r2: play to plays");
  assert(section3.includes("watch →"), "s3 r2: watch to watches");
  assert(section3.includes("ch / sh / x / s"), "s3 r2: es endings visible");
  assert(!section3.includes("hissy"), "s3: no hissy-sound grammar rule");
  assert(!section3.includes("ป้ายสวน"), "s3: no garden-sign UI label");
  assert(css.includes(".gfaPlayground"), "css: playground section");
  assert(css.includes(".gfaWorkshop"), "css: workshop section");
  assert(css.includes(".gfaWorldStage"), "css: framed world stage");
  assert(css.includes(".gfaLearnSurface"), "css: cream learning surface");
  assert(
    artAssets.includes("/gfa/characters/bai-tong-group-coach.webp"),
    "assets: group coach path",
  );
  assert(
    artAssets.includes("/gfa/scenes/playground-i-you-we-they.webp"),
    "assets: playground path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-singular-stamp.webp"),
    "assets: singular stamp path",
  );
  assert(
    artAssets.includes("/gfa/scenes/workshop-he-she-it.webp"),
    "assets: workshop path",
  );
  assert(
    artAssets.includes("/gfa/props/verb-leaf-s.webp"),
    "assets: verb leaf path",
  );

  assert(existsSync(resolve(process.cwd(), "public/gfa/characters")), "assets: characters dir");
  assert(existsSync(resolve(process.cwd(), "public/gfa/scenes")), "assets: scenes dir");
  assert(existsSync(resolve(process.cwd(), "public/gfa/props")), "assets: props dir");
  assert(artAssets.includes("/gfa/characters/bai-tong-explaining.webp"), "assets: bai tong path");
  assert(artAssets.includes("/gfa/scenes/habit-walk-to-school.webp"), "assets: habit path");
  assert(artAssets.includes("/gfa/scenes/general-truth-sunrise-east.webp"), "assets: sunrise path");
  assert(artAssets.includes("/gfa/scenes/everyday-garden-background.webp"), "assets: background path");
  assert(artAssets.includes("/gfa/props/lunch-support.webp"), "assets: lunch path");
  assert(artSlot.includes('from "next/image"'), "art slot: Next/Image");
  assert(artSlot.includes("priority"), "art slot: priority support");
  assert(artSlot.includes("รอภาพต้นฉบับ GFA"), "art slot: wait fallback");
  assert(artContract.includes("NAME=bai-tong-explaining"), "contract: bai tong");
  assert(artContract.includes("NAME=habit-walk-to-school"), "contract: habit");
  assert(artContract.includes("NAME=general-truth-sunrise-east"), "contract: sunrise");
  assert(artContract.includes("NAME=everyday-garden-background"), "contract: background");
  assert(artContract.includes("NAME=lunch-support"), "contract: lunch");
  assert(artContract.includes("TEXT_INSIDE_ASSET=NO"), "contract: no baked text");

  assert(!quiz.includes("student-ui"), "quiz: no student-ui import");
  assert(!quiz.includes("GfaLearningWorld"), "quiz: no world wrap");
  assert(quiz.includes("เริ่มทำแบบทดสอบ"), "quiz: intro copy unchanged");
  assert(choice.includes("millionaireChoice"), "choice: shared button unchanged");
  assert(game.includes("GameWorld"), "game: Sprint 42 world remains");
  assert(game.includes("AdventureMap"), "game: adventure map remains");
  assert(game.includes("GameHeroCharacter"), "game: game character remains");
  assert(lesson.includes("Present Simple คืออะไร"), "content: Present Simple unchanged");
  assert(lesson.includes("contentVersion: 2"), "content: version frozen");
  assert(lesson.includes("We eat lunch at noon."), "content: third example frozen");
  assert(
    /ไม่ใช้กับสิ่งที่กำลังทำอยู่ตอนนี้\r?\nจำไว้ : Present Simple = ทำประจำ หรือ เป็นจริงเสมอ/.test(
      lesson,
    ),
    "content: s1 jam-wai on summary line",
  );
  assert(
    !lesson.includes("ตอนนี้ จำไว้: Present Simple"),
    "content: s1 jam-wai not trailing the explanation",
  );
}
