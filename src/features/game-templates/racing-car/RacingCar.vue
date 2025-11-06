<template>
  <div ref="container" class="gameContainer">
    <div>
      <h2>{{ gameData.Question }}</h2>
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
        <v-layer>
          <v-image
            v-for="(smoke, index) in configSmoke"
            :key="index"
            :config="smoke"
          />
          <v-image :config="configEndingImage" />
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
import { getGameAssets, getGameStaticAssets } from "@/lib/get-assets.js";
import * as canvasTools from "@/lib/canvasTools.js";

export default {
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
      configRoad: [],
      configTunnel: [],
      configOption: [],
      configTextBox: [],
      configCar: {},
      configEndingImage: null,
      configSmoke: [],

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
    this.initializeScene();
    window.addEventListener("keydown", this.input);
    requestAnimationFrame(this.moveRoad);
  },

  methods: {
    initializeScene() {
      this.options = canvasTools.shuffleOptions(this.gameData.Options);
      this.currentOptionId = Math.floor(Math.random() * this.options.length);
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 2;
      this.drawRoad();
      this.drawTunnel();
      this.drawOptions();
      this.drawTextBox();
      this.drawCar();
      this.setBtnStyle();
    },
    drawRoad() {
      const roadImg = new window.Image();
      roadImg.src = getGameStaticAssets("RacingCar", "road.png");
      this.laneWidth = this.gameWidth / 2 / this.options.length;
      this.roadX = 0;
      for (let i = 0; i < this.options.length; i++) {
        const road = {
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
      for (let i = 0; i < this.options.length; i++) {
        const tunnel = {
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
      let fontSize = this.laneWidth * 0.4;
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].length > 5) {
          fontSize = this.laneWidth * 0.15;
        } else if (this.options[i].length > 3) {
          fontSize = this.laneWidth * 0.2;
        }
        const option = {
          x: canvasTools.offset(this.configRoad[i], this.optionOffset).x,
          y: canvasTools.offset(this.configRoad[i], this.optionOffset).y,
          fontSize,
          text: this.options[i],
          wrap: "word",
          width: this.laneWidth * 0.8,
          align: "center",
          padding: 5,
          lineHeight: 1.2,
        };
        this.configOption.push(option);
      }
    },
    drawTextBox() {
      this.textBoxOffset = {
        x: this.gameWidth + this.laneWidth * 0.75,
        y: this.laneWidth * 0.25,
      };
      for (let i = 0; i < this.options.length; i++) {
        const box = {
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
    setBtnStyle() {
      const btnCon = document.getElementById("btnContainer");
      btnCon.style.height = this.configKonva.height + "px";
    },
    moveRoad() {
      if (this.roadX < this.gameWidth * -1.2) {
        this.checkAnswer();
      } else {
        this.roadX -= this.speed;
        for (const road in this.configRoad)
          this.configRoad[road].x = this.roadX;
        for (const tunnel in this.configTunnel)
          this.configTunnel[tunnel].x = canvasTools.offset(
            this.configRoad[0],
            this.tunnelOffset
          ).x;
        for (const option in this.configOption)
          this.configOption[option].x = canvasTools.offset(
            this.configRoad[0],
            this.optionOffset
          ).x;
        for (const box in this.configTextBox)
          this.configTextBox[box].x = canvasTools.offset(
            this.configRoad[0],
            this.textBoxOffset
          ).x;
        requestAnimationFrame(this.moveRoad);
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
            requestAnimationFrame(this.moveCar);
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
            requestAnimationFrame(this.moveCar);
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
        case 39:
        case 68:
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
              requestAnimationFrame(this.moveCar);
            }
            break;
          case "down":
            this.currentOptionId++;
            if (this.currentOptionId > this.options.length - 1)
              this.currentOptionId = this.options.length - 1;
            else {
              this.movement = "down";
              this.canMove = false;
              requestAnimationFrame(this.moveCar);
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
        this.options[this.currentOptionId] ===
        this.gameData.Options[this.gameData.Answer]
      ) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.gameData.Options[this.gameData.Answer],
          this.options[this.currentOptionId],
          "正確",
        ]);
        this.drawSmoke();
        this.endingFrameCount = 0;
        requestAnimationFrame(this.endingAnimation);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.Options[this.gameData.Answer],
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
      requestAnimationFrame(this.moveRoad);
    },
    endingAnimation() {
      if (
        this.configCar.x > this.gameWidth &&
        this.configEndingImage === null
      ) {
        this.$emit("next-question");
      } else {
        this.configCar.x += this.speed;
        this.moveSmoke();
        requestAnimationFrame(this.endingAnimation);
      }
      this.endingFrameCount++;
      if (this.endingFrameCount % 20 === 0 && this.configCar.x < this.gameWidth)
        this.drawSmoke();
    },
    drawSmoke() {
      const smokeImg = new window.Image();
      smokeImg.src = getGameStaticAssets("RacingCar", "smoke.png");
      const smoke = {
        x: canvasTools.center(this.configCar).x,
        y: canvasTools.center(this.configCar).y,
        height: this.laneWidth * 0.1,
        width: this.laneWidth * 0.1,
        image: smokeImg,
        opacity: 1,
      };
      smoke.x = canvasTools.corner(smoke).x;
      smoke.y = canvasTools.corner(smoke).y;
      this.configSmoke.push(smoke);
    },
    moveSmoke() {
      for (const i in this.configSmoke) {
        if (this.gameData.EndingImage && Number(i) === 3) {
          if (this.configEndingImage) {
            this.moveImageSmoke();
            this.moveEndingImage();
          } else {
            this.drawEndingImage();
            this.moveImageSmoke();
            this.moveEndingImage();
          }
        } else {
          this.configSmoke[i].x -= 2;
          if (this.configSmoke[i].width < this.laneWidth) {
            this.configSmoke[i].width++;
            this.configSmoke[i].height++;
            this.configSmoke[i].y = canvasTools.center(this.configCar).y;
            this.configSmoke[i].y = canvasTools.corner(this.configSmoke[i]).y;
          } else if (this.configSmoke[i].opacity > 0) {
            this.configSmoke[i].opacity -= 0.05;
          } else {
            this.configSmoke[i].visible = false;
          }
        }
      }
    },
    drawEndingImage() {
      const img = new window.Image();
      img.src = getGameAssets(this.gameId, this.gameData.EndingImage);
      this.configEndingImage = {
        image: img,
      };
    },
    moveImageSmoke() {
      const center = {
        x: this.gameWidth * 0.5,
        y: this.gameWidth * 0.25,
      };
      this.configSmoke[3].x +=
        canvasTools.unitVector(canvasTools.center(this.configSmoke[3]), center)
          .x * 5;
      this.configSmoke[3].y +=
        canvasTools.unitVector(canvasTools.center(this.configSmoke[3]), center)
          .y * 5;
      if (this.configSmoke[3].height <= this.gameWidth * 0.5)
        this.configSmoke[3].height += 3;
      if (this.configSmoke[3].width <= this.gameWidth)
        this.configSmoke[3].width += 6;
      else
        setTimeout(() => {
          this.$emit("next-question");
        }, 2000);
    },
    moveEndingImage() {
      this.configEndingImage.x = canvasTools.center(this.configSmoke[3]).x;
      this.configEndingImage.y = canvasTools.center(this.configSmoke[3]).y;
      if (
        this.configEndingImage.image.height * 2 >
        this.configEndingImage.image.width
      ) {
        this.configEndingImage.height = this.configSmoke[3].height * 0.75;
        this.configEndingImage.width =
          (this.configEndingImage.height * this.configEndingImage.image.width) /
          this.configEndingImage.image.height;
      } else {
        this.configEndingImage.width = this.configSmoke[3].width * 0.75;
        this.configEndingImage.height =
          (this.configEndingImage.width * this.configEndingImage.image.height) /
          this.configEndingImage.image.width;
      }
      this.configEndingImage.x = canvasTools.corner(this.configEndingImage).x;
      this.configEndingImage.y = canvasTools.corner(this.configEndingImage).y;
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
