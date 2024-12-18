<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage :config="configKonva">
      <v-layer>
        <v-image :config="configBG_1" />
        <v-image :config="configBG_2" />
      </v-layer>

      <v-layer>
        <v-circle
          v-for="(target, index) in configTarget"
          :key="index"
          :config="target"
        />
        <v-text
          v-for="(option, index) in configOptions"
          :key="index"
          :config="option"
        />
      </v-layer>

      <v-layer>
        <v-rect :config="configPlane" @dragmove="keepInBound" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameStaticAssets } from "@/utilitys/get_assets.js";
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

      configPlane: {
        fill: "gray",
        stroke: "gray",
        draggable: true,
        rotation: 0,
      },

      configBG_1: {
        x: 0,
        y: 0,
      },
      configBG_2: {},

      configTarget: [],
      configOptions: [],
      targetTemplate: ["pink", "lightblue", "yellow"],

      speed: 2,

      allOptions: [],
      trueOptions: [],
    };
  },

  mounted() {
    this.initializeScene();
    this.initializeOptions();
    this.targetSpawner();
    this.game = window.setInterval(this.update, 20);
    this.spawner = window.setInterval(this.targetSpawner, 3000);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 2;
      this.drawBackground();
      this.configPlane.height = this.gameWidth * 0.1;
      this.configPlane.width = this.configPlane.height;
      let planePosition = {
        x: this.gameWidth * 0.1,
        y: this.gameWidth * 0.25,
        width: this.configPlane.width,
        height: this.configPlane.height,
      };
      this.configPlane.x = canvasTools.corner(planePosition).x;
      this.configPlane.y = canvasTools.corner(planePosition).y;
    },
    drawBackground() {
      const backgroundImage = new window.Image();
      backgroundImage.src = getGameStaticAssets("Airplane", "sky.jpg");
      this.configBG_1.image = backgroundImage;
      this.configBG_2.image = backgroundImage;
      this.configBG_1.width = this.gameWidth;
      this.configBG_1.height = this.gameWidth / 2;
      this.configBG_2.width = this.gameWidth;
      this.configBG_2.height = this.gameWidth / 2;
      this.configBG_2.x = this.gameWidth;
    },
    initializeOptions() {
      this.allOptions = this.GameData.True.concat(this.GameData.False);
      this.trueOptions = this.GameData.True;
    },
    update() {
      this.backgroundScroll();
      this.moveTarget();
      this.planeAnimation();
      this.collisionDetect();
    },
    backgroundScroll() {
      this.configBG_1.x -= this.speed;
      this.configBG_2.x -= this.speed;
      if (this.configBG_1.x <= -this.gameWidth)
        this.configBG_1.x = this.gameWidth;
      if (this.configBG_2.x <= -this.gameWidth)
        this.configBG_2.x = this.gameWidth;
    },
    keepInBound(e) {
      e.target.x(Math.max(e.target.x(), 0));
      e.target.x(
        Math.min(e.target.x(), this.gameWidth - this.configPlane.width)
      );
      e.target.y(Math.max(e.target.y(), 0));
      e.target.y(
        Math.min(e.target.y(), this.gameWidth * 0.5 - this.configPlane.height)
      );
      this.configPlane.x = e.target.x();
      this.configPlane.y = e.target.y();
    },

    targetSpawner() {
      let targetType = Math.floor(Math.random() * this.targetTemplate.length);
      let target = {};
      target.radius = this.gameWidth * 0.05;
      let yRange = {
        min: target.radius,
        max: this.gameWidth * 0.5 - target.radius,
      };
      target.x = this.gameWidth * 1.1;
      target.y = Math.random() * (yRange.max - yRange.min) + yRange.min;
      target.fill = this.targetTemplate[targetType];
      target.stroke = this.targetTemplate[targetType];
      this.configTarget.push(target);

      let option = canvasTools.offset(target, {
        x: target.radius * -0.8,
        y: target.radius * -0.3,
      });
      let randomOptionId = Math.floor(Math.random() * this.allOptions.length);
      option.text = this.allOptions[randomOptionId];
      option.fontSize = target.radius * 0.6;
      this.configOptions.push(option);
    },
    moveTarget() {
      for (let i = 0; i < this.configTarget.length; ++i) {
        this.configTarget[i].x -= this.speed;
        this.configOptions[i].x =
          this.configTarget[i].x - this.configTarget[i].radius * 0.8;
        let leftborder = -this.configTarget[i].radius;
        if (this.configTarget[i].x < leftborder) {
          this.configTarget.splice(i, 1);
          this.configOptions.splice(i, 1);
        }
      }
    },
    planeAnimation() {
      if (this.previousAltitude) {
        if (
          this.configPlane.y > this.previousAltitude &&
          this.configPlane.rotation < 20
        )
          this.configPlane.rotation++;
        else if (
          this.configPlane.y < this.previousAltitude &&
          this.configPlane.rotation > -20
        )
          this.configPlane.rotation--;
        else {
          if (this.configPlane.rotation > 0) this.configPlane.rotation--;
          else if (this.configPlane.rotation < 0) this.configPlane.rotation++;
        }
      }
      this.previousAltitude = this.configPlane.y;
    },
    collisionDetect() {
      for (let i = 0; i < this.configTarget.length; ++i) {
        if (
          canvasTools.distance(
            canvasTools.center(this.configPlane),
            this.configTarget[i]
          ) <=
            this.configTarget[i].radius * 2 &&
          this.configTarget[i].opacity != 0.5
        ) {
          this.checkAnswer(i);
        }
      }
    },
    checkAnswer(i) {
      let isCorrect = false;
      this.configTarget[i].opacity = 0.5;
      this.configOptions[i].visible = false;
      for (let answer in this.GameData.True) {
        if (this.GameData.True[answer] == this.configOptions[i].text)
          isCorrect = true;
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.printCorrectAnswers(),
          this.configOptions[i].text,
          "正確",
        ]);
        this.allOptions = this.allOptions.filter(
          (option) => option != this.configOptions[i].text
        );
        this.trueOptions = this.trueOptions.filter(
          (option) => option != this.configOptions[i].text
        );
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.printCorrectAnswers(),
          this.configOptions[i].text,
          "錯誤",
        ]);
      }
      if (this.trueOptions.length == 0) this.$emit("next-question");
    },
    printCorrectAnswers() {
      return this.GameData.Question.concat(":", this.GameData.True.join("/"));
    },
  },
};
</script>
