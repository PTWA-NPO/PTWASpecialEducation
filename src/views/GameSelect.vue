<template>
  <div class="outter">
    <header>
      <nav class="game-select__nav" style="width: 100%">
        <div class="img-container">
          <img :src="navLogoSrc" @click="switchRouter({ name: 'Home' })" />
        </div>
        <div class="subjects">
          <button
            class="subject__btn"
            :class="{ 'subject__btn--active': nowSubject === 'Math' }"
            @click="changeSubject('Math')"
          >
            {{ subjects["Math"] }}
          </button>
          <button
            class="subject__btn"
            :class="{ 'subject__btn--active': nowSubject === 'Chinese' }"
            @click="changeSubject('Chinese')"
          >
            {{ subjects["Chinese"] }}
          </button>
          <button
            class="subject__btn"
            :class="{ 'subject__btn--active': nowSubject === 'Technology' }"
            @click="changeSubject('Technology')"
          >
            {{ subjects["Technology"] }}
          </button>
        </div>
        <div class="search-group">
          <input
            v-model="searchInput"
            :placeholder="
              showMode === 'search' ? '按下esc可以返回' : '輸入ID或者標題'
            "
            @keyup.enter="searchGame()"
            @keyup.esc="return2Menu()"
          />
          <button
            class="search-group__btn-search"
            type="submit"
            @click="searchGame()"
          >
            搜尋
          </button>
        </div>
      </nav>
    </header>
    <section v-if="showMode === 'menu'" class="subjects-menu">
      <p class="title">請選科目</p>
      <div class="subjects-menu__container">
        <div class="subject" @click="changeSubject('Math')">
          <img :src="mathLogoSrc" />
          <p>數學</p>
        </div>
        <div class="subject" @click="changeSubject('Chinese')">
          <img :src="chineseLogoSrc" />
          <p>國語</p>
        </div>
        <div class="subject" @click="changeSubject('Technology')">
          <img :src="technologyLogoSrc" />
          <p>多元科技</p>
        </div>
      </div>
    </section>
    <section
      v-if="showMode === 'game'"
      class="game-select__container"
      style="overflow-y: hidden"
    >
      <template v-if="hasCurrentSubjectData">
        <div class="sidebar">
          <p class="sidebar__title">學期</p>
          <div class="sidebar__button-group">
            <template v-for="(semester, index) in showInfo" :key="index">
              <button
                class="sidebar__button"
                :class="{
                  'sidebar__button--semester-active':
                    selectedSemester === index,
                }"
                @click="selectSemester(index)"
              >
                {{ semester.lableName }}
              </button>
            </template>
          </div>
          <p class="sidebar__title">單元</p>
          <div v-if="showInfo" class="sidebar__button-group">
            <template
              v-for="(items, key) in currentSemesterChapters"
              :key="key"
            >
              <button class="sidebar__button" @click="selectChapter(key)">
                {{ items.Title }}
              </button>
            </template>
          </div>
        </div>
        <div
          v-if="showGameCards"
          :key="refresh"
          class="game-display__container"
        >
          <div
            v-for="(items, index) in currentChapterSections"
            :key="index"
            class="game-charpter__container"
          >
            <p class="game-charpter__title">
              {{ items.Title }}
            </p>
            <div class="game-card__group">
              <div v-for="item in items.Games" :key="item.id" class="card game-card">
                <game-card
                  :game-info="{
                    id: item.id,
                    imgSrc: item.Img,
                    name: item.Name,
                    description: item.Description,
                  }"
                  @enter-game="
                    switchRouter({
                      name: 'Game',
                      params: {
                        id: item.id,
                        Grade: grade,
                        Subject: nowSubject,
                        GameName: item.Name,
                      },
                    })
                  "
                  @read-text="makeReadText"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="under-construction">
        <img :src="underConstructionSrc" alt="建構中" />
      </div>
    </section>
    <section v-if="showMode === 'search'" class="search_result">
      <div v-if="searchResult === undefined" class="serch-result__not-found">
        <div>
          <p class="h1">沒有搜尋結果</p>
          <br />
          <button
            class="btn-back"
            style="height: 3em; width: 10rem"
            @click="return2Menu()"
          >
            返回目錄
          </button>
        </div>
      </div>
      <div v-else class="search-result__container">
        <p class="h1 mb-3">搜尋結果:</p>
        <div class="game-card__group">
          <div
            v-for="item in searchResult"
            :key="item.id"
            class="card game-card"
            style="width: 18rem"
            @click="
              switchRouter({
                name: 'Game',
                params: {
                  id: item.id,
                  Grade: grade,
                  Subject: nowSubject,
                  GameName: item.Name,
                },
              })
            "
          >
            <game-card
              :game-info="{
                id: item.id,
                imgSrc: item.Img,
                name: item.Name,
                description: item.Description,
              }"
              @read-text="makeReadText"
            />
          </div>
        </div>
        <div class="">
          <button
            class="btn-back"
            style="height: 3em; width: 20rem"
            @click="return2Menu()"
          >
            返回目錄
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import fetchJson from "@/utilitys/fetch-json.js";
import * as TEXTREADER from "@/utilitys/readtext.js";
import { getGameAssets, getSystemAssets } from "@/utilitys/get_assets.js";
import GameCard from "@/components/game-system/GameCard.vue";
export default {
  components: {
    GameCard,
  },
  data() {
    return {
      mathLogoSrc: getSystemAssets("math.png", "subject"),
      chineseLogoSrc: getSystemAssets("chinese.png", "subject"),
      technologyLogoSrc: getSystemAssets("technology.png", "subject"),
      navLogoSrc: getSystemAssets("logo.png", "nav_bar"),
      underConstructionSrc: getSystemAssets(
        "under-construction.png",
        "general"
      ),
      searchInput: "",
      searchResult: [],
      grade: 0,
      nowSubject: "", //預設科目
      showInfo: null,
      mathShowInfo: null, //準備渲染的資料
      chineseShowInfo: null,
      technologyShowInfo: null,
      subjects: {
        Math: "數學",
        Chinese: "國語",
        Technology: "多元科技",
      },
      selectedCharpter: null,
      showGameCards: false,
      showMode: "menu", // menu, game, search
      refresh: 0,
      selectedSemester: 0, // 新增：當前選擇的學期
      externalLinks: {
        Chinese: "https://jl123.pythonanywhere.com/grade/type/",
        Technology:
          "https://ptwa-npo.github.io/games/technology/grade1/index.html",
      },
    };
  },
  computed: {
    currentSemesterChapters() {
      if (!this.showInfo || !this.showInfo[this.selectedSemester]) return [];
      return this.showInfo[this.selectedSemester].gameItem;
    },
    currentChapterSections() {
      if (!this.currentSemesterChapters || !this.selectedCharpter) return [];
      return this.currentSemesterChapters[this.selectedCharpter]?.Section || [];
    },
    hasCurrentSubjectData() {
      if (this.nowSubject === "Math") {
        return this.mathShowInfo !== null;
      } else if (this.nowSubject === "Chinese") {
        return this.chineseShowInfo !== null;
      } else if (this.nowSubject === "Technology") {
        return this.technologyShowInfo !== null;
      }
      return false;
    },
  },
  async created() {
    // 在這裡你可以存取 this.$route.params.id
    this.grade = this.$route.params.id;
    await this.getEachSubjectJsonData();
    this.handleSubjectSession();
    TEXTREADER.InitReadProccess();
  },
  methods: {
    async getEachSubjectJsonData() {
      try {
        // 只載入數學科目的資料
        const mathRes = await this.getJsonData("Math");
        this.mathShowInfo = this.convertGameDataImageURLs(mathRes.data);

        // 國語和科技設為空陣列或 null
        this.chineseShowInfo = null;
        this.technologyShowInfo = null;
      } catch (error) {
        console.error(error);
      }
    },
    getJsonData(selectedSubject) {
      const url = `./Grade${this.grade}/${selectedSubject}Grade${this.grade}.json`;
      return fetchJson(url).catch(() => {
        throw `cannot load ${selectedSubject} 's JSON file`;
      });
    },
    handleSubjectSession() {
      const subjectSession = this.handleSession("get", "Subject");
      if (subjectSession) {
        this.nowSubject = subjectSession;
        if (subjectSession === "Math") {
          this.showInfo = this.mathShowInfo;
          this.changeSubject("Math");
          this.handleSemesterAndChapterSession("Math");
        } else if (subjectSession === "Chinese") {
          this.showInfo = this.chineseShowInfo;
          this.changeSubject("Chinese");
          this.handleSemesterAndChapterSession("Chinese");
        } else if (subjectSession === "Technology") {
          this.showInfo = this.technologyShowInfo;
          this.changeSubject("Technology");
          this.handleSemesterAndChapterSession("Technology");
        }
      }
    },
    handleSemesterAndChapterSession(subject) {
      const semesterSession = this.handleSession("get", `${subject}Semester`);
      if (semesterSession) {
        this.selectedSemester = parseInt(semesterSession);
      } else {
        this.selectedSemester = 0;
      }

      const chapterSession = this.handleSession("get", `${subject}Chapter`);
      if (chapterSession) {
        this.selectChapter(chapterSession);
      } else {
        this.selectedCharpter = 0;
        this.showGameCards = false;
      }
    },
    convertGameDataImageURLs(originalDatas) {
      const datas = originalDatas;
      for (const semester in datas) {
        for (const chapter in datas[semester].gameItem) {
          for (const section in datas[semester].gameItem[chapter].Section) {
            for (const game in datas[semester].gameItem[chapter].Section[
              section
            ].Games) {
              datas[semester].gameItem[chapter].Section[section].Games[
                game
              ].Img = getGameAssets(
                datas[semester].gameItem[chapter].Section[section].Games[game]
                  .id,
                datas[semester].gameItem[chapter].Section[section].Games[game]
                  .Img
              );
            }
          }
        }
      }
      return datas;
    },
    makeReadText(title, description, stop = false) {
      const text = `標題:${title}。說明:${description}。`;
      TEXTREADER.ReadText(text, stop);
    },
    selectChapter(key) {
      this.showGameCards = false;
      this.handleSession("set", `${this.nowSubject}Chapter`, key);
      this.selectedCharpter = String(key);
      this.refresh += 1;
      this.showGameCards = true;
    },
    handleSession(action, key, value) {
      if (action === "set") {
        sessionStorage.setItem(key, value);
      } else if (action === "get") {
        return sessionStorage.getItem(key);
      } else if (action === "remove") {
        sessionStorage.removeItem(key);
      }
    },
    changeSubject(subject) {
      this.nowSubject = subject;

      // 檢查是否為三年級的外部連結科目
      if (
        this.grade === "3" &&
        (subject === "Chinese" || subject === "Technology")
      ) {
        // 在新視窗開啟外部連結
        window.open(this.externalLinks[subject], "_blank");
        return;
      }

      // 原有的科目邏輯
      if (subject === "Math") {
        this.showInfo = this.mathShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleSemesterAndChapterSession("Math");
      } else if (subject === "Chinese") {
        this.showInfo = this.chineseShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleSemesterAndChapterSession("Chinese");
      } else if (subject === "Technology") {
        this.showInfo = this.technologyShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleSemesterAndChapterSession("Technology");
      }
      this.handleSession("set", "Subject", subject);
      this.handleSession("remove", "Chapter");
      this.refresh += 1;
      this.showGameCards = false;
      this.switchMode("game");
    },
    queryGame(searchList, tarSymbol) {
      if (!tarSymbol) return undefined;

      const finded_id = new Set();
      const foundGames = [];

      // 將關鍵字轉為小寫以進行不分大小寫搜尋
      tarSymbol = tarSymbol.toLowerCase();

      for (const chapter in searchList) {
        const sections = searchList[chapter]?.Section || [];
        for (const section of sections) {
          const games = section?.Games || [];
          for (const game of games) {
            // 檢查 ID 和名稱（不分大小寫）
            if (
              game.id?.toLowerCase().includes(tarSymbol) ||
              game.Name?.toLowerCase().includes(tarSymbol)
            ) {
              if (!finded_id.has(game.id)) {
                finded_id.add(game.id);
                foundGames.push(game);
              }
            }
          }
        }
      }

      return foundGames.length > 0 ? foundGames : undefined;
    },
    switchMode(mode) {
      this.showMode = mode;
      this.makeReadText("", "", true);
    },
    searchGame() {
      const keyword = this.searchInput;
      this.searchResult = [];

      // 搜尋所有科目和所有學期
      const mathResults = [];
      const chineseResults = [];
      const techResults = [];

      // 遍歷每個學期的資料
      if (this.mathShowInfo) {
        this.mathShowInfo.forEach((semester) => {
          const results = this.queryGame(semester.gameItem || [], keyword);
          if (results) {
            mathResults.push(...results);
          }
        });
      }

      if (this.chineseShowInfo) {
        this.chineseShowInfo.forEach((semester) => {
          const results = this.queryGame(semester.gameItem || [], keyword);
          if (results) {
            chineseResults.push(...results);
          }
        });
      }

      if (this.technologyShowInfo) {
        this.technologyShowInfo.forEach((semester) => {
          const results = this.queryGame(semester.gameItem || [], keyword);
          if (results) {
            techResults.push(...results);
          }
        });
      }

      // 合併所有搜尋結果
      this.searchResult = [...mathResults, ...chineseResults, ...techResults];

      // 如果沒有結果，設為 undefined
      if (this.searchResult.length === 0) {
        this.searchResult = undefined;
      }

      this.searchInput = "";
      this.switchMode("search");
    },
    return2Menu() {
      this.switchMode("menu");
      this.searchInput = "";
    },
    switchRouter(to) {
      this.makeReadText("", "", true);
      this.$router.push(to);
    },
    selectSemester(index) {
      this.selectedSemester = index;
      this.selectedCharpter = null;
      this.showGameCards = false;
      this.handleSession("set", `${this.nowSubject}Semester`, index);
    },
  },
};
</script>
<style lang="scss" scoped>
.subjects-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  .title {
    font-size: 3rem;
    font-weight: bold;
    margin: 0rem;
  }
  .subjects-menu__container {
    margin: 2rem;
    width: 40%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 2rem;
    @media (min-width: 1200px) {
      width: 30%;
    }
    .subject {
      @extend .container-basic;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      background-color: $primary-color;
      p {
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0;
      }
      img {
        height: 20vh;
        width: auto;
        object-fit: contain;
      }
    }
    .subject:hover {
      transform: scale($transform-scale);
    }
  }
}

