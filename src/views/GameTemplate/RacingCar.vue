<template>
  <div ref="container" class="gameContainer">
    <div>
      <h2>{{ GameData.Question }}</h2>
      <v-stage :config="configKonva">
        <v-layer>
          <v-image
            v-for="(road, index) in configRoad"
            :key="index"
            :config="road"
          />
        </v-layer>

        <v-layer>
          <v-image :config="configCar" />
        </v-layer>

        <v-layer>
          <v-image
            v-for="(tunnel, index) in configTunnel"
            :key="index"
            :config="tunnel"
          />
          <v-rect
            v-for="(box, index) in configTextBox"
            :key="index"
            :config="box"
          />
          <v-text
            v-for="(option, index) in configOption"
            :key="index"
            :config="option"
          />
        </v-layer>
      </v-stage>
    </div>
    <div id="btnContainer">
      <img :src="upBtn" class="controlBtn" @click="getCurrentOptionId('up')" />
      <br />
      <img
        :src="rightBtn"
        class="controlBtn"
        @click="getCurrentOptionId('right')"
      />
      <br />
      <img
        :src="downBtn"
        class="controlBtn"
        @click="getCurrentOptionId('down')"
      />
    </div>
  </div>
</template>

<script>
import { getSystemAssets, getGameStaticAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";

export default {
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
      configRoad: [],
      configTunnel: [],
      configOption: [],
      configTextBox: [],
      configCar: {},

      speed: 1,
      canMove: true,
      movement: "idle",
      currentOptionId: 0,

      upBtn: getGameStaticAssets("RacingCar", "arrowUp.jpg"),
      rightBtn: getGameStaticAssets("RacingCar", "arrowRight.jpg"),
      downBtn: getGameStaticAssets("RacingCar", "arrowDown.jpg"),
    };
  },

  mounted() {
    this.options = canvasTools.shuffleOptions(this.GameData.Options);
    this.currentOptionId = Math.floor(Math.random() * this.options.length);
    this.initializeScene();
    window.addEventListener("keydown", this.input);
    var btnCon = document.getElementById("btnContainer");
    btnCon.style.height = this.configKonva.height + "px";
    this.game = window.setInterval(this.update, 20);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 2;
      this.drawRoad();
      this.drawTunnel();
      this.drawOptions();
      this.drawTextBox();
      this.drawCar();
    },
    drawRoad() {
      const roadImg = new window.Image();
      roadImg.src = getGameStaticAssets("RacingCar", "road.png");
      this.laneWidth = this.gameWidth / 2 / this.options.length;
      this.roadX = 0;
      for (var i = 0; i < this.options.length; i++) {
        let road = {
          x: 0,
          y: this.laneWidth * i,
          width: this.gameWidth * 2.225,
          height: this.laneWidth,
          image: roadImg,
        };
        this.configRoad.push(road);
      }
    },
    drawTunnel() {
      const tunnelImg = new window.Image();
      tunnelImg.src = getGameStaticAssets("RacingCar", "tunnel.png");
      this.tunnelOffset = {
        x: this.gameWidth,
        y: 0,
      };
      for (var i = 0; i < this.options.length; i++) {
        let tunnel = {
          x: canvasTools.offset(this.configRoad[i], this.tunnelOffset).x,
          y: this.laneWidth * i,
          width: this.laneWidth * 2,
          height: this.laneWidth,
          image: tunnelImg,
        };
        this.configTunnel.push(tunnel);
      }
    },
    drawOptions() {
      this.optionOffset = {
        x: this.gameWidth + this.laneWidth * 0.85,
        y: this.laneWidth * 0.325,
      };
      for (var i = 0; i < this.options.length; i++) {
        let option = {
          x: canvasTools.offset(this.configRoad[i], this.optionOffset).x,
          y: canvasTools.offset(this.configRoad[i], this.optionOffset).y,
          fontSize: this.laneWidth * 0.4,
          text: this.options[i],
        };
        this.configOption.push(option);
      }
    },
    drawTextBox() {
      this.textBoxOffset = {
        x: this.gameWidth + this.laneWidth * 0.75,
        y: this.laneWidth * 0.25,
      };
      for (var i = 0; i < this.options.length; i++) {
        let box = {
          cornerRadius: this.laneWidth * 0.1,
          stroke: "black",
          fill: "white",
          x: canvasTools.offset(this.configRoad[i], this.textBoxOffset).x,
          y: canvasTools.offset(this.configRoad[i], this.textBoxOffset).y,
          height: this.laneWidth * 0.5,
          width: this.laneWidth * 1,
        };
        this.configTextBox.push(box);
      }
    },
    drawCar() {
      const carImg = new window.Image();
      carImg.src = getGameStaticAssets("RacingCar", "car.png");
      this.configCar.image = carImg;
      this.configCar.height = this.laneWidth * 0.8;
      this.configCar.width = this.laneWidth * 0.8;
      this.carOffset = { x: this.laneWidth * 0.2, y: this.laneWidth * 0.1 };
      this.configCar.x = canvasTools.offset(
        this.configRoad[this.currentOptionId],
        this.carOffset
      ).x;
      this.configCar.y = canvasTools.offset(
        this.configRoad[this.currentOptionId],
        this.carOffset
      ).y;
    },
    update() {
      this.moveRoad();
      this.moveCar();
    },
    moveRoad() {
      if (this.roadX < this.gameWidth * -1.2) {
        this.checkAnswer();
      } else {
        this.roadX -= this.speed;
        for (let road in this.configRoad) this.configRoad[road].x = this.roadX;
        for (let tunnel in this.configTunnel)
          this.configTunnel[tunnel].x = canvasTools.offset(
            this.configRoad[0],
            this.tunnelOffset
          ).x;
        for (let option in this.configOption)
          this.configOption[option].x = canvasTools.offset(
            this.configRoad[0],
            this.optionOffset
          ).x;
        for (let box in this.configTextBox)
          this.configTextBox[box].x = canvasTools.offset(
            this.configRoad[0],
            this.textBoxOffset
          ).x;
      }
    },
    moveCar() {
      switch (this.movement) {
        case "up":
          if (
            this.configCar.y >
            canvasTools.offset(
              this.configRoad[this.currentOptionId],
              this.carOffset
            ).y
          ) {
            this.configCar.y -= this.speed * 4;
            this.configCar.rotation = -10;
          } else {
            this.configCar.rotation = 0;
            this.canMove = true;
            this.movement = "idle";
          }
          break;
        case "down":
          if (
            this.configCar.y <
            canvasTools.offset(
              this.configRoad[this.currentOptionId],
              this.carOffset
            ).y
          ) {
            this.configCar.y += this.speed * 4;
            this.configCar.rotation = 10;
          } else {
            this.configCar.rotation = 0;
            this.canMove = true;
            this.movement = "idle";
          }
          break;
      }
    },
    input(e) {
      //W = 38/87; A = 37/65; S = 40/83; D = 39/68
      //console.log(e.keyCode);
      switch (e.keyCode) {
        case 38:
        case 87:
          this.getCurrentOptionId("up");
          break;

        case 40:
        case 83:
          this.getCurrentOptionId("down");
          break;

        case 32:
          this.getCurrentOptionId("right");
          break;
      }
    },
    getCurrentOptionId(direction) {
      if (this.canMove) {
        switch (direction) {
          case "up":
            this.currentOptionId--;
            if (this.currentOptionId < 0) this.currentOptionId = 0;
            else {
              this.movement = "up";
              this.canMove = false;
            }
            break;
          case "down":
            this.currentOptionId++;
            if (this.currentOptionId > this.options.length - 1)
              this.currentOptionId = this.options.length - 1;
            else {
              this.movement = "down";
              this.canMove = false;
            }
            break;
          case "right":
            this.speed = 10;
            this.canMove = false;
        }
      }
    },
    checkAnswer() {
      if (
        this.options[this.currentOptionId] ==
        this.GameData.Options[this.GameData.Answer]
      ) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.GameData.Options[this.GameData.Answer],
          this.options[this.currentOptionId],
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.Options[this.GameData.Answer],
          this.options[this.currentOptionId],
          "錯誤",
        ]);
        this.replay();
      }
    },

    replay() {
      this.roadX = 0;
      this.speed = 1;
      this.canMove = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.gameContainer {
  display: flex;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

#btnContainer {
  height: 100%;
  margin: 10px;
}

.controlBtn {
  height: 30%;
  aspect-ratio: 1/1;
  margin: 5%;
  border: 5px solid black;
}
</style>
