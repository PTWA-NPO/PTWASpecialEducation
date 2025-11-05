<template>
  <div ref="container">
    <v-stage :config="configKonva">
      <v-layer>
        <v-image
          :config="configBG"
          @pointerdown="handleDrag"
          @pointermove="handleDrag"
          @pointerup="dragEnd"
        />
        <v-shape :config="configHand" />
        <v-shape :config="configTextBox" />
        <v-shape :config="configWeight" />
        <v-shape :config="configScale" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets, getSystemAssets } from "@/lib/get-assets.js";
import * as canvasTools from "@/lib/canvasTools.js";

export default {
  name: "ScalePointer",
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

  emits: ["ReplyAnswer", "replyAnswer"],
  data() {
    return {
      configKonva: {},
      configBG: {
        x: 0,
        y: 0,
      },
      configHand: {
        stroke: "black",
      },
      configTextBox: {
        fill: "green",
        stroke: "green",
        visible: false,
      },
      configWeight: {
        visible: false,
      },
      configScale: {
        stroke: "#333",
        strokeWidth: 2,
      },

      dragging: false,

      answer: 0,
    };
  },

  mounted() {
    this.initializeScene();
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.container.clientWidth;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth;
      this.drawBG();
      this.drawHand();
      this.drawTextBox();
      this.drawWeight();
      this.drawScale();
    },
    drawBG() {
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth;
      const bgImage = new window.Image();
      if (this.componentConfig.customScaleSrc === null)
        bgImage.src = getSystemAssets("scale.png", "scale");
      else
        bgImage.src = getGameAssets(
          this.gameId,
          this.componentConfig.customScaleSrc
        );
      this.configBG.image = bgImage;
    },
    drawHand() {
      this.configHand.x = this.gameWidth / 2;
      this.configHand.y = this.gameWidth / 2;
      this.configHand.length = this.gameWidth / 6.5;
      this.configHand.rotation = 0;
      this.configHand.sceneFunc = this.handSceneFunc;
    },
    drawTextBox() {
      this.configTextBox.x = this.gameWidth / 2;
      this.configTextBox.y = this.gameWidth / 2;
      this.configTextBox.height = this.gameWidth * 0.075;
      this.configTextBox.width = this.gameWidth * 0.15;
      this.configTextBox.rotation = 0;
      this.configTextBox.sceneFunc = this.textBoxSceneFunc;
    },
    drawWeight() {
      this.configWeight.x = this.gameWidth / 2;
      this.configWeight.y = this.gameWidth / 2;
      this.configWeight.fontSize = this.gameWidth * 0.07;
      this.configWeight.height = this.gameWidth * 0.075;
      this.configWeight.width = this.gameWidth * 0.15;
      this.configWeight.rotation = 0;
      this.configWeight.text = 0;
      this.configWeight.sceneFunc = this.weightSceneFunc;
    },
    drawScale() {
      this.configScale.x = this.gameWidth / 2;
      this.configScale.y = this.gameWidth / 2;
      this.configScale.sceneFunc = this.scaleSceneFunc;
    },
    handSceneFunc(context, shape) {
      context.beginPath();
      context.lineWidth = this.gameWidth * 0.03;
      context.lineCap = "round";
      context.rotate(shape.getAttr("rotation"));
      context.moveTo(0, shape.getAttr("length") / 10);
      context.lineTo(0, -shape.getAttr("length"));
      context.stroke();
      context.closePath();
    },
    textBoxSceneFunc(context, shape) {
      const rotation = shape.getAttr("rotation");
      const correction = 0.017;
      let position;
      context.beginPath();
      context.rotate(rotation);
      context.translate(0, -this.gameWidth * 0.3);
      context.rotate(-rotation * (1 + correction));
      if (rotation <= Math.PI / 2) {
        position = {
          x: 0,
          y: -shape.getAttr("height"),
        };
      } else if (rotation <= Math.PI) {
        position = {
          x: 0,
          y: 0,
        };
      } else if (rotation <= Math.PI * 1.5) {
        position = {
          x: -shape.getAttr("width"),
          y: 0,
        };
      } else {
        position = {
          x: -shape.getAttr("width"),
          y: -shape.getAttr("height"),
        };
      }
      context.roundRect(
        position.x,
        position.y,
        shape.getAttr("width"),
        shape.getAttr("height"),
        this.gameWidth * 0.02
      );
      context.fillStrokeShape(shape);
      context.closePath();
    },
    weightSceneFunc(context, shape) {
      const rotation = shape.getAttr("rotation");
      const correction = 0.017;
      const offset = this.gameWidth * 0.01;
      let position;
      context.beginPath();
      context.rotate(rotation);
      context.translate(0, -this.gameWidth * 0.3);
      context.rotate(-rotation * (1 + correction));
      context.font = shape.getAttr("fontSize") + "px serif";

      if (rotation <= Math.PI / 2) {
        position = {
          x: offset,
          y: -offset,
        };
      } else if (rotation <= Math.PI) {
        position = {
          x: offset,
          y: shape.getAttr("height") - offset,
        };
      } else if (rotation <= Math.PI * 1.5) {
        position = {
          x: -shape.getAttr("width") + offset,
          y: shape.getAttr("height") - offset,
        };
      } else {
        position = {
          x: -shape.getAttr("width") + offset,
          y: -offset,
        };
      }
      context.fillText(
        shape.getAttr("text"),
        position.x,
        position.y,
        shape.getAttr("width") - offset * 2
      );
      context.closePath();
    },
    scaleSceneFunc(context, shape) {
      const centerX = 0;
      const centerY = 0;
      const radius = this.gameWidth * 0.23; // 進一步縮小刻度圓的半徑
      const innerRadius = radius - this.gameWidth * 0.02; // 內圈半徑
      const outerRadius = radius + this.gameWidth * 0.008; // 外圈半徑

      context.beginPath();
      context.strokeStyle = shape.getAttr("stroke");
      context.lineWidth = shape.getAttr("strokeWidth");

      // 繪製主要刻度（每50克一個）
      for (let i = 0; i <= 60; i++) {
        // 調整角度，讓正上方是0，順時針方向
        const angle = (i * Math.PI) / 30 - Math.PI / 2; // 減去90度讓正上方是0
        const startX = centerX + innerRadius * Math.cos(angle);
        const startY = centerY + innerRadius * Math.sin(angle);

        // 500克刻度（每10個刻度一個長刻度）
        if (i % 10 === 0) {
          context.lineWidth = shape.getAttr("strokeWidth") * 3;
          const longEndX =
            centerX + (outerRadius + this.gameWidth * 0.015) * Math.cos(angle);
          const longEndY =
            centerY + (outerRadius + this.gameWidth * 0.015) * Math.sin(angle);
          context.moveTo(startX, startY);
          context.lineTo(longEndX, longEndY);

          // 添加數字標籤在刻度線內部
          const labelRadius = radius - this.gameWidth * 0.05;
          const labelX = centerX + labelRadius * Math.cos(angle);
          const labelY = centerY + labelRadius * Math.sin(angle);
          context.font = `${this.gameWidth * 0.03}px Arial`;
          context.fillStyle = "#333";
          context.textAlign = "center";
          context.textBaseline = "middle";
          const weight = (i * 50) % 3000;
          context.fillText(weight.toString(), labelX, labelY);
        }
        // 100克刻度（每2個刻度一個中等長度刻度）
        else if (i % 2 === 0) {
          context.lineWidth = shape.getAttr("strokeWidth") * 2;
          const mediumEndX =
            centerX + (outerRadius + this.gameWidth * 0.012) * Math.cos(angle);
          const mediumEndY =
            centerY + (outerRadius + this.gameWidth * 0.012) * Math.sin(angle);
          context.moveTo(startX, startY);
          context.lineTo(mediumEndX, mediumEndY);
        }
        // 50克刻度（短刻度）
        else {
          context.lineWidth = shape.getAttr("strokeWidth");
          // 短刻度線外端與長刻度線外端切齊，但內端更靠近中心
          const shortStartX =
            centerX + (innerRadius + this.gameWidth * 0.025) * Math.cos(angle);
          const shortStartY =
            centerY + (innerRadius + this.gameWidth * 0.025) * Math.sin(angle);
          const shortEndX =
            centerX + (outerRadius + this.gameWidth * 0.008) * Math.cos(angle);
          const shortEndY =
            centerY + (outerRadius + this.gameWidth * 0.008) * Math.sin(angle);
          context.moveTo(shortStartX, shortStartY);
          context.lineTo(shortEndX, shortEndY);
        }
      }

      context.stroke();
      context.closePath();
    },
    handleDrag(e) {
      if (e.type === "pointerdown") this.dragging = true;
      if (
        this.dragging &&
        this.canDrag(e.target.getStage().getPointerPosition())
      ) {
        const angle = canvasTools.angle(
          this.configHand,
          e.target.getStage().getPointerPosition()
        );
        this.configHand.rotation = angle;
        this.configTextBox.rotation = angle;
        this.configTextBox.visible = true;
        this.configWeight.rotation = angle;

        this.configWeight.visible = true;
        if (this.getAnswer() !== this.answer) {
          this.answer = this.getAnswer();
          this.configWeight.text = this.getAnswer();
          this.$emit("replyAnswer", this.answer);
        }
      }
    },
    dragEnd() {
      this.dragging = false;
      this.configTextBox.visible = false;
      this.configWeight.visible = false;
    },
    canDrag(position) {
      const angle = canvasTools.angle(this.configHand, position);
      const margin = 0.3;
      if (
        canvasTools.distance(this.configHand, position) <=
        this.configHand.length
      ) {
        if (Math.abs(angle - this.configHand.rotation) <= margin) return true;
        if (
          this.configHand.rotation < margin &&
          Math.abs(this.configHand.rotation + Math.PI * 2 - angle) <= margin
        )
          return true;
        if (
          this.configHand.rotation > Math.PI * 2 - margin &&
          Math.abs(Math.PI * 2 - this.configHand.rotation + angle) <= margin
        )
          return true;
      }
      return false;
    },
    getAnswer() {
      const ans =
        Math.round((this.configHand.rotation / Math.PI / 2) * 60) * 50;
      if (ans === 3000) return 0;
      else return ans;
    },
  },
};
</script>
