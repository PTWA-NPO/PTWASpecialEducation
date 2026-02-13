<template>
  <div class="level-container">
    <div class="level-3-container">
      <div class="left-section">
        <div class="interactive-area">
          <div ref="konvaContainer" class="konva-container">
            <v-stage :config="configKonva">
              <v-layer>
                <v-image :config="configImage" />
              </v-layer>
              <v-layer>
                <v-rect
                  v-for="(box, index) in configBoxes"
                  :key="index"
                  :config="box"
                  @click="handleBoxClick($event, index)"
                  @touchstart="handleBoxClick($event, index)"
                />
              </v-layer>
              <v-layer>
                <v-text
                  v-for="(answer, index) in userAnswers"
                  :key="'answer-' + index"
                  :config="{
                    x: configBoxes[index].x + configBoxes[index].width * 0.1,
                    y: configBoxes[index].y,
                    text: answer.length > 0 ? answer.join('') : '',
                    fontSize: configBoxes[index].height * 0.8,
                    fontFamily: 'YuanQuan, sans-serif',
                    fill: '#000',
                    align: 'center',
                    verticalAlign: 'middle',
                    listening: false,
                  }"
                />
              </v-layer>
            </v-stage>
          </div>
        </div>
      </div>
      <div class="right-section">
        <Markdown
          :game-id="gameId"
          :component-config="markdownData"
          @reply-answer="handleMarkdownReply"
        />
      </div>
    </div>
    <FloatNumPad
      v-if="isShowNumPad"
      :component-config="floatNumPadLocation"
      @button-clicked="fillToInput"
    />
  </div>
</template>

<script>
import Markdown from "@/components/MarkdownRenderer.vue";
import FloatNumPad from "@/components/FloatNumPad.vue";
import { getGameAssets } from "@/utilitys/get_assets.js";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";

export default {
  name: "MA3132Level3",
  components: {
    Markdown,
    FloatNumPad,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    imageData: {
      type: Object,
      required: true,
    },
    markdownData: {
      type: Object,
      required: true,
    },
    boxes: {
      type: Array,
      required: true,
    },
    submitTick: {
      type: Number,
      default: 0,
    },
  },
  emits: ["play-effect", "next-question"],
  data() {
    return {
      configKonva: {
        width: 0,
        height: 0,
      },
      configImage: {
        x: 0,
        y: 0,
        image: null,
        width: 0,
        height: 0,
      },
      configBoxes: [],
      isShowNumPad: false,
      floatNumPadLocation: {
        top: 0,
        left: 0,
      },
      currentBoxIndex: null,
      userAnswers: [],
      wrongBoxIndices: [],
      markdownAnswer: false,
    };
  },
  watch: {
    submitTick() {
      this.submitAnswer();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeLevel3();
    });
  },
  methods: {
    handleMarkdownReply(answer) {
      this.markdownAnswer = answer;
    },
    initializeLevel3() {
      const container = this.$refs.konvaContainer;
      this.configKonva.width = container.clientWidth;
      this.configKonva.height = container.clientHeight;

      const image = new window.Image();
      image.src = getGameAssets(this.gameId, this.imageData.Src);
      image.onload = () => {
        const scale = Math.min(
          this.configKonva.width / image.width,
          this.configKonva.height / image.height
        );

        this.configImage.image = image;
        this.configImage.width = image.width * scale;
        this.configImage.height = image.height * scale;

        this.configImage.x =
          (this.configKonva.width - this.configImage.width) / 2;
        this.configImage.y =
          (this.configKonva.height - this.configImage.height) / 2;

        this.initializeBoxes(scale);
      };
    },
    initializeBoxes() {
      this.configBoxes = this.boxes.map((box) => ({
        x: this.configImage.x + box.x * this.configImage.width,
        y: this.configImage.y + box.y * this.configImage.height,
        width: box.width * this.configImage.width,
        height: box.height * this.configImage.height,
        stroke: "#000",
        strokeWidth: 2,
        fill: "rgba(255, 255, 255, 0.3)",
        draggable: false,
      }));
      this.userAnswers = new Array(this.boxes.length).fill().map(() => []);
      this.wrongBoxIndices = [];
    },
    handleBoxClick(event, index) {
      const box = this.configBoxes[index];
      const stage = event.target.getStage();
      const stageRect = stage.container().getBoundingClientRect();

      this.currentBoxIndex = index;
      this.isShowNumPad = true;

      this.floatNumPadLocation = {
        top: `${stageRect.top + box.y}px`,
        left: `${stageRect.left + box.x + box.width + 10}px`,
      };
    },
    fillToInput(value) {
      if (value === "關閉") {
        this.isShowNumPad = false;
        return;
      }

      if (this.currentBoxIndex !== null) {
        if (value === "清除") {
          this.userAnswers[this.currentBoxIndex] = [];
        } else {
          this.userAnswers[this.currentBoxIndex].push(value);
        }
      }
    },
    submitAnswer() {
      const correctAnswers = this.gameData.Answer;
      let isCorrect = true;
      const wrongIndices = [];

      for (let i = 0; i < this.userAnswers.length; i++) {
        const userAnswer = this.userAnswers[i].join("");
        const correctAnswer = correctAnswers[i].toString();

        if (userAnswer !== correctAnswer) {
          isCorrect = false;
          wrongIndices.push(i);
        }
      }

      if (isCorrect && this.markdownAnswer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        if (!isCorrect) {
          this.wrongBoxIndices = wrongIndices;
          this.configBoxes = this.configBoxes.map((box, index) => {
            const isWrong = wrongIndices.includes(index);
            return {
              ...box,
              stroke: isWrong ? "#ff3154" : "#000",
              strokeWidth: isWrong ? 4 : 2,
            };
          });
        }
        emitter.emit("checkAnswer");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.level-container {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  width: 100%;
  height: 90%;
  max-height: 90%;
}

.level-3-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: $gap--small;
}

.left-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.interactive-area {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: $padding--small;
}

.konva-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
}
</style>
