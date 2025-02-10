<template>
  <div id="GameView" ref="GameView">
    <GameHeader
      :grade="Grade"
      :game-name="gameName"
      :subject="Subjects[Subject]"
      @previousPage="previousPage"
    />
    <section>
      <div class="">
        <div class="Container">
          <div class="col-10 GameArea">
            <LevelAndTime
              :time="time"
              :totaltime="totaltime"
              :questions="GameData.Questions"
              :nowlevel="Nowlevel"
              @pauseTimer="pauseTimer"
              @resetTimer="resetTimer"
              @startTimer="startTimer"
              @resetWrongTimer="resetWrongTimes"
            />
            <div class="row Game_Component">
              <!-- Dynamic import component -->
              <div v-if="GameStatus == 'Progressing'" id="GameContainer" class="games">
                <EffectWindow
                  v-if="ShowReply"
                  id="CorrecIncorrect"
                  :Data="CorrectIncorrect"
                />
                <transition :name="transitionName" mode="out-in">
                  <component
                    :is="gameType"
                    v-if="gameType != 'SelfDefine'"
                    ref="GameComponent"
                    :key="Nowlevel"
                    :ID="gameID"
                    :GameData="GameData.Questions[Nowlevel - 1]"
                    :GameConfig="GameConfig"
                    @add-record="gameDataRecord"
                    @play-effect="effectPlayer"
                    @next-question="nextQuestion"
                  />
                </transition>

                <component
                  :is="selfdefinetemplate"
                  v-if="gameType == 'SelfDefine'"
                  :key="Nowlevel"
                  :ID="gameID"
                  :GameData="GameData.Questions[Nowlevel - 1]"
                  :GameConfig="GameConfig"
                  :EnviromerntInfo="getAllInfo()"
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
                  @scratchSheet="
                    () => {
                      scratchSheetVisible = true;
                    }
                  "
                />
              </div>
              <div v-else class="intro">
                <GameStart
                  v-if="GameStatus == 'NotStart'"
                  :key="Dataloaded"
                  :Status="GameStatus"
                  :intro="GameData.IntroText"
                  :GameName="gameName"
                  @start-game="startGame"
                  @open-teaching-modal="openMediaModal"
                />
                <GameOver
                  v-if="GameStatus == 'Done'"
                  @restart="reloadPage"
                  @downloadRecord="ToCSV"
                  @previousPage="previousPage"
                />
              </div>
            </div>
          </div>
          <SideBar
            v-if="Dataloaded"
            class="SideBar col-2"
            :GameStatus="GameStatus"
            :HintInfo="hintInfo"
            :Hint="Hint"
            :download_data="download_data"
            :level-amount="GameData.Questions.length"
            :reappeareCode="questionOrder"
            @toCsv="ToCSV"
            @previousQuestion="previousQuestion"
            @next-question="nextQuestion"
            @startGame="startGame"
            @reload-page="reloadPage"
            @scratchSheet="
              () => {
                scratchSheetVisible = true;
              }
            "
            @reappear-code="reappearCode"
          >
            <template #hint>
              <hintbutton
                v-if="GameStatus == 'Progressing' && Hint['Type'] != 'Method'"
                :HintInfo="hintInfo"
                @openHintModal="openMediaModal"
              />
            </template>
          </SideBar>
        </div>
      </div>
    </section>
    <scratchSheet v-if="scratchSheetVisible" @close-sheet="closeSratchSheet" />
    <TechModal
      v-if="showMediaModal"
      :media-data="GameData.introvideo"
      @close="closeMediaModal"
    />
  </div>
</template>

