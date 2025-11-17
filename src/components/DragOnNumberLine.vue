<template>
  <div ref="container" class="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect :config="configBG" />
      </v-layer>
      <v-layer>
        <v-line
          v-for="(line, index) in configNumberLine"
          :key="index"
          :config="line"
        />
        <v-text
          v-for="(number, index) in configNumber"
          :key="index"
          :config="number"
        />
        <v-circle
          v-if="!isImage"
          :config="configCircle"
          @dragend="handleDragend"
        />
        <v-image
          v-if="isImage"
          :config="configImage"
          @dragend="handleDragend"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";

export default {
  components: {},

  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },
  //{spacing, max, min, image, init_pos, finalPositon}

  emits: ["replyAnswer"],
  data() {
    return {
      configKonva: {},
      configBG: {
        x: 0,
        y: 0,
        fill: "gray",
        stroke: "gray",
        visible: false,
      },

      configCircle: {},
      configImage: {},

      configNumberLine: [],
      configNumber: [],
      numberX: [],
      isImage: false,
    };
  },

  mounted() {
    this.initializeScene();
    this.initializeNumberLine();
    emitter.on("checkAnswer", this.resetPosition);
  },

  beforeUnmount() {
    emitter.off("checkAnswer", this.resetPosition);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth / 4;
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth / 4;
    },
    initializeNumberLine() {
      this.drawBaseLine();
      this.drawNumberLine();
      this.drawNumbers();
      this.drawDraggable();
    },
    drawBaseLine() {
      this.numberLineY = this.gameWidth * 0.15;
      const points = [
        [
          this.gameWidth * 0.05,
          this.numberLineY,
          this.gameWidth * 0.95,
          this.numberLineY,
        ],
        [
          this.gameWidth * 0.94,
          this.numberLineY - this.gameWidth * 0.01,
          this.gameWidth * 0.95,
          this.numberLineY,
        ],
        [
          this.gameWidth * 0.94,
          this.numberLineY + this.gameWidth * 0.01,
          this.gameWidth * 0.95,
          this.numberLineY,
        ],
      ];
      for (const p in points) {
        const line = {};
        line.stroke = "black";
        line.points = points[p];
        this.configNumberLine.push(line);
      }

      // 添加左右標籤
      const leftLabel = {
        text: "左",
        fontSize: 30,
        fontFamily: "YuanQuan",
        x: 0,
        y: this.numberLineY - 50,
      };
      const rightLabel = {
        text: "右",
        fontSize: 30,
        fontFamily: "YuanQuan",
        x: this.gameWidth * 0.95,
        y: this.numberLineY - 50,
      };
      this.configNumber.push(leftLabel, rightLabel);
    },
    drawNumberLine() {
      this.intervalLength =
        (this.gameWidth * 0.9) /
        ((this.componentConfig.max - this.componentConfig.min) /
          this.componentConfig.spacing +
          1);
      let tempX = this.gameWidth * 0.05 + this.intervalLength * 0.5;
      for (
        let i = this.componentConfig.min;
        i <= this.componentConfig.max;
        i += this.componentConfig.spacing
      ) {
        const line = {};
        line.stroke = "black";
        line.points = [
          tempX,
          this.numberLineY - this.gameWidth * 0.01,
          tempX,
          this.numberLineY + this.gameWidth * 0.01,
        ];
        this.configNumberLine.push(line);
        this.numberX.push(tempX);
        tempX += this.intervalLength;
      }
    },
    drawNumbers() {
      this.numberY = this.gameWidth * 0.175;
      for (
        let i = this.componentConfig.min, j = 0;
        i <= this.componentConfig.max;
        i += this.componentConfig.spacing, ++j
      ) {
        const number = {};
        let offset;
        if (i === 0) offset = this.gameWidth * 0.0085;
        else
          offset =
            Math.ceil(Math.log(i + 1) / Math.log(10)) * this.gameWidth * 0.0085;
        number.text = i;
        number.fontSize = this.gameWidth * 0.03;
        number.x = this.numberX[j] - offset;
        number.y = this.numberY;
        this.configNumber.push(number);
      }
    },
    drawDraggable() {
      let initId = 0;
      if (this.componentConfig.init_pos) initId = this.getInitialPositionId();
      console.log(
        getGameAssets(this.gameId, this.componentConfig.image).includes(
          "undefined"
        )
      );
      if (
        getGameAssets(this.gameId, this.componentConfig.image).includes(
          "undefined"
        )
      ) {
        this.isImage = false;
        console.log("No image found");
        console.log(this.gameId, this.componentConfig.image);
      } else this.isImage = true;

      const configDraggable = {
        x: this.numberX[initId],
        y: this.gameWidth * 0.075,
        draggable: true,
        dragBoundFunc: this.horizontalBound,
      };

      if (this.isImage) {
        const draggableImage = new window.Image();
        draggableImage.src = getGameAssets(
          this.gameId,
          this.componentConfig.image
        );
        configDraggable.image = draggableImage;
        configDraggable.width = this.intervalLength;
        configDraggable.height = this.intervalLength;
        configDraggable.x = canvasTools.corner(configDraggable).x;
        configDraggable.y = canvasTools.corner(configDraggable).y;
        this.configImage = configDraggable;
      } else {
        configDraggable.radius = this.intervalLength * 0.5;
        configDraggable.fill = "green";
        configDraggable.stroke = "green";
        this.configCircle = configDraggable;
      }
    },
    getInitialPositionId() {
      let initId = 0;
      for (
        let i = this.componentConfig.min;
        i <= this.componentConfig.max;
        i += this.componentConfig.spacing, ++initId
      ) {
        if (i === this.componentConfig.init_pos) return initId;
      }
    },
    handleDragend(e) {
      let snapTo,
        distance = 999,
        output,
        dragendPosition;
      if (this.isImage) {
        this.configImage.x = e.target.x();
        dragendPosition = canvasTools.center(this.configImage).x;
      } else {
        this.configCircle.x = e.target.x();
        dragendPosition = this.configCircle.x;
      }

      for (
        let i = this.componentConfig.min, j = 0;
        i <= this.componentConfig.max;
        i += this.componentConfig.spacing, ++j
      ) {
        if (Math.abs(dragendPosition - this.numberX[j]) < distance) {
          distance = Math.abs(dragendPosition - this.numberX[j]);
          snapTo = this.numberX[j];
          output = i;
        }
      }

      if (this.isImage)
        this.configImage.x = snapTo - this.configImage.width * 0.5;
      else this.configCircle.x = snapTo;

      this.checkAnswer(output);
    },
    checkAnswer(output) {
      console.log(output, this.componentConfig.finalPosition);
      if (output === this.componentConfig.finalPosition) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
    },
    horizontalBound(pos) {
      if (this.isImage) {
        return {
          x: pos.x,
          y: this.configImage.y,
        };
      } else {
        return {
          x: pos.x,
          y: this.configCircle.y,
        };
      }
    },
    resetPosition() {
      let initId = 0;
      if (this.componentConfig.init_pos) initId = this.getInitialPositionId();
      const newX = this.numberX[initId];

      if (this.isImage) {
        this.configImage.x = newX - this.configImage.width * 0.5;
      } else {
        this.configCircle.x = newX;
      }
    },
  },
};
</script>
<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
