import { getSystemAssets } from "@/lib/get-assets.js";

export const SYSTEM_LOGO_SRC = getSystemAssets("logo.png", "nav_bar");
export const UNDER_CONSTRUCTION_SRC = getSystemAssets(
  "under-construction.png",
  "general"
);

const SUBJECT_ASSET_FILENAMES = Object.freeze({
  math: "math.png",
  chinese: "chinese.png",
  technology: "technology.png",
});

export const SUBJECT_LOGO_SRC = Object.freeze(
  Object.fromEntries(
    Object.entries(SUBJECT_ASSET_FILENAMES).map(([key, fileName]) => [
      key,
      getSystemAssets(fileName, "subject"),
    ])
  )
);

export function getSubjectLogo(subjectKey) {
  if (!subjectKey) return SYSTEM_LOGO_SRC;
  const normalizedKey = subjectKey.toString().trim().toLowerCase();
  return SUBJECT_LOGO_SRC[normalizedKey] ?? SYSTEM_LOGO_SRC;
}
