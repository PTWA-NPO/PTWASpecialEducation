<template>
  <div id="GameView" ref="GameView">
    <!-- 背景圖片層 -->
    <div
      v-if="scratchSheetBackground"
      class="scratchsheet-background"
      :style="{ backgroundImage: `url(${scratchSheetBackground})` }"
    ></div>

    <game-header
      :grade="Grade"
      :game-name="gameName"
      :subject="Subjects[Subject]"
      @previous-page="previousPage"
    />
    <section>
      <div class="">
        <div class="Container">
          <div class="col-10 GameArea">
            <LevelAndTime
              v-if="Dataloaded && GameData.Questions"
              :time="time"
              :totaltime="totaltime"
              :questions="GameData.Questions"
              :nowlevel="Nowlevel"
              @pause-timer="pauseTimer"
              @reset-timer="resetTimer"
              @start-timer="startTimer"
              @reset-wrong-timer="resetWrongTimes"
            />
            <div class="row Game_Component">
              <!-- Dynamic import component -->
              <div
                v-if="GameStatus === 'Progressing'"
                id="GameContainer"
                class="games"
              >
                <EffectWindow
                  v-if="ShowReply"
                  id="CorrecIncorrect"
                  :answer-result="CorrectIncorrect"
                />
                <transition :name="transitionName" mode="out-in">
                  <component
                    :is="gameType"
                    v-if="gameType !== 'SelfDefine'"
                    ref="GameComponent"
                    :key="Nowlevel"
                    :game-id="gameID"
                    :game-data="GameData.Questions[Nowlevel - 1]"
                    :game-config="GameConfig"
                    @add-record="gameDataRecord"
                    @play-effect="effectPlayer"
                    @next-question="nextQuestion"
                  />
                </transition>

                <component
                  :is="selfdefinetemplate"
                  v-if="gameType === 'SelfDefine'"
                  :key="Nowlevel"
                  :game-id="gameID"
                  :game-data="GameData.Questions[Nowlevel - 1]"
                  :game-config="GameConfig"
                  @get-info="getAllInfo"
                  @add-record="gameDataRecord"
                  @download-data="ToCSV"
                  @config-header="configHeader"
                  @play-effect="effectPlayer"
                  @next-question="nextQuestion"
                  @previous-question="previousQuestion"
                  @start-game="startGame"
                  @reload-page="reloadPage"
                  @change-status="changeGameStatus"
                  @timer-start="startTimer"
                  @timer-pause="pauseTimer"
                  @timer-reset="resetTimer"
                  @calculator-tool="
                    () => {
                      calculatorToolVisible = true;
                    }
                  "
                  @reappear-code="reappearCode"
                />
              </div>
              <div v-else class="intro">
                <GameStart
                  v-if="GameStatus === 'NotStart' && Dataloaded"
                  :key="Dataloaded"
                  :game-status="GameStatus"
                  :intro="GameData.IntroText"
                  :game-name="gameName"
                  @start-game="startGame"
                  @open-teaching-modal="openMediaModal"
                />
                <GameOver
                  v-if="GameStatus === 'Done'"
                  @restart="reloadPage"
                  @download-record="ToCSV"
                  @previous-page="previousPage"
                />
              </div>
            </div>
          </div>
          <SideBar
            v-if="Dataloaded"
            class="SideBar col-2"
            :game-status="GameStatus"
            :download_data="download_data"
            :level-amount="GameData.Questions.length"
            :reappeare-code="questionOrder"
            :show-submit-button="shouldShowSubmitButton"
            @to-csv="ToCSV"
            @previous-question="previousQuestion"
            @next-question="nextQuestion"
            @start-game="startGame"
            @reload-page="reloadPage"
            @calculator-tool="
              () => {
                calculatorToolVisible = true;
              }
            "
            @reappear-code="reappearCode"
          >
            <template #hint>
              <hintbutton
                v-if="GameStatus === 'Progressing' && Hint['Type'] !== 'Method'"
                :hint-info="hintInfo"
                @open-hint-modal="openMediaModal"
              />
            </template>
          </SideBar>
        </div>
      </div>
    </section>
    <CalculatorTool
      v-if="calculatorToolVisible"
      :visible="calculatorToolVisible"
      @close="calculatorToolVisible = false"
      @save-canvas="saveCanvasBackground"
    />
    <TechModal
      v-if="showMediaModal"
      :media-data="GameData.introvideo"
      :game-id="gameID"
      @close="closeMediaModal"
    />
  </div>
