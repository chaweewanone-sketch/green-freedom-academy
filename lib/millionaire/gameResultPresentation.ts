import { RECOMMENDATION_THRESHOLDS } from "@/lib/analytics/recommendation";

export type GameResultBand = "weak" | "developing" | "strong";

export type GameResultPresentation = {
  band: GameResultBand;
  kicker: string;
  title: string;
  message: string;
  starsLabel: string;
  percentage: number;
};

function resultBand(percentage: number): GameResultBand {
  if (percentage < RECOMMENDATION_THRESHOLDS.developingMin) {
    return "weak";
  }

  if (percentage < RECOMMENDATION_THRESHOLDS.strongMin) {
    return "developing";
  }

  return "strong";
}

export function buildGameResultPresentation(
  score: number,
  total: number,
): GameResultPresentation {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const band = resultBand(percentage);
  const kicker = `เล่นครบ ${total} ด่านแล้ว`;
  const starsLabel = `ดาว ${score}/${total}`;

  if (band === "weak") {
    return {
      band,
      kicker,
      title: "เกมพิชิต 10 ด่าน",
      message: "สู้ต่อไปนะ กลับไปฝึก Quiz แล้วจะพิชิตด่านได้มากขึ้น",
      starsLabel,
      percentage,
    };
  }

  if (band === "developing") {
    return {
      band,
      kicker,
      title: "ใกล้ผ่านแล้ว",
      message: "เก็บดาวเพิ่มอีกนิด แล้วจะผ่านเกมนี้",
      starsLabel,
      percentage,
    };
  }

  return {
    band,
    kicker,
    title: "เยี่ยม! ผ่านเกมพิชิต 10 ด่านแล้ว ⭐",
    message: "เก็บครบเกือบทุกด่านแล้ว เก่งมาก",
    starsLabel,
    percentage,
  };
}
