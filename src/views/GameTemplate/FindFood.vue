<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
      </v-layer>
      <v-layer>
        <v-image :config="configTarget" />
        <v-shape v-for="(food, index) in configFood" :key="index" :config="food" />
      </v-layer>
      <v-layer>
        <v-circle :key="ringKey" :config="configRing" @dragend="handleDragEnd"></v-circle>
        <v-text
          v-for="(option, index) in configOptions"
          :key="index"
          :config="option"
          @click="handleButton(index)"
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
  components: {},
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
      configOptions: [],
      ringKey: 0,
      configTarget: {},
      configFood: [],
    };
  },
  mounted() {
    this.initializeScene();
    this.setRingRadius();
    this.drawRing();
    this.drawOptions();
    this.drawTarget();
    this.drawFoodinCorrectRadius();
    this.drawFoodOutside();
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

      let ratio =
        this.GameData.Radius[1 - this.findLargestRadius()] /
        this.GameData.Radius[this.findLargestRadius()];
      this.ringRadius[1 - this.findLargestRadius()] =
        this.ringRadius[this.findLargestRadius()] * ratio;
    },
    findLargestRadius() {
      if (this.GameData.Radius[0] < this.GameData.Radius[1]) {
        return 1;
      } else {
        return 0;
      }
    },
    drawRing() {
      this.configRing.x = (this.gameWidth / 4) * 3;
      this.configRing.y = this.gameHeight / 2 - this.gameWidth / 40;
      this.configRing.radius = this.ringRadius[0];
    },
    drawOptions() {
      this.configOptions = this.GameData.Options.map((option, index) => {
        return {
          x: this.gameWidth / 2 + this.gameWidth / 20 + (this.gameWidth / 4) * index,
          y: (this.gameHeight / 10) * 9,
          text: option,
          fontSize: this.gameWidth / 30,
        };
      });
    },
    handleButton(index) {
      this.configRing.radius = this.ringRadius[index];
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
    snapToTarget() {
      this.configRing.x = this.gameWidth / 4;
      this.configRing.y = this.gameHeight / 2;
      this.ringKey++;
    },
    snapToOrigin() {
      this.configRing.x = (this.gameWidth / 4) * 3;
      this.configRing.y = this.gameHeight / 2 - this.gameWidth / 40;
      this.ringKey++;
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
      this.foodWidth = this.gameHeight / 20;
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
        };
        this.configFood.push(food);
      }
    },
    drawFoodOutside() {
      const foodImage = new window.Image();
      foodImage.src = getGameAssets(this.ID, this.GameData.FoodImage);
      this.foodWidth = this.gameHeight / 20;

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
        let position;
        do {
          position = canvasTools.randomPosition(bound);
          if (
            canvasTools.distance(this.configTarget, position) <=
            this.ringRadius[this.GameData.CorrectRadius]
          )
            continue;
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
  },
};
</script>