header {
  touch-action: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  .game-select__nav {
    background-color: #f4c49f;
    height: 10vh !important;
    padding: 0 2rem;
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr 2fr 2fr;
    .img-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        height: 8vh;
        width: auto;
        object-fit: contain;
      }
    }
    .subjects {
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      .subject__btn {
        width: 33%;
        max-width: 9rem;
        height: 3rem;
        border-radius: $border-radius;
        background-color: #f4fc93;
        border: none;
        &--active {
          background-color: #d4e700;
        }
      }
    }
    .search-group {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      input {
        width: 70%;
        height: 3rem;
        border: solid;
        border-radius: $border-radius;
        border: none;
        padding: 0 1rem;
        &:focus {
          outline: 3px solid blue;
        }
      }
      .search-group__btn-search {
        height: 3rem;
        padding: 10px 1rem;
        border-radius: $border-radius;
        background-color: #f4fc93;
        border: none;
      }
    }
  }
}

.game-select__container {
  display: grid;
  grid-template-columns: 1fr 5fr;
  height: 90vh;
}

.game-display__container {
  padding: 1rem;
  overflow-y: scroll;
  .game-charpter__container {
    margin-bottom: 2vh;
  }
  .game-charpter__title {
    font-size: 1.5rem;
  }
}
.game-card__group {
  display: grid;
  width: 100%;
  align-self: center;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 1.5rem;
  .game-card {
    border-radius: $border-radius;
    border: solid 2px #aaa;
    transition: transform 0.3s ease;
    min-height: 16rem;
  }
  .game-card:hover {
    transform: scale(1.05);
  }
}

