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
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getGameAssets, getSystemAssets } from "@/utilitys/get_assets.js";
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {},

  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
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
    },
    drawBG() {
      this.configBG.width = this.gameWidth;
      this.configBG.height = this.gameWidth;
      const bgImage = new window.Image();
      if (this.Data.customScaleSrc == null)
        bgImage.src = getSystemAssets("scale.png", "scale");
      else bgImage.src = getGameAssets(this.ID, this.Data.customScaleSrc);
      this.configBG.image = bgImage;
    },
    drawHand() {
      this.configHand.x = this.gameWidth / 2;
      this.configHand.y = this.gameWidth / 2;
      this.configHand.length = this.gameWidth / 6;
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
      let rotation = shape.getAttr("rotation"),
        correction = 0.017,
        position;
      context.beginPath();
      context.rotate(rotation);
      context.translate(0, -this.gameWidth * 0.2);
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
      let rotation = shape.getAttr("rotation"),
        correction = 0.017,
        offset = this.gameWidth * 0.01,
        position;
      context.beginPath();
      context.rotate(rotation);
      context.translate(0, -this.gameWidth * 0.2);
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
    handleDrag(e) {
      if (e.type == "pointerdown") this.dragging = true;
      if (
        this.dragging &&
        this.canDrag(e.target.getStage().getPointerPosition())
      ) {
        let angle = canvasTools.angle(
          this.configHand,
          e.target.getStage().getPointerPosition()
        );
        this.configHand.rotation = angle;
        this.configTextBox.rotation = angle;
        this.configTextBox.visible = true;
        this.configWeight.rotation = angle;

        this.configWeight.visible = true;
        if (this.getAnswer() != this.answer) {
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
      let angle = canvasTools.angle(this.configHand, position);
      let margin = 0.3;
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
      let ans = Math.round((this.configHand.rotation / Math.PI / 2) * 60) * 50;
      if (ans == 3000) return 0;
      else return ans;
    },
  },
};
</script>
