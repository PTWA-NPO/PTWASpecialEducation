export function findGamesInSemester(semesterGameItem = [], keyword = "") {
  if (!keyword) return [];
  const lower = keyword.toLowerCase();
  const seen = new Set();
  const acc = [];
  for (const chapter of semesterGameItem) {
    for (const section of chapter?.Section || []) {
      for (const g of section?.Games || []) {
        const idHit = g.id?.toLowerCase?.().includes(lower);
        const nameHit = g.Name?.toLowerCase?.().includes(lower);
        if ((idHit || nameHit) && !seen.has(g.id)) {
          seen.add(g.id);
          acc.push(g);
        }
      }
    }
  }
  return acc;
}

export function findGamesInSubjectData(subjectArray = [], keyword = "") {
  if (!Array.isArray(subjectArray) || subjectArray.length === 0) return [];
  const results = [];
  for (const semester of subjectArray) {
    const add = findGamesInSemester(semester?.gameItem || [], keyword);
    if (add?.length) results.push(...add);
  }
  return results;
}