.search_result {
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  .btn-back {
    width: 20rem;
    height: 3em;
    margin: 2rem;
    background-color: $primary-btn-bg;
    border: none;
    &:hover {
      background-color: $primary-btn-hover-bg;
      scale: $transform-scale;
    }
  }
  .serch-result__not-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    .h1 {
      font-size: 3rem;
      font-weight: bold;
    }
    button {
      width: 10rem;
      height: 3em;
    }
  }
  .search-result__container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    @media (min-width: 1200px) {
      .game-card__group {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
    }
  }
}
.sidebar {
  display: flex;
  flex-direction: column;
  height: 90vh;
  background-color: #dfedb3;
  padding: 0 0.5rem;
  overflow-y: auto;
  &__title {
    font-size: 1.5em;
    margin: 0.5rem 0;
    position: sticky;
    top: 0;
    background-color: #dfedb3;
    z-index: 1;
  }
  &__button-group {
    display: grid;
    gap: 0.5rem;
  }
  &__button {
    transition: transform 0.3s ease;
    font-size: 1rem;
    background-color: #f8fbe8;
    color: #333;
    @extend .button-border;
    width: 100%;
    font-weight: 600;
    height: 2.5rem;
    padding: 0 0.5rem;
    &--semester-active {
      background-color: #a8c2ea;
    }
  }
}
.under-construction {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 90vh;
  grid-column: 1 / -1;
  padding: 2rem;
  overflow: hidden;

  img {
    max-width: 80%;
    max-height: 79vh;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}
</style>
