import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const batch = path.resolve(here, "../../../output/libtv/opening-mixed-h3-2026-09-07");
const destination = path.resolve(here, "../public/assets/home-video");

// Preserve the entire native H3 timeline. No cuts, retiming, fades or joins.
// Frequent keyframes keep forwards/backwards scroll seeking responsive.
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", path.join(batch, "generated/智能多参首屏入场到品牌H3-20260907.mp4"),
  "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
  "-pix_fmt", "yuv420p", "-g", "6", "-keyint_min", "6", "-sc_threshold", "0",
  "-movflags", "+faststart",
  path.join(destination, "opening-mixed-h3-20260907.mp4"),
], { stdio: "inherit" });
console.log("已导出智能多参连续影片，保留原始时间线。");
