import { reactive, computed, toRefs } from "vue";
import { loadSubjectData } from "../services/data.js";
import { findGamesInSubjectData } from "../lib/search.js";
import { session } from "../services/session.js";
import { EXTERNAL_LINKS, SUBJECTS } from "../config.js";
import * as TEXTREADER from "@/lib/readtext.js";

const defaultState = () => ({
  subjectData: {
    math: null,
    chinese: null,
    technology: null,
  },
  grade: "0",
  currentSubject: "",
  selectedSemester: 0,
  selectedChapter: 0,
  showMode: "menu",
  searchResult: [],
  refresh: 0,
});

export function useGameBrowserData() {
  const state = reactive(defaultState());

  const showInfo = computed(() => state.subjectData[state.currentSubject]);

  const currentSemesterChapters = computed(() => {
    const info = showInfo.value;
    if (!info || !info[state.selectedSemester]) return [];
    return info[state.selectedSemester].gameItem || [];
  });

  const currentChapterSections = computed(() => {
    const chapters = currentSemesterChapters.value;
    if (!chapters || state.selectedChapter == null) return [];
    const chapter = chapters[state.selectedChapter];
    return chapter?.Section || [];
  });

  const hasCurrentSubjectData = computed(() => !!showInfo.value);

  function restoreSubjectFromSession() {
    const saved = session.getSubject();
    return saved && SUBJECTS.includes(saved) ? saved : "";
  }

  function restoreSemesterAndChapter() {
    state.selectedSemester = session.getSemester();
    state.selectedChapter = session.getChapter();
  }

  function saveSemester(index) {
    session.setSemester(index);
  }

  function saveChapter(index) {
    session.setChapter(index);
  }

  async function ensureSubjectLoaded(subjectLower) {
    if (state.subjectData[subjectLower]) return;
    state.subjectData[subjectLower] = await loadSubjectData(
      subjectLower,
      state.grade
    );
  }

  function maybeOpenExternalLink(subjectLower) {
    if (
      state.grade === "3" &&
      (subjectLower === "chinese" || subjectLower === "technology")
    ) {
      window.open(EXTERNAL_LINKS[subjectLower], "_blank");
      return true;
    }
    return false;
  }

  function stopReading() {
    TEXTREADER.ReadText("", true);
  }

  function read(title, description, stop = false) {
    const text = `Title:${title} Description:${description}.`;
    TEXTREADER.ReadText(text, stop);
  }

  async function selectSubject(subjectLower) {
    if (!SUBJECTS.includes(subjectLower)) return;
    state.currentSubject = subjectLower;
    session.setSubject(subjectLower);

    if (maybeOpenExternalLink(subjectLower)) return;

    await ensureSubjectLoaded(subjectLower);
    restoreSemesterAndChapter();

    state.showMode = "game";
    session.clearChapter();
    state.refresh += 1;
    stopReading();
  }

  function selectSemester(index) {
    state.selectedSemester = index;
    state.selectedChapter = 0;
    saveSemester(index);
  }

  function selectChapter(key) {
    state.selectedChapter = key;
    saveChapter(key);
    state.refresh += 1;
  }

  function switchMode(mode) {
    state.showMode = mode;
    stopReading();
  }

  function searchGame(keyword) {
    const results = [];
    for (const subject of SUBJECTS) {
      const data = state.subjectData[subject];
      if (!data) continue;
      results.push(...findGamesInSubjectData(data, keyword));
    }
    state.searchResult = results;
    switchMode("search");
  }

  function toGameRoute(gameId, gameName) {
    stopReading();
    return {
      name: "game",
      params: {
        id: gameId,
        grade: state.grade,
        subject: state.currentSubject,
        gameName,
      },
    };
  }

  async function init(gradeFromRoute) {
    state.grade = gradeFromRoute ?? 0;
    const restoredSubject = restoreSubjectFromSession();
    if (restoredSubject) {
      await selectSubject(restoredSubject);
    }
    TEXTREADER.InitReadProccess();
  }

  return {
    ...toRefs(state),
    showInfo,
    currentSemesterChapters,
    currentChapterSections,
    hasCurrentSubjectData,
    init,
    selectSubject,
    selectSemester,
    selectChapter,
    switchMode,
    searchGame,
    toGameRoute,
    read,
    stopReading,
  };
}
