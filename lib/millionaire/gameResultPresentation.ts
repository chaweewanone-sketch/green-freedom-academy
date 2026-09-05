import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import { RECOMMENDATION_THRESHOLDS } from "@/lib/analytics/recommendation";
import {
  formatGamePrize,
  MILLIONAIRE_FINAL_DISPLAY_PRIZE,
} from "@/lib/millionaire/stageLadder";

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
  lessonTitle?: string,
): GameResultPresentation {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const band = resultBand(percentage);
  const kicker = MILLIONAIRE_ACTIVITY_DISPLAY_NAME;
  const starsLabel = `ผ่าน ${score}/${total} ด่าน`;
  const finalPrize = formatGamePrize(MILLIONAIRE_FINAL_DISPLAY_PRIZE);
  const lesson = lessonTitle?.trim() || "เกมนี้";

  if (band === "weak") {
    return {
      band,
      kicker,
      title: "สู้ต่อไปนะ เราไปด้วยกัน",
      message: `เล่นครบ ${total} ด่านแล้ว กลับไปฝึก Quiz แล้วจะขึ้นบันไดไปถึง ${finalPrize} ได้ง่ายขึ้น`,
      starsLabel,
      percentage,
    };
  }

  if (band === "developing") {
    return {
      band,
      kicker,
      title: "อีกนิดเดียว!",
      message: `เล่นครบ ${total} ด่านแล้ว อีกนิดจะพิชิต ${finalPrize}`,
      starsLabel,
      percentage,
    };
  }

  return {
    band,
    kicker,
    title: "🏆 เยี่ยมมาก!",
    message: `เล่นครบ ${total} ด่านแล้ว พิชิต ${finalPrize} ในเกม ${lesson} สำเร็จแล้ว`,
    starsLabel,
    percentage,
  };
}