</template>

<script>
import fetchJson from "@/lib/fetch-json.js";
import * as Arr2CSV from "@/features/game-runtime/lib/array2csv.js";
import GameStart from "@/features/game-runtime/components/GameStart.vue";
import GameOver from "@/features/game-runtime/components/GameOver.vue";
import GameHeader from "@/features/game-runtime/components/GameHeader.vue";
import LevelAndTime from "@/features/game-runtime/components/LevelAndTime.vue";
import MediaModal from "@/features/game-runtime/components/MediaModal.vue";
import hintbutton from "@/features/game-runtime/components/hintbutton.vue";
import * as ImportUrl from "@/lib/get-assets.js";
import { defineAsyncComponent } from "vue";
import EffectWindow from "@/features/game-runtime/components/EffectWindow.vue";
import gameStore from "@/features/game-runtime/model/game-store.js";
import { mapWritableState } from "pinia";
import { soundManager } from "@/lib/sound-manager.js";
import TechModal from "@/features/game-runtime/components/TechModal.vue";
import CalculatorTool from "@/features/game-runtime/components/CalculatorTool.vue";
const selfDefineTemplates = import.meta.glob(
  "@/features/games-oneoff/**/*.vue"
);
export default {
  name: "GamePlayPage",
  components: {
    TechModal,
    hintbutton,
    GameStart,
    GameOver,
    GameHeader,
    LevelAndTime,
    MediaModal,
    LinkGame: defineAsyncComponent(
      () => import("@/features/game-templates/link-game/LinkGame.vue")
    ),
    CompareGame: defineAsyncComponent(
      () => import("@/features/game-templates/compare-game/CompareGame.vue")
    ),
    TrueFalseGame: defineAsyncComponent(
      () => import("@/features/game-templates/true-false-game/TrueFalseGame.vue")
    ),
    SelectGame: defineAsyncComponent(
      () => import("@/features/game-templates/select-game/SelectGame.vue")
    ),
    ClassifyGame: defineAsyncComponent(
      () => import("@/features/game-templates/classify-game/ClassifyGame.vue")
    ),
    SortGame: defineAsyncComponent(
      () => import("@/features/game-templates/sort-game/SortGame.vue")
    ),
    FindTheItemGame: defineAsyncComponent(
      () => import("@/features/game-templates/find-the-item-game/FindTheItemGame.vue")
    ),
    AutoNumberingGame: defineAsyncComponent(
      () => import("@/features/game-templates/auto-numbering-game/AutoNumberingGame.vue")
    ),
    NumberingGame: defineAsyncComponent(
      () => import("@/features/game-templates/numbering-game/NumberingGame.vue")
    ),
    FillinBlank: defineAsyncComponent(
      () => import("@/features/game-templates/fillin-blank/FillinBlank.vue")
    ),
    PairingGame: defineAsyncComponent(
      () => import("@/features/game-templates/pairing-game/PairingGame.vue")
    ),
    NumberLock: defineAsyncComponent(
      () => import("@/features/game-templates/number-lock/NumberLock.vue")
    ),
    RacingCar: defineAsyncComponent(
      () => import("@/features/game-templates/racing-car/RacingCar.vue")
    ),
    WhackaMole: defineAsyncComponent(
      () => import("@/features/game-templates/whacka-mole/WhackaMole.vue")
    ),
    MazeGame: defineAsyncComponent(
      () => import("@/features/game-templates/maze-game/MazeGame.vue")
    ),
    SelectGameMulti: defineAsyncComponent(
      () => import("@/features/game-templates/select-game-multi/SelectGameMulti.vue")
    ),
    NumberSearchGame: defineAsyncComponent(
      () => import("@/features/game-templates/number-search-game/NumberSearchGame.vue")
    ),

    TrackGame: defineAsyncComponent(
      () => import("@/features/game-templates/track-game/TrackGame.vue")
    ),
    EffectWindow,
    SideBar: defineAsyncComponent(
      () => import("@/features/game-runtime/components/SideBar.vue")
    ),
    CopyItem: defineAsyncComponent(
      () => import("@/features/game-templates/copy-item/CopyItem.vue")
    ),
    AirplaneGame: defineAsyncComponent(
      () => import("@/features/game-templates/airplane-game/AirplaneGame.vue")
    ),
    ComponentTesters: defineAsyncComponent(
      () => import("@/features/game-templates/component-testers/componentTesters.vue")
    ), //for testing only
    BalloonShooting: defineAsyncComponent(
      () => import("@/features/game-templates/balloon-shooting/BalloonShooting.vue")
    ),
    LinkToImage: defineAsyncComponent(
      () => import("@/features/game-templates/linkto-image/LinktoImage.vue")
    ),
    WordProblemWithCalculator: defineAsyncComponent(
      () => import("@/features/game-templates/word-problem-with-calculator/WordProblemWithCalculator.vue")
    ),
    MoneyDrag: defineAsyncComponent(
      () => import("@/features/game-templates/money-drag/MoneyDrag.vue")
    ),
    MultiplyBoard: defineAsyncComponent(
      () => import("@/features/game-templates/multiply-board/MultiplyBoard.vue")
    ),
    FractionArithmetic: defineAsyncComponent(
      () => import("@/features/game-templates/fraction-arithmetic/FractionArithmetic.vue")
    ),
    FindPattern: defineAsyncComponent(
      () => import("@/features/game-templates/find-pattern/FindPattern.vue")
    ),
    OneDimensionalForm: defineAsyncComponent(
      () => import("@/features/game-templates/one-dimensional-form/OneDimensionalForm.vue")
    ),
    CalculatorTool,
  },
  data() {
    return {
      Dataloaded: false,
      // gameType: "loading",
      download_data: [[]], //下載的資料，格式為二維陣列。
      header: [],
      Subject: "",
      Grade: "",
      Subjects: {
        math: "數學",
        chinese: "國語",
        technology: "多元科技",
      },
      GameConfig: {},
      GameData: {},
      time: 0,
      totaltime: 0,
      finaltime: 0,
      intervalId: null,
      EffectWindow: false,
      EffectSrc: "",
      scratchSheetBackground: null,
      calculatorToolVisible: false,
      ShowReply: false,
      Hint: {
        Type: "None",
        Data: {
          FilePath: "",
          SourceType: "",
        },
      },
      WrongTimes: 0,
      MaxWrongTimes: 2,
      CorrectIncorrect: {
        Status: null,
      },
      isPassLevel: [],
      questionOrder: [],
      questionCopy: [],
      showMediaModal: false,
      // SentData2ChildComponent: {},
    };
  },
  computed: {
    ...mapWritableState(gameStore, [
      "gameCode",
      "transitionName",
      "GameStatus",
      "Nowlevel",
      "gameID",
      "gameName",
      "gameType",
    ]),

    selfdefinetemplate() {
      const key = `/src/features/games-oneoff/Grade${this.$route.params.Grade}/${this.$route.params.id}.vue`;
      const loader = selfDefineTemplates[key];

      if (!loader) {
        console.warn(`Missing self-define template: ${key}`);
        return () => null;
      }

      return defineAsyncComponent(loader);
    },
    hintInfo() {
      return {
        WrongTimes: this.WrongTimes,
        MaxWrongTimes: this.MaxWrongTimes,
      };
    },
    // 自動判斷是否需要送出答案按鈕
    shouldShowSubmitButton() {
      // 如果 GameConfig 中有明確設定，優先使用
      if (this.GameConfig.showSubmitButton !== undefined) {
        return this.GameConfig.showSubmitButton;
      }

      // 根據遊戲類型自動判斷
      const noSubmitButtonGames = [
        "WhackaMole",
        "RacingCar",
        "Airplane",
        "BalloonShooting",
        "TrackGame",
        "MazeGame",
      ];

      return !noSubmitButtonGames.includes(this.gameType);
    },
  },
  created() {
    this.gameID = this.$route.params.id;
    this.Subject = this.$route.params.Subject;
    this.Grade = this.$route.params.Grade;
    this.gameName = this.$route.params.GameName;
    // this.gameID = this.$route.params.id;
    this.GameStatus = "NotStart";
    this.Nowlevel = 1;
    (async () => {
      try {
        const res = await fetchJson(`./Grade${this.Grade}/${this.gameID}.json`);
        this.GameData = res.data;
        console.log(this.GameData.Questions);
        this.gameType = this.GameData.GameType;
        this.GameConfig = this.GameData.GameConfig;
        this.questionCopy = this.GameData.Questions;
        // this.InitIntroVideo();
        this.Dataloaded = true;
        this.randomChoice();
        this.GameData.Questions.forEach(() => {
          this.isPassLevel.push(false);
        });
      } catch (error) {
        console.error("Fetch Game Data Error: ", error);
      }
    })();
    console.log(this.gameCode);
    soundManager.registerSound(
      "Correct",
      `${ImportUrl.getSystemEffectAssets("CorrectAnswer.mp3")}`,
      false
    );
    soundManager.registerSound(
      "Wrong",
      `${ImportUrl.getSystemEffectAssets("WrongAnswer.mp3")}`,
      false
    );
    soundManager.registerSound(
      "FireWorkAnimation",
      `${ImportUrl.getSystemEffectAssets("harray.mp3")}`,
      false
    );
  },
  mounted() {
    this.fullScreen();
  },
  methods: {
    randomChoice() {
      const question = [];
      let checkcorrect = true;
      const record = [];
      for (const i in this.GameData.Questions) {
        if (this.GameData.Questions[i].length !== undefined) {
          const num = this.GameData.Questions[i].length;
          const rand = Math.floor(Math.random() * (num - 0 + 0));
          question.push(this.GameData.Questions[i][rand]);
          record.push(rand);
        } else {
          checkcorrect = false;
          break;
        }
      }
      this.gameCode = record.toString().replaceAll(",", "-");
      if (checkcorrect) {
        this.GameData.Questions = question;
      } else {
        this.gameCode = "origin";
        console.warn(
          "Radom Select Questions via level Fail, this could be the question is not a array (Format Error)"
        );
      }
    },
    reappearCode() {
      if (this.gameCode === "origin") return;
      const reappear = this.gameCode.split("-");
      const question = [];
      reappear.forEach((element, index) => {
        question.push(this.questionCopy[index][element]);
      });
      this.GameData.Questions = question;
      this.questionOrder = this.gameCode;
    },
    openMediaModal() {
      this.showMediaModal = true;
    },
    closeMediaModal() {
      this.showMediaModal = false;
    },
    changeGameStatus(status) {
      this.GameStatus = status;
    },
    startGame() {
      this.GameStatus = "Progressing";
      this.startTimer();
    },
    configHeader(arr) {
      this.header = arr;
    },
    ToCSV(data = this.download_data, defaultheader = true) {
      if (defaultheader) {
        const download = Arr2CSV.MadeCsvFile(
          this.gameID,
          this.gameName,
          this.Grade,
          this.Subject,
          data,
          this.finaltime,
          this.gameCode
        );
        Arr2CSV.DownloadCSV(download, this.gameName);
      } else {
        const download = Arr2CSV.MadeCsvFile(
          this.gameID,
          this.gameName,
          this.Grade,
          this.Subject,
          data,
          this.finaltime,
          this.gameCode,
          this.header
        );
        Arr2CSV.DownloadCSV(download, this.gameName);
      }
    },
    reloadPage() {
      this.GameStatus = "NotStart";
      this.Nowlevel = 1;
      this.resetWrongTimes();
      this.pauseTimer();
      this.resetTimer();
      this.time = 0;
      this.totaltime = 0;
      this.finaltime = 0;
      this.download_data = [[]];
      this.isPassLevel = [];
      this.scratchSheetBackground = null;
      this.GameData.Questions.forEach(() => {
        this.isPassLevel.push(false);
      });
    },
    nextQuestion() {
      this.isPassLevel[this.Nowlevel - 1] = true;
      this.resetWrongTimes();
      if (this.checkUnansweredQuestions()) {
        this.GameStatus = "Done";
        soundManager.stopAllSounds();
        this.effectPlayer("FireWorkAnimation");
        this.finaltime = this.totaltime;
      }
      this.pauseTimer();
      this.resetTimer();
      this.startTimer();
    },
    checkUnansweredQuestions() {
      const totalQuestions = this.GameData.Questions.length;
      let allQuestionsAnswered = true;

      // 檢查是否有未回答的問題
      if (this.isAnyQuestionUnanswered()) {
        allQuestionsAnswered = false;

        // 嘗試從當前等級以後尋找未回答的問題
        if (!this.findNextUnansweredQuestion(this.Nowlevel, totalQuestions)) {
          // 如果找不到且當前是最後一題，則允許回到之前的未答題目
          if (this.Nowlevel === totalQuestions) {
            this.findNextUnansweredQuestion(0, totalQuestions);
          }
        }
      }

      return allQuestionsAnswered;
    },

    isAnyQuestionUnanswered() {
      return this.isPassLevel.some((answered) => !answered);
    },

    findNextUnansweredQuestion(startLevel, totalQuestions) {
      for (let i = startLevel; i < totalQuestions; i++) {
        if (!this.isPassLevel[i]) {
          this.Nowlevel = i + 1;
          this.transitionName = "slide-left";
          return true;
        }
      }
      return false;
    },
    previousQuestion() {
      this.resetWrongTimes();
      if (this.Nowlevel > 1) {
        this.Nowlevel--;
        this.transitionName = "slide-right";
      }
      this.pauseTimer();
      //FIXME 傳資料進入CSV
      this.resetTimer();
      this.startTimer();
    },

    startTimer() {
      if (this.intervalId) {
        return;
      }
      this.intervalId = window.setInterval(() => {
        this.time++;
        this.totaltime++;
      }, 1000);
    },
    pauseTimer() {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    },
    resetTimer() {
      this.pauseTimer();
      this.time = 0;
    },
    gameDataRecord(data, SelfDefine = false) {
      //紀錄遊戲資料
      // default ["正確答案","學生作答答案","是否正確","作答秒數(關卡)","作答秒數(總時間)"]
      // data格式[正確答案,學生作答答案,是否正確]
      let record = [];
      if (SelfDefine) {
        record = Arr2CSV.ArrayTemplate2Record(
          data,
          this.Nowlevel,
          this.time,
          this.totaltime
        );
        console.log("Self Define Game Data Record");
      } else {
        record = [data[0], data[1], data[2], this.time, this.totaltime];
        console.log("Default Game Data Record: " + record);
      }
      try {
        if (!Array.isArray(this.download_data[this.Nowlevel - 1])) {
          this.download_data[this.Nowlevel - 1] = [];
        }
        this.download_data[this.Nowlevel - 1].push(record);
      } catch (error) {
        console.error("Error in pushing record: ", error);
      }
    },
    effectPlayer(type) {
      switch (type) {
        case "CorrectSound":
          this.effectPlayer("CorrectAnimation");
          soundManager.playSoundImmediately(`Correct`);
          break;
        case "WrongSound":
          this.WrongTimes++;
          this.effectPlayer("IncorrectAnimation");
          soundManager.playSoundImmediately(`Wrong`);
          break;
        case "FireWorkAnimation":
          this.EffectWindow = true;
          soundManager.playSoundImmediately(`FireWorkAnimation`);
          setTimeout(() => {
            this.EffectWindow = false;
          }, 3000);
          break;
        case "CorrectAnimation":
          this.CorrectIncorrect.Status = "Correct";
          this.ShowReply = true;
          setTimeout(() => {
            this.ShowReply = false;
          }, 1000);
          break;
        case "IncorrectAnimation":
          this.CorrectIncorrect.Status = "Incorrect";
          this.ShowReply = true;
          setTimeout(() => {
            this.ShowReply = false;
          }, 1000);
          break;
      }
    },
    fullScreen() {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          /* IE11 */
          elem.msRequestFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen request failed:", error);
      }
      // window.removeEventListener('mousemove', this.FullScreen);
    },
    exitFullScreen() {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          /* IE11 */
          document.msExitFullscreen();
        }
      } catch (error) {
        console.warn("Exit Full Screen Error: ", error);
      }
    },
    getAllInfo() {
      return {
        Subject: this.Subject,
        Grade: this.Grade,
        Name: this.gameName,
        GameID: this.gameID,
        GameType: this.gameType,
        GameConfig: this.GameConfig,
        GameData: this.GameData,
        GameStatus: this.GameStatus,
        Nowlevel: this.Nowlevel,
        time: this.time,
        intervalId: this.intervalId,
        EffectWindow: this.EffectWindow,
        EffectSrc: this.EffectSrc,
      };
    },
    previousPage() {
      soundManager.stopAllSounds();
      this.exitFullScreen();
      this.$router.replace({ path: `/${this.$route.params.Grade}` });
    },
    saveCanvasBackground(canvasImage) {
      this.scratchSheetBackground = canvasImage;
    },
    resetWrongTimes() {
      this.WrongTimes = 0;
    },
  },
};
</script>
<style scoped lang="scss">
.scratchsheet-background {
  position: fixed;
  bottom: 0; /* 對應畫布容器的 align-self: end */
  left: 0;
  width: 85vw; /* 對應畫布容器的 width: 85% */
  height: 90vh; /* 對應畫布容器的 height: 90% */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  z-index: 100;
}

