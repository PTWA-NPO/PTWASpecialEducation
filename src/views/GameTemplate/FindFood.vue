<template>
  <div ref="container" :key="containerKey">
    <div class="question">
      {{ GameData.Question }}
      <div class="answer">
        <numberIncrementor :ID="ID" :Data="incrementorData" @numberChanged="getAnswer" />
        {{ GameData.Unit }}
        <button @click="checkAnswer">提交答案</button>
      </div>
    </div>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
      </v-layer>
      <v-layer>
        <v-image :config="configTarget" />
        <v-shape v-for="(food, index) in configFood" :key="index" :config="food" />
      </v-layer>
      <v-layer>
        <v-circle :key="ringKey" :config="configRing" @dragend="handleDragEnd" />
        <v-rect
          v-for="(shadow, index) in configShadows"
          :key="index"
          :config="shadow"
          @click="handleButton(index)"
          @tap="handleButton(index)"
        />
        <v-rect
          v-for="(button, index) in configButtons"
          :key="index"
          :config="button"
          @click="handleButton(index)"
          @tap="handleButton(index)"
        />
        <v-text
          v-for="(option, index) in configOptions"
          :key="index"
          :config="option"
          @click="handleButton(index)"
          @tap="handleButton(index)"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {
    numberIncrementor: defineAsyncComponent(() =>
      import("@/components/NumberIncrementor.vue")
    ),
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
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      incrementorData: {
        digitCount: 2,
      },
      configKonva: {},
      configBG: {
        x: 0,
        y: 0,
        fill: "#D09F57",
        stroke: "#D09F57",
      },
      configRing: {
        stroke: "black",
        strokeWidth: 5,
        draggable: true,
      },
      ringRadius: [],
      configButtons: [],
      configShadows: [],
      configOptions: [],
      ringKey: 0,
      configTarget: {},
      configFood: [],
      answer: 0,
      containerKey: 0,
    };
  },
  mounted() {
    this.initializeScene();
    this.setRingRadius();
    this.drawOnCanvas();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.gameHeight = this.gameWidth / 2;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameHeight;
      this.configBG.width = this.gameWidth / 2;
      this.configBG.height = this.gameHeight;
    },
    setRingRadius() {
      this.ringRadius[this.findLargestRadius()] = this.gameWidth / 5;

      this.smallToLargeRatio =
        this.GameData.Radius[1 - this.findLargestRadius()] /
        this.GameData.Radius[this.findLargestRadius()];
      this.ringRadius[1 - this.findLargestRadius()] =
        this.ringRadius[this.findLargestRadius()] * this.smallToLargeRatio;
    },
    findLargestRadius() {
      if (this.GameData.Radius[0] < this.GameData.Radius[1]) {
        return 1;
      } else {
        return 0;
      }
    },
    drawOnCanvas() {
      this.drawRing();
      this.drawButtons();
      this.drawShadows();
      this.drawOptions();
      this.drawTarget();
      this.drawFoodinCorrectRadius();
      this.drawFoodOutside();
    },
    drawRing() {
      this.configRing.x = (this.gameWidth / 4) * 3;
      this.configRing.y = this.gameHeight / 2 - this.gameWidth / 25;
      this.configRing.radius = this.ringRadius[0];
    },
    snapToTarget() {
      this.configRing.x = this.gameWidth / 4;
      this.configRing.y = this.gameHeight / 2;
      this.ringKey++;
    },
    snapToOrigin() {
      this.configRing.x = (this.gameWidth / 4) * 3;
      this.configRing.y = this.gameHeight / 2 - this.gameWidth / 25;
      this.ringKey++;
    },
    drawButtons() {
      this.buttonPos = this.GameData.Options.map((option, index) => {
        return {
          x:
            this.gameWidth / 2 +
            this.gameWidth / 30 +
            (this.gameWidth / 4 - this.gameWidth / 60) * index,
          y: (this.gameHeight / 10) * 9 - this.gameWidth / 40,
        };
      });
      this.configButtons = this.GameData.Options.map((option, index) => {
        return {
          x: this.buttonPos[index].x,
          y: this.buttonPos[index].y,
          fill: "#d9d9d9",
          width: this.gameWidth / 4 - (this.gameWidth / 30 / 2) * 3,
          height: this.gameHeight / 15 + this.gameWidth / 35,
          cornerRadius: this.gameWidth / 40,
        };
      });
      this.configButtons[0].y += this.gameHeight / 60;
    },
    drawShadows() {
      this.configShadows = this.GameData.Options.map((option, index) => {
        return {
          x: this.buttonPos[index].x,
          y: this.buttonPos[index].y + this.gameHeight / 60,
          fill: "#a8a8a8",
          width: this.gameWidth / 4 - (this.gameWidth / 30 / 2) * 3,
          height: this.gameHeight / 15 + this.gameWidth / 35,
          cornerRadius: this.gameWidth / 40,
        };
      });
    },
    drawOptions() {
      this.configOptions = this.GameData.Options.map((option, index) => {
        return {
          x: this.buttonPos[index].x + this.gameWidth / 60,
          y: this.buttonPos[index].y + this.gameWidth / 60,
          text: option,
          fontSize: this.gameHeight / 15,
        };
      });
      this.configOptions[0].y += this.gameHeight / 60;
    },
    handleButton(index) {
      this.configRing.radius = this.ringRadius[index];
      this.configButtons[index].y = this.buttonPos[index].y + this.gameHeight / 60;
      this.configOptions[index].y =
        this.buttonPos[index].y + this.gameWidth / 60 + this.gameHeight / 60;
      this.configButtons[1 - index].y = this.buttonPos[index].y;
      this.configOptions[1 - index].y = this.buttonPos[index].y + this.gameWidth / 60;
      this.snapToOrigin();
      this.ringKey++;
    },
    handleDragEnd(e) {
      let target = {
        x: this.gameWidth / 4,
        y: this.gameHeight / 2,
      };
      if (canvasTools.distance(e.target.position(), target) <= this.gameWidth / 20) {
        this.snapToTarget();
      } else {
        this.snapToOrigin();
      }
    },
    drawTarget() {
      const targetImage = new window.Image();
      targetImage.src = getGameAssets(this.ID, this.GameData.TargetImage);
      this.configTarget.image = targetImage;
      this.configTarget.x = this.gameWidth / 4;
      this.configTarget.y = this.gameHeight / 2;
      this.configTarget.width = this.gameHeight / 10;
      this.configTarget.height = this.gameHeight / 10;

      this.configTarget.x = canvasTools.corner(this.configTarget).x;
      this.configTarget.y = canvasTools.corner(this.configTarget).y;
    },
    drawFoodinCorrectRadius() {
      const foodImage = new window.Image();
      foodImage.src = getGameAssets(this.ID, this.GameData.FoodImage);
      if (this.GameData.CorrectRadius == this.findLargestRadius())
        this.foodWidth = this.gameHeight / 15;
      else this.foodWidth = this.gameHeight / 20;
      for (let i = 0; i < this.GameData.Answer; i++) {
        let position;
        do {
          position = canvasTools.randomPositionInCircle(
            canvasTools.center(this.configTarget),
            this.ringRadius[this.GameData.CorrectRadius]
          );
        } while (this.isOverlapped(position));

        let food = {
          image: foodImage,
          x: position.x,
          y: position.y,
          width: this.foodWidth,
          height: this.foodWidth,
          rotation: Math.random() * 360,
          sceneFunc: this.foodSceneFunc,
          draggable: true,
          visible: true,
        };
        this.configFood.push(food);
      }
    },
    drawFoodOutside() {
      const foodImage = new window.Image();
      foodImage.src = getGameAssets(this.ID, this.GameData.FoodImage);

      let correctArea =
        Math.pow(this.ringRadius[this.GameData.CorrectRadius], 2) * Math.PI;
      let outsideArea = Math.pow(this.gameHeight, 2) - correctArea;
      let foodCount = Math.floor((this.GameData.Answer / correctArea) * outsideArea);

      let bound = {
        up: 0,
        down: this.gameHeight,
        left: 0,
        right: this.gameHeight,
      };
      for (let i = 0; i < foodCount; i++) {
        let position, inCorrectArea;
        do {
          position = canvasTools.randomPosition(bound);

          inCorrectArea = false;
          if (
            canvasTools.distance(canvasTools.center(this.configTarget), position) <=
            this.ringRadius[this.GameData.CorrectRadius]
          ) {
            inCorrectArea = true;
          }
        } while (this.isOverlapped(position) || inCorrectArea);

        let food = {
          image: foodImage,
          x: position.x,
          y: position.y,
          width: this.foodWidth,
          height: this.foodWidth,
          rotation: Math.random() * 360,
          sceneFunc: this.foodSceneFunc,
          draggable: true,
        };
        this.configFood.push(food);
      }
    },
    foodSceneFunc(context, shape) {
      context.beginPath();
      context.rotate(shape.getAttr("rotation") * (Math.PI / 180));
      context.drawImage(
        shape.getAttr("image"),
        -shape.getAttr("width") / 2,
        -shape.getAttr("height") / 2,
        shape.getAttr("width"),
        shape.getAttr("height")
      );
    },
    isOverlapped(food) {
      for (let i = 0; i < this.configFood.length; i++) {
        if (canvasTools.distance(food, this.configFood[i]) < this.foodWidth) return true;
      }
      if (
        canvasTools.distance(food, canvasTools.center(this.configTarget)) <
        this.configTarget.width
      ) {
        return true;
      }

      for (let i = 0; i < this.configOptions.length; i++) {
        if (
          canvasTools.distance(food, canvasTools.center(this.configTarget)) <
            this.ringRadius[i] + this.foodWidth &&
          canvasTools.distance(food, canvasTools.center(this.configTarget)) >
            this.ringRadius[i] - this.foodWidth
        ) {
          return true;
        }
      }
      return false;
    },
    getAnswer(num) {
      this.answer = num;
    },
    checkAnswer() {
      if (this.answer == this.GameData.Answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.GameData.Answer, this.answer, "正確"]);
        requestAnimationFrame(this.gatheringAnimation);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.GameData.Answer, this.answer, "錯誤"]);
        this.containerKey++;
      }
    },
    gatheringAnimation() {
      let allGathered = true;
      for (let i = 0; i < this.GameData.Answer; i++) {
        if (this.configFood[i].visible) {
          allGathered = false;
          let unitVector = canvasTools.unitVector(
            this.configFood[i],
            canvasTools.center(this.configTarget)
          );
          if (this.GameData.CorrectRadius == this.findLargestRadius()) {
            this.configFood[i].x += unitVector.x * 2;
            this.configFood[i].y += unitVector.y * 2;
          } else {
            this.configFood[i].x += unitVector.x;
            this.configFood[i].y += unitVector.y;
          }
          if (
            canvasTools.distance(
              canvasTools.center(this.configTarget),
              this.configFood[i]
            ) <
            this.configTarget.width / 2
          ) {
            this.configFood[i].visible = false;
          }
        }
      }
      if (allGathered) {
        this.$emit("next-question");
      } else {
        requestAnimationFrame(this.gatheringAnimation);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.question {
  font-size: 2rem;
  align-items: center;
  width: 80%;
}
.answer {
  display: flex;
  align-items: center;
  margin-left: auto;
  width: fit-content;
}
button {
  margin-left: 3vw;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  &:hover {
    background-color: darken(lightgray, 10%);
  }
}
</style>
