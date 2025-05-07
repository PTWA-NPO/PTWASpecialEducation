<template>
  <div class="game-container">
    <template v-if="gameLevel === 1">
      <div class="level-container">
        <ImageContainer :ID="ID" :Data="imageData" class="image-container" />
        <div class="question-container">
          <div class="questions-flex">
            <div
              v-for="(question, qIndex) in currentQuestions"
              :key="qIndex"
              class="question"
            >
              <div
                v-for="(part, index) in splitQuestion(question.text)"
                :key="index"
                class="part-container"
              >
                <p v-if="!isPlaceHolder(part)">{{ part }}</p>
                <div
                  v-for="(option, optionIndex) in question.options"
                  v-else
                  :key="optionIndex"
                  class="option"
                  :class="{ selected: selectedAnswers[qIndex] === optionIndex }"
                  @click="selectAnswer(qIndex, optionIndex)"
                >
                  {{ option }}
                </div>
              </div>
            </div>
          </div>
          <Markdown
            :ID="ID"
            :Data="markdownData"
            @replyAnswer="handleMarkdownReply"
          />
        </div>
      </div>
    </template>
    <template v-if="gameLevel === 2">
      <div class="level-container">
        <div class="level-2-question">
          <h2>{{ GameData.Question }}</h2>
        </div>
        <div ref="container" class="v-stage-container">
          <v-stage :config="configKonva">
            <v-layer>
              <v-rect :config="configDragBG"></v-rect>
            </v-layer>

            <v-layer>
              <v-text
                v-for="(label, index) in rowLabels"
                :key="'label-' + index"
                :config="label"
              />
            </v-layer>

            <v-layer>
              <v-image
                v-for="(block, index) in configBlocks"
                :key="index"
                :config="block"
              />
            </v-layer>

            <v-layer :key="draggableKey">
              <v-image
                v-for="(block, index) in configDraggables"
                :key="index"
                :config="block"
                @dragend="handleDragend"
              />
            </v-layer>
          </v-stage>
        </div>
      </div>
    </template>
    <template v-if="gameLevel === 3">
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
                    />
                  </v-layer>
                  <v-layer>
                    <v-text
                      v-for="(answer, index) in userAnswers"
                      :key="'answer-' + index"
                      :config="{
                        x:
                          configBoxes[index].x + configBoxes[index].width * 0.1,
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
              :ID="ID"
              :Data="markdownData"
              @replyAnswer="handleMarkdownReply"
            />
          </div>
        </div>
      </div>
      <FloatNumPad
        v-if="isShowNumPad"
        :Data="floatNumPadLocation"
        @buttonClicked="fillToInput"
      />
    </template>
    <div class="button-container">
      <button class="submit-btn" @click="submitAnswer">送出答案</button>
    </div>
  </div>
</template>

<script>
import ImageContainer from "@/components/ImageContainer.vue";
import Markdown from "@/components/Markdown.vue";
import FloatNumPad from "@/components/FloatNumPad.vue";
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";

