<template>
  <div class="game-container">
    <div class="gameAndQuestion">
      <p class="question">
        {{ GameData.Text }}
      </p>
      <p class="game__remaining">剩餘題數：{{ remainingQuestions }}</p>
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{ width: progressBarWidth }"
          aria-valuenow="progressPercentage"
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      <div class="game">
        <v-stage
          ref="stage"
          :config="stageSize"
          @click="handleMouseClick"
          @touchstart="handleMouseClick"
        >
          <v-layer ref="layer">
            <v-image :config="imageConfig" />
            <v-circle
              v-for="(circle, index) in circles"
              :key="index"
              :config="circle"
            />
          </v-layer>
        </v-stage>
        <div class="game__controls">
          <div class="game__actions">
            <button class="game__sound-btn" @click="playNumberSound">
              <img :src="speakerIcon" alt="Speaker Icon" />
            </button>
            <button class="button-pre" @click="previousQuestion">上一題</button>
            <button class="button-nxt" @click="nextQuestion">下一題</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getGameAssets,
  getSystemAssets,
  getGameStaticAssets,
} from "@/utilitys/get_assets.js";
import { soundManager } from "@/utilitys/sound-manager.js";
export default {
  name: "NumberSearchGame",
  props: {
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      questionNum: 0,
      rightAnswerCount: 0,
      correctlyAnsweredQuestions: [],
      randomQuestionOrder: [],
      stageSize: {
        width: 800,
        height: 600,
      },
      imageConfig: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        image: null,
      },
      circles: [],
      clickFirst: false,
      value: [],
      speakerIcon: getGameStaticAssets("NumberSearchGame", "speaker-icon.png"),
    };
  },
  computed: {
    progressPercentage() {
      const percentageFactor = 100;
      return (this.rightAnswerCount / this.GameData.ObjNum) * percentageFactor;
    },
    progressBarWidth() {
      return `${this.progressPercentage}%`;
    },
    remainingQuestions() {
      return this.GameData.ObjNum - this.rightAnswerCount;
    },
  },
  created() {
    const image = new window.Image();
    image.src = getGameAssets(this.ID, this.GameData.img);
    image.onload = () => {
      const aspectRatio = image.width / image.height;
      if (this.stageSize.width / this.stageSize.height > aspectRatio) {
        this.imageConfig.height = this.stageSize.height;
        this.imageConfig.width = this.stageSize.height * aspectRatio;
      } else {
        this.imageConfig.width = this.stageSize.width;
        this.imageConfig.height = this.stageSize.width / aspectRatio;
      }
      this.imageConfig.image = image;
    };

    this.randomQuestionOrder = this.generateRandomOrder(this.GameData.ObjNum);

    for (let i = 0; i < 11; i++) {
      const numberSound = getSystemAssets(`${i}.mp3`, "read-numbers");
      soundManager.registerSound(`${i}`, numberSound);
    }
    this.playNumberSound();
    this.value[0] = [];
  },
  methods: {
    playNumberSound() {
      const number = this.randomQuestionOrder[this.questionNum];
      soundManager.scheduleSoundPlayback(`${number}`);
    },
    handleMouseClick() {
      const mousePos = this.$refs.stage.getNode().getPointerPosition();
      const questionNum = this.randomQuestionOrder[this.questionNum];
      if (this.checkAnswer(questionNum, mousePos.x, mousePos.y)) {
        this.addCircle(questionNum);
        this.handleCorrectAnswer(questionNum);
        this.nextQuestion();
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          questionNum,
          this.getWrongAnswer(mousePos.x, mousePos.y),
          "錯誤",
        ]);
      }
    },
    generateRandomOrder(total) {
      const order = [];
      while (order.length < total) {
        let randomIndex = Math.floor(Math.random() * total);
        if (!order.includes(randomIndex)) {
          order.push(randomIndex);
        }
      }
      return order;
    },
    checkAnswer(questionNum, posX, posY) {
      const obj = this.GameData.Objs[questionNum];
      const tolerance = this.GameData.tolerance;
      return (
        posX >= obj.xRange[0] - tolerance &&
        posX <= obj.xRange[1] + tolerance &&
        posY >= obj.yRange[0] - tolerance &&
        posY <= obj.yRange[1] + tolerance
      );
    },
    handleCorrectAnswer(questionNum) {
      this.rightAnswerCount++;
      this.correctlyAnsweredQuestions[this.questionNum] = 1;
      this.$emit("play-effect", "CorrectSound");
      this.$emit("add-record", [questionNum, questionNum, "正確"]);
    },
    addCircle(questionNum) {
      const obj = this.GameData.Objs[questionNum];
      const radius =
        Math.sqrt(
          (obj.xRange[1] - obj.xRange[0]) ** 2 +
            (obj.yRange[1] - obj.yRange[0]) ** 2
        ) / 2;

      this.circles.push({
        x: (obj.xRange[0] + obj.xRange[1]) / 2,
        y: (obj.yRange[0] + obj.yRange[1]) / 2,
        radius: radius,
        stroke: "red",
        strokeWidth: 2,
      });
    },
    getWrongAnswer(x, y) {
      const tolerance = this.GameData.tolerance;
      for (var i = 0; i < this.GameData.ObjNum; ++i) {
        if (
          x >= this.GameData.Objs[i].xRange[0] - tolerance &&
          x <= this.GameData.Objs[i].xRange[1] + tolerance &&
          y >= this.GameData.Objs[i].yRange[0] - tolerance &&
          y <= this.GameData.Objs[i].yRange[1] + tolerance
        )
          return this.GameData.Objs[i].Name;
      }
      return "空白處";
    },
    nextQuestion() {
      const delayTime = 500;
      this.questionNum++;
      if (this.gameOver()) {
        setTimeout(() => {
          this.$emit("next-question", true);
        }, delayTime);
      } else {
        this.skipAnsweredQuestions();
        this.playNumberSound();
      }
    },
    previousQuestion() {
      this.questionNum--;
      if (this.questionNum < 0) {
        this.questionNum = this.GameData.ObjNum - 1;
      }
      this.playNumberSound();
    },
    skipAnsweredQuestions() {
      const totalQuestions = this.GameData.ObjNum;
      if (
        this.correctlyAnsweredQuestions[this.questionNum] ||
        this.questionNum >= totalQuestions
      ) {
        for (let i = 0; i < totalQuestions; i++) {
          if (!this.correctlyAnsweredQuestions[i]) {
            this.questionNum = i;
          }
        }
      }
    },
    gameOver() {
      return this.rightAnswerCount >= this.GameData.ObjNum;
    },
  },
};
</script>

<style scoped lang="scss">
.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.game {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5rem;
}

.game__controls {
  display: flex;
  flex-direction: column;
  // margin-top: 1rem;
  align-items: flex-start;
  gap: 0.5rem;
}

.question {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  text-align: center;
  border: black 2px solid;
  border-radius: 15px;
  padding: 0.2rem;
}

.game__actions {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}

.game__sound {
  width: 50%;
}

.game__sound-btn {
  width: 100%;
  height: 100%;

  img {
    width: 4rem;
    height: auto;
  }
}

.game__navigation {
  display: flex;
  flex-direction: column;
}

.game__actions button {
  transition: background-color 0.2s;
}

.game button:active {
  background-color: #606c38;
}

.game__remaining {
  font-size: 1.3rem;
  margin: 0;
}

.progress {
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.game button {
  font-size: 1.7rem;
  border: 2px solid #606c38;
  background-color: transparent;
  border-radius: 10px;
  font-weight: bold;
  padding: 0;
}

.progress-bar {
  height: 20px;
  background-color: #4caf50;
  transition: width 0.5s ease;
}
</style>
