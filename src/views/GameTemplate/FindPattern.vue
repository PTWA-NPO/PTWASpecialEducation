<template>
  <div ref="container">
    <div class="question">
      <h2>{{ gameData.Question }}</h2>
      <button @click="checkAnswer">提交答案</button>
    </div>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect
          v-if="gameData.AnswerType === 'Drag'"
          :config="configDragBG"
        ></v-rect>
      </v-layer>

      <v-layer v-if="gameData.AnswerType === 'Fill'">
        <v-image
          v-for="(block, index) in configFillings"
          :key="index"
          :config="block"
        />
      </v-layer>

      <v-layer>
        <v-image
          v-for="(block, index) in configBlocks"
          :key="index"
          :config="block"
          @click="handleClick"
          @tap="handleClick"
        />
      </v-layer>

      <v-layer v-if="gameData.AnswerType === 'Drag'" :key="draggableKey">
        <v-image
          v-for="(block, index) in configDraggables"
          :key="index"
          :config="block"
          @dragend="handleDragend"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
export default {
  components: {},

  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],

  data() {
    return {
      configKonva: {},
      configDragBG: {},
      configBlocks: [],
      configDraggables: [],
      configFillings: [],
      draggableKey: 0,
      answers: [],
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      this.tableSize = {
        width: this.gameData.Map[0].length,
        height: this.gameData.Map.length,
      };
      const gameRatio = this.setGameRatio();

      this.drawCanvas(gameRatio);

      switch (this.gameData.AnswerType) {
        case "Drag":
          this.drawDragBG();
          this.drawDragMap();
          this.drawDraggables();
          break;
        case "Fill":
          this.drawFillMap();
          this.drawFillings();
          this.setRotationDividers();
          break;
      }
    },
    setGameRatio() {
      switch (this.gameData.AnswerType) {
        case "Drag":
          return this.tableSize.width / (this.tableSize.height + 1.5);
        case "Fill":
          return this.tableSize.width / this.tableSize.height;
      }
    },
    drawCanvas(gameRatio) {
      if (gameRatio > 2) {
        this.gameWidth = this.$refs.container.clientWidth;
        this.gameHeight = this.gameWidth / gameRatio;
      } else {
        //this.gameHeight = this.$refs.container.clientHeight;
        this.gameHeight = window.innerHeight * 0.7;
        this.gameWidth = this.gameHeight * gameRatio;
      }
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.blockWidth = this.gameWidth / this.tableSize.width;
    },
    drawDragBG() {
      this.configDragBG = {
        x: 0,
        y: this.blockWidth * this.tableSize.height,
        width: this.gameWidth,
        height: this.blockWidth * 1.5,
        fill: "gray",
        stroke: "gray",
        cornerRadius: this.blockWidth * 0.5,
      };
    },
    drawDragMap() {
      this.images = [];
      for (const i in this.gameData.Images) {
        const image = new window.Image();
        image.src = getGameAssets(this.gameId, this.gameData.Images[i]);
        this.images.push(image);
      }

      for (let i = 0; i < this.tableSize.width; ++i) {
        for (let j = 0; j < this.tableSize.height; ++j) {
          const block = {
            x: this.blockWidth * i,
            y: this.blockWidth * j,
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.images[this.gameData.Map[j][i]],
            visible: !this.isBlankSpace(i, j),
            answerIndex: this.isBlankSpace(i, j),
          };
          this.configBlocks.push(block);
          if (!block.visible) this.answers.push(null);
        }
      }
    },
    drawDraggables() {
      for (const i in this.images) {
        const block = {
          x: this.blockWidth * (Number(i) * 1.25 + 0.25),
          y: this.blockWidth * (this.tableSize.height + 0.25),
          height: this.blockWidth,
          width: this.blockWidth,
          image: this.images[i],
          draggable: true,
        };
        this.configDraggables.push(block);
      }
    },
    drawFillMap() {
      this.frameImage = new window.Image();
      this.frameImage.src = getGameAssets(this.gameId, this.gameData.Frame);

      for (let i = 0; i < this.tableSize.width; ++i) {
        for (let j = 0; j < this.tableSize.height; ++j) {
          const block = {
            x: this.blockWidth * i,
            y: this.blockWidth * j,
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.frameImage,
            answerIndex: this.isBlankSpace(i, j),
          };
          this.configBlocks.push(block);
        }
      }
    },
    drawFillings() {
      this.fillingImage = new window.Image();
      this.fillingImage.src = getGameAssets(this.gameId, this.gameData.Fill);
      const offset = {
        x: this.blockWidth * 0.5,
        y: this.blockWidth * 0.5,
      };

      for (let i = 0; i < this.tableSize.width; ++i) {
        for (let j = 0; j < this.tableSize.height; ++j) {
          const rotationIndex = this.gameData.Map[j][i];
          const block = {
            x: this.blockWidth * (i + 0.5),
            y: this.blockWidth * (j + 0.5),
            height: this.blockWidth,
            width: this.blockWidth,
            image: this.fillingImage,
            visible: !this.isBlankSpace(i, j),
            rotation: this.gameData.FillRotation[rotationIndex],
            offset,
          };
          this.configFillings.push(block);
          if (!block.visible) this.answers.push(null);
        }
      }
    },
    setRotationDividers() {
      this.rotationDividers = [];
      const rotations = this.gameData.FillRotation;
      for (const i in rotations) {
        if (Number(i) + 1 === rotations.length) {
          this.rotationDividers.push((rotations[i] + rotations[0] + 360) / 2);
        } else {
          this.rotationDividers.push(
            (rotations[i] + rotations[Number(i) + 1]) / 2
          );
        }
      }
    },
    isBlankSpace(x, y) {
      for (const i in this.gameData.BlankSpace) {
        if (
          this.gameData.BlankSpace[i].x === x &&
          this.gameData.BlankSpace[i].y === y
        )
          return i;
      }
      return null;
    },
    handleDragend(e) {
      const id = e.target.index;
      if (id < this.images.length) {
        for (const block in this.configBlocks) {
          if (
            this.isSlotAvailable(block) &&
            canvasTools.distance(
              e.target.position(),
              this.configBlocks[block]
            ) <
              this.blockWidth * 0.25
          ) {
            this.newDraggable(block, id);
            this.answers[this.configBlocks[block].answerIndex] = id;
          }
        }
        this.snapBack(e);
      } else {
        if (
          canvasTools.distance(e.target.position(), this.configDraggables[id]) <
          this.blockWidth * 0.5
        ) {
          this.snapBack(e);
          console.log(this.answers);
          return;
        }
        for (const block in this.configBlocks) {
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
            console.log(this.answers);
            return;
          }
        }
        this.answers[this.configDraggables[id].answerIndex] = null;
        this.configDraggables.splice(id, 1);
        this.draggableKey++;
      }
      console.log(this.answers);
    },
    handleClick(e) {
      console.log(e.target.attrs.answerIndex);
      if (
        this.gameData.AnswerType === "Drag" ||
        e.target.attrs.answerIndex == null
      )
        return;

      const id = e.target.index,
        rotationIndex = this.getClickRotationIndex(
          this.configFillings[id],
          e.target.getStage().getPointerPosition()
        );

      if (
        this.configFillings[id].visible &&
        this.configFillings[id].rotation ===
          this.gameData.FillRotation[rotationIndex]
      ) {
        this.configFillings[id].visible = false;
        this.answers[this.configBlocks[id].answerIndex] = null;
      } else {
        this.configFillings[id].visible = true;
        this.answers[this.configBlocks[id].answerIndex] = rotationIndex;
      }

      this.configFillings[id].rotation =
        this.gameData.FillRotation[rotationIndex];
    },
    isSlotAvailable(block) {
      if (this.configBlocks[block].answerIndex) {
        if (this.answers[this.configBlocks[block].answerIndex] === null)
          return true;
      } else return false;
    },
    snapBack(e) {
      const id = e.target.index;
      e.target.x(this.configDraggables[id].x);
      e.target.y(this.configDraggables[id].y);
    },
    newDraggable(slot, imageID) {
      const block = {
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
    getClickRotationIndex(block, click) {
      const rotation = (canvasTools.angle(block, click) * 180) / Math.PI;
      for (const i in this.rotationDividers) {
        if (i === 0) {
          if (
            rotation < this.rotationDividers[i] ||
            rotation > this.rotationDividers[this.rotationDividers.length - 1]
          )
            return i;
        } else {
          if (
            rotation > this.rotationDividers[Number(i) - 1] &&
            rotation < this.rotationDividers[i]
          )
            return i;
        }
      }
    },
    checkAnswer() {
      let isCorrect = true;
      const wrongAnswers = [];
      for (const i in this.answers) {
        const blockID = {
          x: this.gameData.BlankSpace[i].x,
          y: this.gameData.BlankSpace[i].y,
        };
        const correctAnswerID = this.gameData.Map[blockID.y][blockID.x];
        if (this.answers[i] !== correctAnswerID) {
          isCorrect = false;
          wrongAnswers.push(i);
        }
      }
      this.emitAnswer(isCorrect);
      if (!isCorrect) this.removeWrongAnswers(wrongAnswers);
    },
    emitAnswer(isCorrect) {
      const correctAnswers = [];
      for (const i in this.gameData.BlankSpace) {
        const blockID = {
          x: this.gameData.BlankSpace[i].x,
          y: this.gameData.BlankSpace[i].y,
        };
        correctAnswers.push(this.gameData.Map[blockID.y][blockID.x]);
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          correctAnswers.toString(),
          this.answers.toString(),
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        if (this.answers.filter((answer) => answer === null).length > 0)
          this.$emit("add-record", [
            correctAnswers.toString(),
            "未填答完成",
            "錯誤",
          ]);
        else
          this.$emit("add-record", [
            correctAnswers.toString(),
            this.answers.toString(),
            "錯誤",
          ]);
      }
    },
    removeWrongAnswers(wrongAnswers) {
      switch (this.gameData.AnswerType) {
        case "Drag":
          for (const i in this.configDraggables) {
            const answerIndex = this.configDraggables[i].answerIndex;
            if (wrongAnswers.includes(answerIndex)) {
              this.answers[answerIndex] = null;
              this.configDraggables.splice(i, 1);
            }
          }
          break;
        case "Fill":
          for (const i in this.configFillings) {
            const answerIndex = this.configBlocks[i].answerIndex;
            if (wrongAnswers.includes(answerIndex)) {
              this.answers[answerIndex] = null;
              this.configFillings[i].visible = false;
            }
          }
          break;
      }
    },
  },
};
</script>

<style scoped lang="css">
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
</style>
