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
  const section4 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenQuietShelterSection4.tsx",
    ),
    "utf8",
  );
  const section5 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenQuestionBoothSection5.tsx",
    ),
    "utf8",
  );
  const section6 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenClueTrailSection6.tsx",
    ),
    "utf8",
  );
  const section7 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenClockGardenSection7.tsx",
    ),
    "utf8",
  );
  const section8 = readFileSync(
    resolve(
      process.cwd(),
      "components/student-ui/EverydayGardenClubhouseMapSection8.tsx",
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
  const gameWorld = readFileSync(
    resolve(process.cwd(), "components/millionaire/GameWorld.tsx"),
    "utf8",
  );
  const resultPanel = readFileSync(
    resolve(process.cwd(), "components/millionaire/ResultPanel.tsx"),
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
  assert(css.includes(".gfaQuizWorld"), "css: quiz practice garden world");
  assert(css.includes(".gfaMillionaireWorld"), "css: millionaire adventure clearing world");
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
    companion.includes("EverydayGardenQuietShelterSection4"),
    "learn: section 4 prototype",
  );
  assert(
    companion.includes("EverydayGardenQuestionBoothSection5"),
    "learn: section 5 prototype",
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
    companion.includes('lesson.slug === "present-simple" && currentStep === 3'),
    "learn: section 4 step",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 4'),
    "learn: section 5 step",
  );
  assert(
    companion.includes("EverydayGardenClueTrailSection6"),
    "learn: section 6 prototype",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 5'),
    "learn: section 6 step",
  );
  assert(
    companion.includes("EverydayGardenClockGardenSection7"),
    "learn: section 7 prototype",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 6'),
    "learn: section 7 step",
  );
  assert(
    companion.includes("EverydayGardenClubhouseMapSection8"),
    "learn: section 8 prototype",
  );
  assert(
    companion.includes('lesson.slug === "present-simple" && currentStep === 7'),
    "learn: section 8 step",
  );
  assert(
    companion.includes("everyday-garden-playground"),
    "learn: playground scene",
  );
  assert(
    companion.includes("everyday-garden-workshop"),
    "learn: workshop scene",
  );
  assert(
    companion.includes("everyday-garden-shelter"),
    "learn: shelter scene",
  );
  assert(
    companion.includes("everyday-garden-booth"),
    "learn: booth scene",
  );
  assert(
    companion.includes("everyday-garden-trail"),
    "learn: trail scene",
  );
  assert(
    companion.includes("everyday-garden-clock"),
    "learn: clock scene",
  );
  assert(
    companion.includes("everyday-garden-clubhouse"),
    "learn: clubhouse scene",
  );
  assert(companion.includes("TeachingPanel"), "learn: TeachingPanel fallback");
  assert(companion.includes("showActivityGrid={!isStudentLearn}"), "learn: grid gated");
  assert(companion.includes("scrollIntoView"), "learn: section change scrolls to top");
  assert(companion.includes("previousStepRef"), "learn: skip initial load scroll");
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
  assert(section3.includes("กริยาเติม"), "s3: เติม -s/-es wording");
  assert(!section3.includes("กริยาเปลี่ยน"), "s3: no เปลี่ยน verb wording");
  assert(section3.includes("play →"), "s3 r2: play to plays");
  assert(section3.includes("watch →"), "s3 r2: watch to watches");
  assert(section3.includes("ch / sh / x / s"), "s3 r2: es endings visible");
  assert(!section3.includes("hissy"), "s3: no hissy-sound grammar rule");
  assert(!section3.includes("ป้ายสวน"), "s3: no garden-sign UI label");
  assert(!section4.includes("gfaGardenGate"), "s4: not section 1 composition");
  assert(section4.includes("GFA_SECTION4_ART"), "s4: asset map");
  assert(section4.includes("baiTongPauseGuide"), "s4: pause guide in lead");
  assert(section4.includes("quietShelterNotDoing"), "s4: shelter scene slot");
  assert(section4.includes('fit="contain"'), "s4: scene contain");
  assert(section4.includes("step.examples.filter"), "s4: examples from content");
  assert(section4.includes("บอกว่าไม่ได้ทำ"), "s4: negative meaning");
  assert(section4.includes("บอกว่า “ไม่ได้ทำ”"), "s4 r1: meaning is primary mission");
  assert(
    section4.indexOf("บอกว่า “ไม่ได้ทำ”") <
      section4.indexOf("don't / doesn't + Verb 1"),
    "s4 r1: meaning before formula",
  );
  assert(!section4.includes("gfaLearnFormula"), "s4 r1: no duplicate formula");
  assert(
    section4.includes("I / You / We / They →"),
    "s4 r1: one group formula",
  );
  assert(section4.includes("He / She / It →"), "s4 r1: one singular formula");
  assert(section4.includes("doesn't + <em>walk</em>"), "s4: verb 1 return");
  assert(section4.includes("ไม่ใช่ doesn't + walks"), "s4: walks contrast");
  assert(section4.includes("They play football."), "s4: group flip");
  assert(section4.includes("She walks to school."), "s4: singular flip");
  assert(section4.includes("takeAfterMark"), "s4: frozen check marks");
  assert(section4.includes("memoryLine"), "s4: frozen memory line");
  assert(!section4.includes("baiTongGroupCoach"), "s4: no group coach");
  assert(!section4.includes("baiTongSingularStamp"), "s4: no singular stamp");
  assert(!section4.includes("verbLeafS"), "s4: no leaf cue");
  assert(!section4.includes("ป้ายสวน"), "s4: no garden-sign UI label");
  assert(
    (section4.match(/baiTongPauseGuide/g) ?? []).length === 2,
    "s4: one Bai Tong slot",
  );
  assert(!section5.includes("gfaGardenGate"), "s5: not section 1 composition");
  assert(section5.includes("GFA_SECTION5_ART"), "s5: asset map");
  assert(section5.includes("baiTongQuestionGuide"), "s5: question guide in lead");
  assert(section5.includes("questionBoothAskAnswer"), "s5: booth scene slot");
  assert(section5.includes('fit="contain"'), "s5: scene contain");
  assert(section5.includes("ถามว่า “…ไหม?”"), "s5: meaning first");
  assert(
    section5.indexOf("ถามว่า “…ไหม?”") <
      section5.indexOf("Do / Does + ... + Verb 1?"),
    "s5: meaning before formula",
  );
  assert(section5.includes("I / You / We / They →"), "s5: do family");
  assert(section5.includes("He / She / It →"), "s5: does family");
  assert(section5.includes("Does + ... + <em>walk</em>"), "s5: verb 1 beat");
  assert(section5.includes("ไม่ใช่ Does + ... + walks"), "s5: walks contrast");
  assert(section5.includes("คำตอบสั้นใช้ do/does ซ้ำ"), "s5: short answer rule");
  assert(section5.includes("step.examples.filter"), "s5: examples from content");
  assert(section5.includes("takeAfterMark"), "s5: frozen check marks");
  assert(section5.includes("memoryLine"), "s5: frozen memory line");
  assert(!section5.includes("What do you"), "s5: no Wh what");
  assert(!section5.includes("Where does"), "s5: no Wh where");
  assert(!section5.includes("How often"), "s5: no how often");
  assert(!section5.includes("gfaLearnFormula"), "s5: no duplicate formula");
  assert(!section5.includes("Yes, she does."), "s5: no invented example");
  assert(
    (section5.match(/baiTongQuestionGuide/g) ?? []).length === 2,
    "s5: one Bai Tong slot",
  );
  assert(!section6.includes("gfaGardenGate"), "s6: not section 1 composition");
  assert(section6.includes("GFA_SECTION6_ART"), "s6: asset map");
  assert(section6.includes("baiTongClueGuide"), "s6: clue guide in lead");
  assert(section6.includes("clueTrailGarden"), "s6: trail scene slot");
  assert(section6.includes('fit="contain"'), "s6: scene contain");
  assert(section6.includes("อยากรู้อะไร?"), "s6: meaning first");
  assert(
    section6.indexOf("อยากรู้อะไร?") <
      section6.indexOf("Wh + do/does + ... + Verb 1?"),
    "s6: meaning before formula",
  );
  assert(section6.includes("What"), "s6: what");
  assert(section6.includes("Where"), "s6: where");
  assert(section6.includes("When"), "s6: when");
  assert(section6.includes("Why"), "s6: why");
  assert(section6.includes("Who"), "s6: who");
  assert(section6.includes("How"), "s6: how");
  assert(section6.includes("What time"), "s6: what time");
  assert(section6.includes("สิ่ง / เรื่องอะไร"), "s6: what meaning");
  assert(section6.includes("ที่ไหน"), "s6: where meaning");
  assert(section6.includes("เมื่อไร"), "s6: when meaning");
  assert(section6.includes("กี่โมง"), "s6: what time meaning");
  assert(section6.includes("ทำไม"), "s6: why meaning");
  assert(section6.includes("ใคร"), "s6: who meaning");
  assert(section6.includes("อย่างไร"), "s6: how meaning");
  assert(section6.includes("{step.formula}"), "s6: formula from content");
  assert(section6.includes("{step.examples.map"), "s6: examples from content");
  assert(
    section6.includes("PRESENT_SIMPLE_WORLD_TITLES[4]"),
    "s6: Question Booth world label",
  );
  assert(
    section6.includes("PRESENT_SIMPLE_WORLD_TITLES[5]"),
    "s6: Clue Trail world label",
  );
  assert(!section6.includes("ที่บูธถาม:"), "s6: no Thai booth world label");
  assert(!section6.includes("ทางล่าคำใบ้:"), "s6: no Thai trail world label");
  assert(
    section6.includes("Wh- มาเพิ่มข้างหน้า — กฎ Verb 1 ยังเหมือนเดิม"),
    "s6: verb 1 heading",
  );
  assert(
    section6.includes("Where + does + he + <em>keep</em> ...?"),
    "s6: keep beat",
  );
  assert(
    section6.includes("Does แล้ว → <em>keep</em> ไม่ใช่ keeps"),
    "s6: keeps contrast",
  );
  assert(section6.includes("takeAfterMark"), "s6: frozen check marks");
  assert(section6.includes("memoryLine"), "s6: frozen memory line");
  assert(!section6.includes("How often"), "s6: no how often");
  assert(!section6.includes("Which"), "s6: no which");
  assert(!section6.includes("Yes, I do"), "s6: no short answers");
  assert(!section6.includes("คำตอบสั้น"), "s6: no short-answer teaching");
  assert(!section6.includes("Who walks"), "s6: no who-as-subject");
  assert(!section6.includes("gfaLearnFormula"), "s6: no duplicate formula");
  assert(!section6.includes("When do you"), "s6: no invented when example");
  assert(!section6.includes("Why do you"), "s6: no invented why example");
  assert(!section6.includes("Who do you"), "s6: no invented who example");
  assert(
    (section6.match(/baiTongClueGuide/g) ?? []).length === 2,
    "s6: one Bai Tong slot",
  );
  assert(!section7.includes("gfaGardenGate"), "s7: not section 1 composition");
  assert(section7.includes("GFA_SECTION7_ART"), "s7: asset map");
  assert(section7.includes("baiTongClockGuide"), "s7: clock guide in lead");
  assert(section7.includes("clockGardenRoutines"), "s7: clock scene slot");
  assert(section7.includes('fit="contain"'), "s7: scene contain");
  assert(section7.includes("บ่อยแค่ไหน? เมื่อไร?"), "s7: meaning first");
  assert(
    section7.indexOf("บ่อยแค่ไหน? เมื่อไร?") <
      section7.indexOf("Subject + adverb + Verb"),
    "s7: meaning before formula",
  );
  assert(section7.includes("always"), "s7: always");
  assert(section7.includes("usually"), "s7: usually");
  assert(section7.includes("often"), "s7: often");
  assert(section7.includes("sometimes"), "s7: sometimes");
  assert(section7.includes("rarely"), "s7: rarely");
  assert(section7.includes("never"), "s7: never");
  assert(section7.includes("คำบอกความถี่วางหน้ากริยาหลัก"), "s7: position rule");
  assert(
    section7.includes("✓ I usually finish my homework."),
    "s7: usually contrast ok",
  );
  assert(
    section7.includes("✗ I finish usually my homework."),
    "s7: usually contrast bad",
  );
  assert(section7.includes("How often + do/does + Subject + Verb 1?"), "s7: how often");
  assert(
    section7.includes("PRESENT_SIMPLE_WORLD_TITLES[5]"),
    "s7: Clue Trail world name in How often bridge",
  );
  assert(
    !section7.includes("ทางล่าคำใบ้มี"),
    "s7: no Thai trail nickname as world label",
  );
  assert(section7.includes("every day"), "s7: every day");
  assert(section7.includes("once a week"), "s7: once a week");
  assert(section7.includes("twice a day"), "s7: twice a day");
  assert(section7.includes("ไม่ใช่ every days"), "s7: every day note");
  assert(section7.includes("at night"), "s7: at night");
  assert(section7.includes("on"), "s7: on");
  assert(section7.includes("ช่วงวัน"), "s7: in part of day");
  assert(section7.includes("{step.examples.map"), "s7: examples from content");
  assert(section7.includes("memoryLine"), "s7: frozen memory line");
  assert(section7.includes("เสมอ / เป็นประจำ"), "s7: always Thai aid");
  assert(section7.includes("โดยปกติ"), "s7: usually Thai aid");
  assert(section7.includes("บ่อย ๆ"), "s7: often Thai aid");
  assert(section7.includes("บางครั้ง"), "s7: sometimes Thai aid");
  assert(section7.includes("นาน ๆ ครั้ง"), "s7: rarely Thai aid");
  assert(section7.includes("ไม่เคย"), "s7: never Thai aid");
  assert(section7.includes("≈ 100%"), "s7: always approximate aid");
  assert(
    section7.includes("เปอร์เซ็นต์เป็นค่าประมาณเพื่อช่วยให้เห็นระดับความถี่"),
    "s7: approximate frequency note",
  );
  assert(!section7.includes("seldom"), "s7: no extra frequency word");
  assert(!section7.includes("is always"), "s7: no be + adverb");
  assert(!section7.includes("Sometimes I"), "s7: no front-position sometimes");
  assert(!section7.includes("Which"), "s7: no which");
  assert(!section7.includes("Who walks"), "s7: no who-as-subject");
  assert(!section7.includes("gfaLearnFormula"), "s7: no duplicate formula");
  assert(
    (section7.match(/baiTongClockGuide/g) ?? []).length === 2,
    "s7: one Bai Tong slot",
  );
  assert(!section8.includes("gfaGardenGate"), "s8: not section 1 composition");
  assert(section8.includes("GFA_SECTION8_ART"), "s8: asset map");
  assert(section8.includes("baiTongClubhouseGuide"), "s8: clubhouse guide in lead");
  assert(section8.includes("clubhouseMapFinale"), "s8: clubhouse scene slot");
  assert(section8.includes('fit="contain"'), "s8: scene contain");
  assert(section8.includes("เรียนครบแล้ว!"), "s8: arrival mission");
  assert(
    section8.includes("nowrapWorldName"),
    "s8: place nowrap unit",
  );
  assert(
    section8.includes("PRESENT_SIMPLE_WORLD_TITLES[7]"),
    "s8: English world title",
  );
  assert(css.includes(".gfaClubPlace{white-space:nowrap}"), "css: club place nowrap");
  assert(section8.includes("มาดูแผนที่ Present Simple ก่อนออกไปลอง Quiz"), "s8: mission to practice");
  assert(section8.includes("สิ่งที่ทำเป็นประจำ"), "s8: habit meaning");
  assert(section8.includes("สิ่งที่เป็นจริงเสมอ"), "s8: truth meaning");
  assert(section8.includes("S + Verb / Verb-s/es"), "s8: positive frame");
  assert(section8.includes("S + don't/doesn't + Verb 1"), "s8: negative frame");
  assert(section8.includes("Do/Does + S + Verb 1"), "s8: yes/no frame");
  assert(section8.includes("Wh + do/does + S + V1"), "s8: wh frame");
  assert(section8.includes("step.examples[index]"), "s8: examples from content");
  assert(section8.includes("memoryLine"), "s8: frozen memory line");
  assert(section8.includes("มีแผนที่แล้ว"), "s8: confidence beat");
  assert(section8.includes("STRUCTURE_FRAMES"), "s8: four-frame map");
  assert(
    (section8.match(/mark: "/g) ?? []).length === 4,
    "s8: exactly four frames",
  );
  assert(!section8.includes("How often"), "s8: no how often reteach");
  assert(!section8.includes("always"), "s8: no frequency reteach");
  assert(!section8.includes("%"), "s8: no percentages");
  assert(!section8.includes("Yes, I do"), "s8: no short answers");
  assert(!section8.includes("คำตอบสั้น"), "s8: no short-answer teaching");
  assert(!section8.includes("at + นาฬิกา"), "s8: no at/on/in table");
  assert(!section8.includes("usually"), "s8: no adverb reteach");
  assert(!section8.includes("gfaLearnFormula"), "s8: no duplicate formula");
  assert(!section8.includes("I play football after school."), "s8: no hardcoded examples");
  assert(
    (section8.match(/baiTongClubhouseGuide/g) ?? []).length === 2,
    "s8: one Bai Tong slot",
  );
  assert(css.includes(".gfaPlayground"), "css: playground section");
  assert(css.includes(".gfaWorkshop"), "css: workshop section");
  assert(css.includes(".gfaShelter"), "css: shelter section");
  assert(css.includes(".gfaShelterReturn"), "css: verb 1 return");
  assert(css.includes(".gfaShelterMissionPattern"), "css: secondary mission formula");
  assert(css.includes(".gfaBooth"), "css: booth section");
  assert(css.includes(".gfaBoothReturn"), "css: does verb 1 beat");
  assert(css.includes(".gfaTrail"), "css: trail section");
  assert(css.includes(".gfaTrailReturn"), "css: keep verb 1 beat");
  assert(css.includes(".gfaTrailClues"), "css: clue meanings");
  assert(css.includes(".gfaClock"), "css: clock section");
  assert(css.includes(".gfaClockScale"), "css: frequency scale");
  assert(css.includes(".gfaClub"), "css: clubhouse section");
  assert(css.includes(".gfaClubFrames"), "css: four-frame map");
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
  assert(
    artAssets.includes("/gfa/characters/bai-tong-pause-guide.webp"),
    "assets: pause guide path",
  );
  assert(
    artAssets.includes("/gfa/scenes/quiet-shelter-not-doing.webp"),
    "assets: shelter path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-question-guide.webp"),
    "assets: question guide path",
  );
  assert(
    artAssets.includes("/gfa/scenes/question-booth-ask-answer.webp"),
    "assets: booth path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-clue-guide.webp"),
    "assets: clue guide path",
  );
  assert(
    artAssets.includes("/gfa/scenes/clue-trail-garden.webp"),
    "assets: trail path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-clock-guide.webp"),
    "assets: clock guide path",
  );
  assert(
    artAssets.includes("/gfa/scenes/clock-garden-routines.webp"),
    "assets: clock garden path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-clubhouse-guide.webp"),
    "assets: clubhouse guide path",
  );
  assert(
    artAssets.includes("/gfa/scenes/clubhouse-map-finale.webp"),
    "assets: clubhouse map path",
  );
  assert(
    artAssets.includes("/gfa/scenes/quiz-practice-garden.webp"),
    "assets: quiz practice garden path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-quiz-coach.webp"),
    "assets: quiz coach path",
  );
  assert(
    artAssets.includes("/gfa/scenes/millionaire-adventure-clearing.webp"),
    "assets: millionaire adventure clearing path",
  );
  assert(
    artAssets.includes("/gfa/characters/bai-tong-millionaire-companion.webp"),
    "assets: millionaire companion path",
  );
  assert(
    artAssets.includes("/gfa/scenes/memory-garden-background-v2.png"),
    "assets: memory garden v2 path",
  );

  assert(existsSync(resolve(process.cwd(), "public/gfa/characters")), "assets: characters dir");
  assert(existsSync(resolve(process.cwd(), "public/gfa/scenes")), "assets: scenes dir");
  assert(existsSync(resolve(process.cwd(), "public/gfa/props")), "assets: props dir");
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-pause-guide.webp")),
    "assets: pause guide file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/quiet-shelter-not-doing.webp")),
    "assets: shelter file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-question-guide.webp")),
    "assets: question guide file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/question-booth-ask-answer.webp")),
    "assets: booth file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-clue-guide.webp")),
    "assets: clue guide file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/clue-trail-garden.webp")),
    "assets: trail file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-clock-guide.webp")),
    "assets: clock guide file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/clock-garden-routines.webp")),
    "assets: clock garden file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-clubhouse-guide.webp")),
    "assets: clubhouse guide file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/clubhouse-map-finale.webp")),
    "assets: clubhouse map file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/quiz-practice-garden.webp")),
    "assets: quiz practice garden file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-quiz-coach.webp")),
    "assets: quiz coach file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/millionaire-adventure-clearing.webp")),
    "assets: millionaire clearing file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/scenes/memory-garden-background-v2.png")),
    "assets: memory garden v2 file",
  );
  assert(
    existsSync(resolve(process.cwd(), "public/gfa/characters/bai-tong-millionaire-companion.webp")),
    "assets: millionaire companion file",
  );
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
  assert(artContract.includes("NAME=bai-tong-pause-guide"), "contract: pause guide");
  assert(artContract.includes("NAME=quiet-shelter-not-doing"), "contract: shelter scene");
  assert(artContract.includes("NAME=bai-tong-question-guide"), "contract: question guide");
  assert(artContract.includes("NAME=question-booth-ask-answer"), "contract: booth scene");
  assert(artContract.includes("NAME=bai-tong-clue-guide"), "contract: clue guide");
  assert(artContract.includes("NAME=clue-trail-garden"), "contract: trail scene");
  assert(artContract.includes("NAME=bai-tong-clock-guide"), "contract: clock guide");
  assert(artContract.includes("NAME=clock-garden-routines"), "contract: clock garden");
  assert(artContract.includes("NAME=bai-tong-clubhouse-guide"), "contract: clubhouse guide");
  assert(artContract.includes("NAME=clubhouse-map-finale"), "contract: clubhouse map");
  assert(artContract.includes("NAME=quiz-practice-garden"), "contract: quiz garden");
  assert(artContract.includes("NAME=bai-tong-quiz-coach"), "contract: quiz coach");
  assert(artContract.includes("NAME=millionaire-adventure-clearing"), "contract: millionaire clearing");
  assert(artContract.includes("NAME=bai-tong-millionaire-companion"), "contract: millionaire companion");
  assert(artContract.includes("NAME=memory-garden-background-v2"), "contract: memory garden v2");
  assert(
    artContract.includes("SEPARATE_CHARACTER_OVERLAY=NO"),
    "contract: no Memory Garden Bai Tong overlay",
  );
  assert(artContract.includes("TEXT_INSIDE_ASSET=NO"), "contract: no baked text");
  assert(
    artContract.includes("ART = VISUAL MEANING + WORLD STORYTELLING"),
    "contract: refined art rule",
  );

  assert(quiz.includes("GfaQuizWorld"), "quiz: practice garden wrap");
  assert(!quiz.includes("GfaLearningWorld"), "quiz: no learn world wrap");
  assert(!quiz.includes("gfaQuizCoin"), "quiz: nonfunctional coin removed");
  assert(!quiz.includes("เหรียญ 0"), "quiz: hardcoded coin copy removed");
  assert(!css.includes(".gfaQuizCoin"), "css: orphaned quiz coin removed");
  assert(quiz.includes("เริ่มทำแบบทดสอบ"), "quiz: intro copy unchanged");
  assert(choice.includes("millionaireChoice"), "choice: shared button unchanged");
  assert(game.includes("GameWorld"), "game: Sprint 42 world remains");
  assert(game.includes("AdventureMap"), "game: adventure map remains");
  assert(gameWorld.includes("GfaMillionaireWorld"), "game: adventure clearing wrap");
  assert(!game.includes("GameHeroCharacter"), "game: generic hero replaced by Bai Tong companion");
  assert(
    !resultPanel.includes("GameHeroCharacter"),
    "game: result uses Bai Tong companion, not generic hero",
  );
  assert(game.includes("เริ่มพิชิตด่าน"), "game: intro CTA unchanged");
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