.img-hover-zoom {
  transition: transform 0.3s ease; /* 平滑的過渡效果 */
}

.img-hover-zoom:hover {
  transform: scale(1.07); /* 放大至原大小的 110% */
}

.img-hover-zoom {
  max-width: 100%; /* 或者是卡片寬度的百分比 */
  height: auto; /* 保持圖片的比例 */
}
.list-group {
  border: none !important; /* 移除邊框 */
}
.list-group-item {
  border: none !important; /* 移除每個 list-group-item 的邊框 */
}
/* 如果按鈕內有圖片，也要確保圖片不會超出按鈕的寬度 */
.function-btn img {
  max-width: 100%;
  height: auto; /* 保持圖片的比例 */
}

//btn, container, row, col

.Container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-self: center;
  width: 100vw;
  height: 90vh !important;
  .GameArea {
    margin-top: 2vh;
    width: 85%;
    padding-right: 1rem;
    padding-left: 1rem;
    #GameContainer {
      height: 100%;
      position: relative;
      #CorrecIncorrect {
        position: absolute;
        width: 98% !important;
        height: 98% !important ;
        z-index: 100;
      }
    }
  }
}

#Effects {
  position: absolute;
  top: 0;
  left: 0;
  width: autos;
  height: 100vh;
}

.Game_Component {
  width: 84vw !important;
  max-height: 79vh;
  // border: solid 1px #000;
  height: 79vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative; /* 添加相對定位 */
  .games {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative; /* 確保子元素正確定位 */
    min-height: 400px; /* 設置最小高度避免佈局跳動 */
  }

  overflow-x: auto;
  overflow-y: auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  img {
    max-width: 100%;
    height: auto;
  }
  video {
    max-width: 100%;
    height: auto;
  }
}

.Pointable {
  cursor: pointer;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
  //   position: absolute;
  width: 100%;
}

.slide-left-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave,
.slide-right-enter-to,
.slide-right-leave {
  transform: translateX(0%);
}
.mediaModal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.mediaModal-container {
  background: #fff;
  border-radius: 10px;
  width: 80%;
  height: 90%;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.mediaModal-header {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.mediaModal-title {
  font-size: 2rem;
  text-align: start;
  margin: 0;
}

.mediaModal-body {
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-grow: 1;
}

.mediaModal-footer {
  display: flex;
  justify-content: center;
  width: 100%;
}

.media-content {
  max-width: 100%;
  max-height: 100%;
  min-width: 300px;
  min-height: 200px;
  object-fit: contain;
  flex-grow: 1;
}

button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #5a6268;
}

img.media-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mediaModal-content {
  margin: 0;
  font-size: 1.5rem;
}

/* 防止組件載入時的佈局跳動 */
#GameContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>




