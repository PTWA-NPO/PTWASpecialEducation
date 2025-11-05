import fetchJson from "@/lib/fetch-json.js";

import { convertGameDataImageURLs } from "../lib/normalize.js";

const SubjectFileMap = {
  math: "Math",
  chinese: "Chinese",
  technology: "Technology",
};

export async function getJsonData(subjectLower, grade) {
  const cap = SubjectFileMap[subjectLower];
  const url = `./Grade${grade}/${cap}Grade${grade}.json`;
  const res = await fetchJson(url);
  return res.data;
}

export async function loadSubjectData(subjectLower, grade) {
  const raw = await getJsonData(subjectLower, grade);
  return convertGameDataImageURLs(raw);
}