export default {
  name: "MA3132",
  components: {
    ImageContainer,
    Markdown,
    FloatNumPad,
  },
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
  emits: ["play-effect", "next-question"],
  data() {
    return {
      imageData: this.GameData.imageData,
      markdownData: this.GameData.markdownData,
      questions: this.GameData.Questions,
      currentQuestionIndex: 0,
      selectedAnswers: [null, null],
      markdownAnswer: false,
      gameLevel: this.GameData.GameLevel,
      configKonva: {
        width: 0,
        height: 0,
      },
      configDragBG: {},
      configBlocks: [],
      rowLabels: [],
      configDraggables: [],
      draggableKey: 0,
      answers: [],
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
      boxes: this.GameData.Boxes,
    };
  },
  computed: {
    currentQuestions() {
      return [
        this.questions[this.currentQuestionIndex],
        this.questions[this.currentQuestionIndex + 1],
      ].filter((q) => q);
    },
  },
  mounted() {
    if (this.gameLevel === 2) {
      this.$nextTick(() => {
        this.initializeScene();
      });
    } else if (this.gameLevel === 3) {
      this.$nextTick(() => {
        this.initializeLevel3();
      });
    }
  },
  methods: {
    handleMarkdownReply(answer) {
      this.markdownAnswer = answer;
    },
    splitQuestion(question) {
      return question.split(/(\$question\$)/g);
    },
    isPlaceHolder(part) {
      return part === "$question$";
    },
    selectAnswer(qIndex, optionIndex) {
      this.selectedAnswers[qIndex] = optionIndex;
    },
    submitAnswer() {
      if (this.gameLevel === 1) {
        let allCorrect = true;
        this.currentQuestions.forEach((question, index) => {
          if (this.selectedAnswers[index] !== question.correctAnswer) {
            allCorrect = false;
          }
        });

        if (allCorrect && this.markdownAnswer) {
          console.log("全部答對了！");
          this.$emit("play-effect", "CorrectSound");
          this.$emit("next-question");
        } else {
          console.log("有答錯的題目！");
          this.$emit("play-effect", "WrongSound");
          emitter.emit("checkAnswer");
        }
      } else if (this.gameLevel === 2) {
        this.checkAnswer();
      } else if (this.gameLevel === 3) {
        // 檢查第三關的答案
        const correctAnswers = this.GameData.Answer;
        let isCorrect = true;
        let wrongIndices = [];

        // 將每個框的答案數組轉換為字符串進行比較
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
            // 更新錯誤框的索引
            this.wrongBoxIndices = wrongIndices;
            // 更新所有框的顏色
            this.configBoxes = this.configBoxes.map((box, index) => {
              const isWrong = wrongIndices.includes(index);
              return {
                ...box,
                stroke: isWrong ? "#ff0000" : "#000",
                strokeWidth: isWrong ? 3 : 2,
              };
            });
            // 強制更新 Konva 層
            this.draggableKey++;
          }
          emitter.emit("checkAnswer");
        }
      }
    },
    initializeScene() {
      this.tableSize = {
        width: this.GameData.Map[0].length,
        height: this.GameData.Map.length,
      };
      this.drawCanvas();

      switch (this.GameData.AnswerType) {
        case "Drag":
          this.drawDragBG();
          this.drawDragMap();
          this.drawDraggables();
          break;
      }
    },
    drawCanvas() {
      const container = this.$refs.container;
      this.gameWidth = container.clientWidth;
      this.gameHeight = container.clientHeight;

      // 根據寬度和高度計算合適的區塊大小
      const blockWidthByWidth = this.gameWidth / (this.tableSize.width + 2); // 加2是為了行號的空間
      const blockWidthByHeight = this.gameHeight / (this.tableSize.height + 1); // 加1是為了可拖曳區塊的空間

      // 選擇較小的值作為區塊大小
      this.blockWidth = Math.min(blockWidthByWidth, blockWidthByHeight);

      // 更新畫布大小
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
    },
    drawDragBG() {
      this.configDragBG = {
        x: 0,
        y: this.blockWidth * this.tableSize.height,
        width: this.gameWidth,
        height: this.blockWidth,
        fill: "gray",
        stroke: "gray",
        cornerRadius: this.blockWidth * 0.2,
      };
    },
    drawDragMap() {
      this.images = [];
      for (let i in this.GameData.Images) {
        let image = new window.Image();
        image.src = getGameAssets(this.ID, this.GameData.Images[i]);
        this.images.push(image);
      }

      // 添加行號標示
      this.rowLabels = []; // 清空之前的標籤
      for (let j = 0; j < this.tableSize.height; ++j) {
        let rowLabel = {
          x: 0,
          y: this.blockWidth * j + this.blockWidth * 0.25,
          text: `第${j + 1}行`,
          fontSize: this.blockWidth * 0.4,
          fontFamily: "YuanQuan, sans-serif",
        };
        this.rowLabels.push(rowLabel);
      }

      for (let i = 0; i < this.tableSize.width; ++i) {
        for (let j = 0; j < this.tableSize.height; ++j) {
          let block = {
            x: this.blockWidth * i + this.blockWidth * 1.5, // 為行號預留空間
            y: this.blockWidth * j,
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.images[this.GameData.Map[j][i]],
            visible: !this.isBlankSpace(i, j),
            answerIndex: this.isBlankSpace(i, j),
          };
          this.configBlocks.push(block);
          if (!block.visible) this.answers.push(null);
        }
      }
    },
    drawDraggables() {
      // 顯示所有需要填入的圖片
      let usedImages = new Set();
      for (let i in this.GameData.BlankSpace) {
        let correctImageIndex =
          this.GameData.Map[this.GameData.BlankSpace[i].y][
            this.GameData.BlankSpace[i].x
          ];
        if (!usedImages.has(correctImageIndex)) {
          let block = {
            x: this.blockWidth * (usedImages.size * 1.25 + 0.25),
            y: this.blockWidth * this.tableSize.height,
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.images[correctImageIndex],
            imageIndex: correctImageIndex, // 添加圖片索引
            draggable: true,
          };
          this.configDraggables.push(block);
          usedImages.add(correctImageIndex);
        }
      }
    },
    isBlankSpace(x, y) {
      for (let i in this.GameData.BlankSpace) {
        if (
          this.GameData.BlankSpace[i].x == x &&
          this.GameData.BlankSpace[i].y == y
        )
          return i;
      }
      return null;
    },
    handleDragend(e) {
      let id = e.target.index;
      if (id < this.images.length) {
        for (let block in this.configBlocks) {
          if (
            this.isSlotAvailable(block) &&
            canvasTools.distance(
              e.target.position(),
              this.configBlocks[block]
            ) <
              this.blockWidth * 0.25
          ) {
            this.newDraggable(block, this.configDraggables[id].imageIndex);
            this.answers[this.configBlocks[block].answerIndex] =
              this.configDraggables[id].imageIndex;
          }
        }
        this.snapBack(e);
      } else {
        if (
          canvasTools.distance(e.target.position(), this.configDraggables[id]) <
          this.blockWidth * 0.5
        ) {
          this.snapBack(e);
          return;
        }
        for (let block in this.configBlocks) {
          if (
            this.isSlotAvailable(block) &&
            canvasTools.distance(
              e.target.position(),
              this.configBlocks[block]
            ) <
              this.blockWidth * 0.25
          ) {
            this.answers[this.configBlocks[block].answerIndex] =
              this.answers[this.configDraggables[id].answerIndex];
            this.answers[this.configDraggables[id].answerIndex] = null;

            this.configDraggables[id].x = this.configBlocks[block].x;
            this.configDraggables[id].y = this.configBlocks[block].y;
            this.configDraggables[id].answerIndex =
              this.configBlocks[block].answerIndex;
            this.snapBack(e);
            return;
          }
        }
        this.answers[this.configDraggables[id].answerIndex] = null;
        this.configDraggables.splice(id, 1);
        this.draggableKey++;
      }
    },
    isSlotAvailable(block) {
      if (this.configBlocks[block].answerIndex) {
        if (this.answers[this.configBlocks[block].answerIndex] == null)
          return true;
      } else return false;
    },
    snapBack(e) {
      let id = e.target.index;
      e.target.x(this.configDraggables[id].x);
      e.target.y(this.configDraggables[id].y);
    },
    newDraggable(slot, imageID) {
      let block = {
        x: this.configBlocks[slot].x,
        y: this.configBlocks[slot].y,
        height: this.blockWidth,
        width: this.blockWidth,
        image: this.images[imageID],
        draggable: true,
        answerIndex: this.configBlocks[slot].answerIndex,
      };
      this.configDraggables.push(block);
    },
    checkAnswer() {
      let isCorrect = true,
        wrongAnswers = [];
      for (let i in this.answers) {
        let blockID = {
          x: this.GameData.BlankSpace[i].x,
          y: this.GameData.BlankSpace[i].y,
        };
        let correctAnswerID = this.GameData.Map[blockID.y][blockID.x];
        if (this.answers[i] != correctAnswerID) {
          isCorrect = false;
          wrongAnswers.push(i);
        }
      }
      this.emitAnswer(isCorrect);
      if (!isCorrect) this.removeWrongAnswers(wrongAnswers);
    },
    emitAnswer(isCorrect) {
      let correctAnswers = [];
      for (let i in this.GameData.BlankSpace) {
        let blockID = {
          x: this.GameData.BlankSpace[i].x,
          y: this.GameData.BlankSpace[i].y,
        };
        correctAnswers.push(this.GameData.Map[blockID.y][blockID.x]);
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
    removeWrongAnswers(wrongAnswers) {
      for (let i in this.configDraggables) {
        let answerIndex = this.configDraggables[i].answerIndex;
        if (wrongAnswers.includes(answerIndex)) {
          this.answers[answerIndex] = null;
          this.configDraggables.splice(i, 1);
        }
      }
    },
    initializeLevel3() {
      const container = this.$refs.konvaContainer;
      this.configKonva.width = container.clientWidth;
      this.configKonva.height = container.clientHeight;

      // 載入圖片
      const image = new window.Image();
      image.src = getGameAssets(this.ID, this.imageData.Src);
      image.onload = () => {
        // 計算圖片的縮放比例
        const scale = Math.min(
          this.configKonva.width / image.width,
          this.configKonva.height / image.height
        );

        this.configImage.image = image;
        this.configImage.width = image.width * scale;
        this.configImage.height = image.height * scale;

        // 計算圖片在畫布中的位置（置中）
        this.configImage.x =
          (this.configKonva.width - this.configImage.width) / 2;
        this.configImage.y =
          (this.configKonva.height - this.configImage.height) / 2;

        // 初始化框的位置
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
  },
};
</script>

<style scoped lang="scss">
.game-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.level-container {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  width: 100%;
  height: 90%;
  max-height: 90%;
}

.v-stage-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  height: 200px;
}

.question-container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: $padding--small;
  gap: $gap--small;
}

.questions-flex {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.question {
  font-size: 1.2em;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $gap--small;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.part-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $gap--small;
  white-space: nowrap;
}

.part-container p {
  margin: 0;
  display: inline;
}

.option {
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
  text-align: center;
  display: inline-block;
  margin: 0;
}

.option:hover {
  background-color: #e9e9e9;
}

.option.selected {
  border-color: $hyperlink-color;
  background-color: $success-color;
}

.submit-btn {
  background-color: $submit-color;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;
}

.question {
  display: flex;
  align-items: center;
  width: 100%;
}

button {
  margin-left: auto;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  border-radius: 1rem;
  &:hover {
    background-color: darken(lightgray, 10%);
  }
  font-size: 2rem;
}

.level-2-question {
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  width: 100%;
  height: 10%;
  h2 {
    margin: 0;
  }
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

.image-area {
  width: 100%;
  height: 200px;
}

.interactive-area {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: $padding--small;
}

.level-3-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.konva-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
}
</style>