<script>
import fetchJson from "@/utilitys/fetch-json.js";
import * as Arr2CSV from "@/utilitys/array2csv.js";
import loading from "@/components/loading.vue";
import GameStart from "@/components/game-system/GameStart.vue";
import GameOver from "@/components/game-system/GameOver.vue";
import Header from "@/components/game-system/header.vue";
import LevelAndTime from "@/components/game-system/LevelAndTime.vue";
import MediaModal from "@/components/game-system/MediaModal.vue";
import scratchSheet from "@/components/ScratchSheets.vue";
import hintbutton from "@/components/game-system/hintbutton.vue";
import * as ImportUrl from "@/utilitys/get_assets.js";
import { defineAsyncComponent } from "vue";
import EffectWindow from "@/components/game-system/EffectWindow.vue";
import gameStore from "@/stores/game";
import { mapWritableState } from "pinia";
import { soundManager } from "@/utilitys/sound-manager.js";
import TechModal from "@/components/game-system/TechModal.vue";
export default {
  components: {
    TechModal,
    hintbutton,
    scratchSheet,
    GameStart,
    GameOver,
    GameHeader: Header,
    LevelAndTime,
    MediaModal,
    loading,
    LinkGame: defineAsyncComponent(() => import("@/views/GameTemplate/LinkGame.vue")),
    CompareGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/CompareGame.vue")
    ),
    TrueFalseGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/TrueFalseGame.vue")
    ),
    SelectGame: defineAsyncComponent(() => import("@/views/GameTemplate/SelectGame.vue")),
    NumberInputGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/NumberInputGame.vue")
    ),
    ClassifyGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/ClassifyGame.vue")
    ),
    SortGame: defineAsyncComponent(() => import("@/views/GameTemplate/SortGame.vue")),
    FindTheItemGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/FindTheItemGame.vue")
    ),
    AutoNumberingGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/AutoNumberingGame.vue")
    ),
    NumberingGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/NumberingGame.vue")
    ),
    CompareGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/CompareGame.vue")
    ),
    FillinBlank: defineAsyncComponent(() =>
      import("@/views/GameTemplate/FillinBlank.vue")
    ),
    CalculatorGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/CalculatorGame.vue")
    ),
    PairingGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/PairingGame.vue")
    ),
    NumberLock: defineAsyncComponent(() => import("@/views/GameTemplate/NumberLock.vue")),
    RacingCar: defineAsyncComponent(() => import("@/views/GameTemplate/RacingCar.vue")),
    WhackaMole: defineAsyncComponent(() => import("@/views/GameTemplate/WhackaMole.vue")),
    Maze: defineAsyncComponent(() => import("@/views/GameTemplate/Maze.vue")),
    NumberLock: defineAsyncComponent(() => import("@/views/GameTemplate/NumberLock.vue")),
    SelectGameMulti: defineAsyncComponent(() =>
      import("@/views/GameTemplate/SelectGameMulti.vue")
    ),
    NumberSearchGame: defineAsyncComponent(() =>
      import("@/views/GameTemplate/NumberSearchGame.vue")
    ),
    // eslint-disable-next-line vue/no-reserved-component-names
    Track: defineAsyncComponent(() => import("@/views/GameTemplate/Track.vue")),
    EffectWindow,
    SideBar: defineAsyncComponent(() => import("@/components/game-system/SideBar.vue")),
    CopyItem: defineAsyncComponent(() => import("@/views/GameTemplate/CopyItem.vue")),
    Airplane: defineAsyncComponent(() => import("@/views/GameTemplate/Airplane.vue")),
    ComponentTesters: defineAsyncComponent(() =>
      import("@/views/GameTemplate/componentTesters.vue")
    ), //for testing only
    BalloonShooting: defineAsyncComponent(() =>
      import("@/views/GameTemplate/BalloonShooting.vue")
    ),
    NumberLock: defineAsyncComponent(() => import("@/views/GameTemplate/NumberLock.vue")),
    LinkToImage: defineAsyncComponent(() =>
      import("@/views/GameTemplate/LinktoImage.vue")
    ),
    WordProblemWithCalculator: defineAsyncComponent(() =>
      import("@/views/GameTemplate/WordProblemWithCalculator.vue")
    ),
    MoneyDrag: defineAsyncComponent(() => import("@/views/GameTemplate/MoneyDrag.vue")),
    MultiplyBoard: defineAsyncComponent(() =>
      import("@/views/GameTemplate/MultiplyBoard.vue")
    ),
    FindFood: defineAsyncComponent(() => import("@/views/GameTemplate/FindFood.vue")),
  },
  data() {
    return {
      Dataloaded: false,
      introvideo: false,
      VideoSrc: "",
      // gameType: "loading",
      download_data: [[]], //下載的資料，格式為二維陣列。
      header: [],
      Subject: "",
      Grade: "",
      Subjects: {
        Math: "數學",
        Chinese: "國語",
        Technology: "多元科技",
      },
      GameConfig: {},
      GameData: {},
      time: 0,
      totaltime: 0,
      finaltime: 0,
      intervalId: null,
      EffectWindow: false,
      EffectSrc: "",
      scratchSheetVisible: false,
      QuestionsSequence: [],
      AllQuestions: [],
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
      isGif: false,
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
      return defineAsyncComponent(() =>
        import(
          `@/views/PrivateTemplate/Grade${this.$route.params.Grade}/${this.$route.params.id}.vue`
        )
      );
    },
    hintInfo() {
      return {
        WrongTimes: this.WrongTimes,
        MaxWrongTimes: this.MaxWrongTimes,
      };
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
        let res = await fetchJson(`./Grade${this.Grade}/${this.gameID}.json`);
        this.GameData = res.data;
        this.gameType = this.GameData.GameType;
        this.GameConfig = this.GameData.GameConfig;
        this.questionCopy = this.GameData.Questions;
        // this.InitIntroVideo();
        this.Dataloaded = true;
        this.randomChoice();
        for (let x in this.GameData.Questions) {
          this.isPassLevel.push(false);
        }
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
      let question = [];
      let temp = [];
      let checkcorrect = true;
      let record = [];
      for (let i in this.GameData.Questions) {
        if (this.GameData.Questions[i].length != undefined) {
          let num = this.GameData.Questions[i].length;
          let rand = Math.floor(Math.random() * (num - 0 + 0));
          question.push(this.GameData.Questions[i][rand]);
          record.push(rand);
        } else {
          checkcorrect = false;
          break;
        }
      }
      this.gameCode = record.toString().replaceAll(",", "-");
      if (checkcorrect) {
        console.log(question);
        this.GameData.Questions = question;
      } else {
        this.gameCode = "origin";
        console.warn(
          "Radom Select Questions via level Fail, this could be the question is not a array (Format Error)"
        );
      }
    },
    reappearCode() {
      if (this.gameCode == "origin") return;
      let reappear = this.gameCode.split("-");
      let question = [];
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
        let download = Arr2CSV.MadeCsvFile(
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
        let download = Arr2CSV.MadeCsvFile(
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
      for (let x in this.GameData.Questions) {
        this.isPassLevel.push(false);
      }
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
      let sound;
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
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          /* IE11 */
          elem.msRequestFullscreen();
        }
      } catch (error) {}
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
    closeSratchSheet() {
      this.scratchSheetVisible = false;
      let modal = document.getElementById("Calculator");
      modal.classList.remove("show");
      modal.style.display = "none";
    },
    resetWrongTimes() {
      this.WrongTimes = 0;
    },
  },
};
</script>
<style scoped lang="scss">
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
  .games {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
</style>
