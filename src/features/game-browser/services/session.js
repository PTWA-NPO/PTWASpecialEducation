import { ssGet, ssSet, ssRemove } from "../lib/session"; // 你原本的

const KEYS = { subject: "subject", semester: "semester", chapter: "chapter" };

export const session = {
  getSubject: () => ssGet(KEYS.subject),
  setSubject: (v) => ssSet(KEYS.subject, v),
  getSemester: () => Number(ssGet(KEYS.semester) ?? 0),
  setSemester: (i) => ssSet(KEYS.semester, String(i)),
  getChapter: () => {
    const ch = ssGet(KEYS.chapter);
    return ch != null ? Number(ch) : 0;
  },
  setChapter: (i) => ssSet(KEYS.chapter, String(i)),
  clearChapter: () => ssRemove(KEYS.chapter),
};
