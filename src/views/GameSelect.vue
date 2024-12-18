<template>
  <div class="outter">
    <header>
      <nav class="game-select__nav" style="width: 100%">
        <div class="img-container">
          <img :src="navLogoSrc" @click="switchRouter({ name: 'Home' })" />
        </div>
        <div class="subjects">
          <button class="subject__btn" @click="changeSubject('Math')">
            {{ subjects["Math"] }}
          </button>
          <button class="subject__btn" @click="changeSubject('Chinese')">
            {{ subjects["Chinese"] }}
          </button>
          <button class="subject__btn" @click="changeSubject('Technology')">
            {{ subjects["Technology"] }}
          </button>
        </div>
        <div class="search-group">
          <input
            v-model="searchInput"
            :placeholder="
              showMode == 'search' ? '按下esc可以返回' : '輸入ID或者標題'
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
    <section v-if="showMode == 'menu'" class="subjects-menu">
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
      v-if="showMode == 'game'"
      class="game-select__container"
      style="overflow-y: hidden"
    >
      <div class="side-bar">
        <p class="title">現在科目</p>
        <button class="">
          {{ subjects[nowSubject] }}
        </button>
        <p class="title">章節</p>
        <div v-if="showInfo" class="button-container">
          <template v-for="(items, key) in showInfo" :key="key">
            <button
              class="list-group-item"
              @click="
                () => {
                  selectChapter(key);
                }
              "
            >
              {{ items.Title }}
            </button>
          </template>
        </div>
      </div>
      <!-- 遊戲卡片區域 -->
      <div v-if="showGameCards" :key="refresh" class="game-display__container">
        <div
          v-for="(items, index) in showInfo[selectedCharpter].Section"
          :key="index"
          class="game-charpter__container"
        >
          <p class="game-charpter__title">
            {{ items.Title }}
          </p>
          <div class="game-card__group">
            <div v-for="item in items.Games" class="card game-card">
              <GameCard
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
    </section>
    <section v-if="showMode == 'search'" class="search_result">
      <div v-if="searchResult == undefined" class="serch-result__not-found">
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
            <GameCard
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
import gameCard from "@/components/game-system/GameCard.vue";
export default {
  components: {
    GameCard: gameCard,
  },
  data() {
    return {
      mathLogoSrc: getSystemAssets("math.png", "subject"),
      chineseLogoSrc: getSystemAssets("chinese.png", "subject"),
      technologyLogoSrc: getSystemAssets("technology.png", "subject"),
      navLogoSrc: getSystemAssets("logo.png", "nav_bar"),
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
    };
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
        const [mathRes, chineseRes, technologyRes] = await Promise.all([
          this.getJsonData("Math"),
          this.getJsonData("Chinese"),
          this.getJsonData("Technology"),
        ]);
        // 轉譯圖片路徑
        this.mathShowInfo = this.convertGameDataImageURLs(mathRes.data);
        this.chineseShowInfo = this.convertGameDataImageURLs(chineseRes.data);
        this.technologyShowInfo = this.convertGameDataImageURLs(
          technologyRes.data
        );
      } catch (error) {
        console.error(error);
      }
    },
    getJsonData(selectedSubject) {
      let url = `./Grade${this.grade}/${selectedSubject}Grade${this.grade}.json`;
      return fetchJson(url).catch((err) => {
        throw `cannot load ${selectedSubject} 's JSON file`;
      });
    },
    handleSubjectSession() {
      let subjectSession = this.handleSession("get", "Subject");
      if (subjectSession) {
        this.nowSubject = subjectSession;
        if (subjectSession == "Math") {
          this.showInfo = this.mathShowInfo;
          this.changeSubject("Math");
          this.handleChapterSession("Math");
        } else if (subjectSession == "Chinese") {
          this.showInfo = this.chineseShowInfo;
          this.changeSubject("Chinese");
          this.handleChapterSession("Chinese");
        } else if (subjectSession == "Technology") {
          this.showInfo = this.technologyShowInfo;
          this.changeSubject("Technology");
          this.handleChapterSession("Technology");
        }
      }
    },
    handleChapterSession(subject) {
      let chapterSession = this.handleSession("get", `${subject}Chapter`);
      if (chapterSession) {
        this.selectChapter(chapterSession);
      } else {
        this.selectedCharpter = 0;
        this.showGameCards = false;
      }
    },
    convertGameDataImageURLs(originalDatas) {
      let datas = originalDatas;
      for (let i in datas) {
        for (let z in datas[i].Section) {
          for (let x in datas[i].Section[z].Games) {
            datas[i].Section[z].Games[x].Img = getGameAssets(
              datas[i].Section[z].Games[x].id,
              datas[i].Section[z].Games[x].Img
            );
          }
        }
      }
      return datas;
    },
    makeReadText(title, description, stop = false) {
      let text = `標題:${title}。說明:${description}。`;
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
      if (action == "set") {
        sessionStorage.setItem(key, value);
      } else if (action == "get") {
        return sessionStorage.getItem(key);
      } else if (action == "remove") {
        sessionStorage.removeItem(key);
      }
    },
    changeSubject(subject) {
      this.nowSubject = subject;
      if (subject == "Math") {
        this.showInfo = this.mathShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleChapterSession("Math");
      } else if (subject == "Chinese") {
        this.showInfo = this.chineseShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleChapterSession("Chinese");
      } else if (subject == "Technology") {
        this.showInfo = this.technologyShowInfo;
        this.handleSession("set", "Subject", subject);
        this.handleChapterSession("Technology");
      }
      this.handleSession("set", "Subject", subject);
      this.handleSession("remove", "Chapter");
      this.refresh += 1;
      this.showGameCards = false;
      this.switchMode("game");
    },
    queryGame(searchList, tarSymbol) {
      let finded_id = new Set();
      let foundGames = [];
      for (var i in searchList) {
        for (var z in searchList[i].Section) {
          for (var x in searchList[i].Section[z].Games) {
            if (searchList[i].Section[z].Games[x].id.includes(tarSymbol)) {
              if (!finded_id.has(searchList[i].Section[z].Games[x].id)) {
                finded_id.add(searchList[i].Section[z].Games[x].id);
                let temp = searchList[i].Section[z].Games[x];
                foundGames.push(temp);
              }
            }
            if (searchList[i].Section[z].Games[x].Name.includes(tarSymbol)) {
              if (!finded_id.has(searchList[i].Section[z].Games[x].id)) {
                finded_id.add(searchList[i].Section[z].Games[x].id);
                let temp = searchList[i].Section[z].Games[x];
                find.push(temp);
              }
            }
          }
        }
      }
      if (foundGames.length == 0) {
        return undefined;
      }
      return foundGames;
    },
    switchMode(mode) {
      this.showMode = mode;
      this.makeReadText("", "", (stop = true));
    },
    searchGame() {
      let keyword = this.searchInput;
      this.searchResult = [];
      this.searchResult = this.queryGame(this.mathShowInfo, keyword);
      this.searchInput = "";
      this.switchMode("search");
    },
    return2Menu() {
      this.switchMode("menu");
      this.searchInput = "";
    },
    switchRouter(to) {
      this.makeReadText("", "", (stop = true));
      this.$router.push(to);
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
    background-color: #cb9fcf;
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
        background-color: #bdb2ff;
        border: none;
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
        background-color: #bdb2ff;
        border: none;
      }
    }
  }
}

.game-select__container {
  display: grid;
  grid-template-columns: 1fr 5fr;
  height: 90vh;
  .side-bar {
    display: flex;
    flex-direction: column;
    height: 90vh;
    background-color: #ddd;
    padding: 0 1rem;
    button {
      @extend .button-border;
      width: 100%;
      font-weight: 600;
      font-size: 1.2rem;
      height: 2.6rem;
    }
    .title {
      font-size: 1.5em;
      margin: 1rem 0;
    }
    .button-container {
      display: grid;
      gap: 1rem;
      button {
        transition: transform 0.3s ease;
        font-size: 1rem;
        background-color: #feece9;
        color: #333;
      }
      button:hover {
        transform: scale(1.05);
        background-color: #feece9;
      }
    }
  }
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
</style>
