<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage
      :config="configKonva"
      @pointerdown="aimStart"
      @pointermove="aimMove"
      @pointerup="shoot"
    >
      <v-layer>
        <v-rect :config="configBG" />
      </v-layer>

      <v-layer>
        <v-circle
          v-for="(balloon, index) in configBalloon"
          :key="index"
          :config="balloon"
        />
        <v-text
          v-for="(option, index) in configOptions"
          :key="index"
          :config="option"
        />
      </v-layer>
      <v-layer>
        <v-circle v-if="isAiming" :config="configScope" />
        <template v-if="isAiming">
          <v-line
            v-for="(line, index) in configCross"
            :key="index"
            :config="line"
          />
        </template>
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
        fill: "gray",
        stroke: "gray",
      },
      configScope: {
        stroke: "white",
      },
      configCross: [{}, {}, {}, {}],

      configBalloon: [],
      configOptions: [],
      balloonTemplate: ["pink", "lightblue", "yellow"],

      speed: 2,
      isAiming: false,
      readyToShoot: false,

      allOptions: [],
      trueOptions: [],
    };
  },

  mounted() {
    this.initializeScene();
    this.initializeOptions();
    this.balloonSpawner();
    this.game = window.setInterval(this.update, 20);
    this.spawner = window.setInterval(this.balloonSpawner, 1000);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 2;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth / 2;
      for (let i = 0; i < 4; ++i) {
        this.configCross[i].stroke = "white";
      }
    },
    initializeOptions() {
      this.allOptions = this.GameData.True.concat(this.GameData.False);
      this.trueOptions = this.GameData.True;
    },
    update() {
      this.moveBalloon();
      if (this.isAiming) this.aimAnimation();
    },

    balloonSpawner() {
      if (!this.isAiming) {
        let balloonType = Math.floor(
          Math.random() * this.balloonTemplate.length
        );
        let balloon = {};
        balloon.radius = this.gameWidth * 0.07;
        balloon.y = this.gameWidth * 0.5 + balloon.radius;
        balloon.x =
          Math.random() * (this.gameWidth - balloon.radius * 2) +
          balloon.radius;
        balloon.fill = this.balloonTemplate[balloonType];
        balloon.stroke = this.balloonTemplate[balloonType];
        this.configBalloon.push(balloon);

        let option = canvasTools.offset(balloon, {
          x: balloon.radius * -0.8,
          y: balloon.radius * -0.3,
        });
        option.text =
          this.allOptions[Math.floor(Math.random() * this.allOptions.length)];
        option.fontSize = balloon.radius * 0.6;
        this.configOptions.push(option);
      }
    },
    moveBalloon() {
      for (let i = 0; i < this.configBalloon.length; ++i) {
        this.configBalloon[i].y -= this.speed;
        this.configOptions[i].y =
          this.configBalloon[i].y - this.configBalloon[i].radius * 0.3;
        if (this.configBalloon[i].y < -this.configBalloon[i].radius) {
          this.configBalloon.splice(i, 1);
          this.configOptions.splice(i, 1);
        }
      }
    },
    aimStart(e) {
      this.aimPosition = e.target.getStage().getPointerPosition();
      this.configScope.x = e.target.getStage().getPointerPosition().x;
      this.configScope.y = e.target.getStage().getPointerPosition().y;
      this.isAiming = true;
      this.readyToShoot = false;
      this.configScope.radius = this.gameWidth * 0.12;
      this.configScope.stroke = "white";
      this.drawCross();
      this.speed = 0.4;
    },
    aimMove(e) {
      this.aimPosition = e.target.getStage().getPointerPosition();
      this.configScope.x = e.target.getStage().getPointerPosition().x;
      this.configScope.y = e.target.getStage().getPointerPosition().y;
    },
    aimAnimation() {
      this.drawCross();
      if (this.configScope.radius > this.gameWidth * 0.08) {
        this.configScope.radius -= this.gameWidth * 0.003;
      } else {
        this.readyToShoot = true;
        this.configScope.stroke = "red";
      }
    },
    drawCross() {
      let offset1 = this.configScope.radius,
        offset2 = this.configScope.radius - this.gameWidth * 0.08;
      let pointOffset1 = [
        { x: 0, y: -offset1 },
        { x: 0, y: offset1 },
        { x: -offset1, y: 0 },
        { x: offset1, y: 0 },
      ];
      let pointOffset2 = [
        { x: 0, y: -offset2 },
        { x: 0, y: offset2 },
        { x: -offset2, y: 0 },
        { x: offset2, y: 0 },
      ];
      for (let i = 0; i < 4; ++i) {
        this.configCross[i].points = [
          canvasTools.offset(this.configScope, pointOffset1[i]).x,
          canvasTools.offset(this.configScope, pointOffset1[i]).y,
          canvasTools.offset(this.configScope, pointOffset2[i]).x,
          canvasTools.offset(this.configScope, pointOffset2[i]).y,
        ];
        if (this.readyToShoot) this.configCross[i].stroke = "red";
        else this.configCross[i].stroke = "white";
      }
    },
    shoot() {
      this.isAiming = false;
      this.speed = 2;

      if (this.readyToShoot) {
        for (let i = 0; i < this.configBalloon.length; ++i) {
          if (
            canvasTools.distance(this.aimPosition, this.configBalloon[i]) <=
            this.configBalloon[i].radius
          ) {
            this.checkAnswer(this.configOptions[i].text);
            this.configBalloon.splice(i, 1);
            this.configOptions.splice(i, 1);
            break;
          }
        }
      }
    },
    checkAnswer(selectedOption) {
      let checkAnswer = false;
      for (let answer in this.GameData.True) {
        if (this.GameData.True[answer] == selectedOption) checkAnswer = true;
      }
      if (checkAnswer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["#", selectedOption, "正確"]);
        this.allOptions = this.allOptions.filter(
          (option) => option != selectedOption
        );
        this.trueOptions = this.trueOptions.filter(
          (option) => option != selectedOption
        );
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["#", selectedOption, "錯誤"]);
      }
      if (this.trueOptions.length == 0) this.$emit("next-question");
    },
  },
};
</script>
