import { loadSubjectData } from "./data";

// 提供快取 + 一致介面；之後要換來源只改這裡
export async function ensureSubjectLoaded(cache, subject, grade) {
  if (cache[subject]) return cache[subject];
  cache[subject] = await loadSubjectData(subject, grade);
}
