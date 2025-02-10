<template>
  <bin
    :config="configBin"
    @get-bin-pos="
      (e) => {
        binPosition = e;
      }
    "
  />
  <v-rect
    v-for="(frame, index) in configDenominator.frame"
    :key="index"
    :config="frame"
    @dragmove="denominatorDragMove"
    @dragend="denominatorDragEnd"
  />
  <v-rect
    v-for="(rect, index) in configDenominator.rect"
    :key="index"
    :config="rect"
    @dragmove="denominatorDragMove"
    @dragend="denominatorDragEnd"
  />
  <v-shape
    v-for="(slice, index) in configDenominator.slice"
    :key="index"
    :config="slice"
  />
  <v-rect :config="configNumerator" @dragend="numeratorDragEnd" />
</template>

<script>
import * as canvasTools from "@/utilitys/canvasTools.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {
    bin: defineAsyncComponent(() => import("@/components/interactiveBin.vue")),
  },

  props: {
    numerator: {
      type: Number,
      required: true,
    },
    denominator: {
      type: Number,
      required: true,
    },
    gameWidth: {
      type: Number,
      required: true,
    },
    gameHeight: {
      type: Number,
      required: true,
    },
  },
  emits: ["addFill"],
  data() {
    return {
      numeratorSnapTo: {},
      denominatorSnapTo: {},

      configNumerator: {
        draggable: true,
        fill: "#4C5B3A",
        stroke: "#4C5B3A",
      },
      configDenominator: {
        frame: [],
        rect: [],
        slice: [],
      },
      configBin: {
        open: false,
      },
      binPosition: {},

      fill: [],
    };
  },

  beforeMount() {
    this.setAttributes();
    this.initialize();
  },

  mounted() {
    window.setInterval(this.update, 20);
  },

  methods: {
    setAttributes() {
      this.rectAttr = {
        width: this.gameWidth * 0.2,
        height: this.gameHeight * 0.15,
      };
      this.numeratorSnapTo = canvasTools.corner({
        x: this.gameWidth * 0.875,
        y: this.gameHeight * 0.2,
        width: this.rectAttr.width,
        height: this.rectAttr.height,
      });
      this.denominatorSnapTo = canvasTools.corner({
        x: this.gameWidth * 0.875,
        y: this.gameHeight * 0.7,
        width: this.rectAttr.width,
        height: this.rectAttr.height,
      });
      this.boundaries = {
        up: 0,
        down: this.gameHeight - this.rectAttr.height,
        left: 0,
        right: this.gameWidth * 0.75 - this.rectAttr.width,
      };
    },
    initialize() {
      this.drawNumerator();
      this.drawDenominator();
      this.drawBin();
    },
    update() {
      this.configNumerator.width = this.animation(
        this.configNumerator.width,
        this.rectAttr.width / this.numerator
      );
      let i;
      for (i = 0; i < this.fill.length; ++i) {
        if (this.fill[i] > 0) {
          this.configDenominator.rect[i].width = this.animation(
            this.configDenominator.rect[i].width,
            this.rectAttr.width * this.fill[i]
          );
        }
      }
      if (this.configDenominator.slice[i - 1].slices != this.denominator)
        this.configDenominator.slice[i - 1].slices = this.denominator;
    },
    animation(currentWidth, targetWidth) {
      if (Math.abs(currentWidth - targetWidth) < 1) {
        currentWidth = targetWidth;
      } else if (currentWidth < targetWidth) {
        currentWidth += 1;
      } else if (currentWidth > targetWidth) {
        currentWidth -= 1;
      }
      return currentWidth;
    },
    drawNumerator() {
      this.configNumerator.width = this.rectAttr.width / this.numerator;
      this.configNumerator.height = this.rectAttr.height;
      this.configNumerator.x = this.numeratorSnapTo.x;
      this.configNumerator.y = this.numeratorSnapTo.y;
    },
    drawDenominator() {
      let frame = {
        width: this.rectAttr.width,
        height: this.rectAttr.height,
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        fill: "white",
        stroke: "white",
        draggable: true,
        name: this.fill.length.toString(),
      };
      let rect = {
        strokeEnabled: false,
        visible: false,
        width: 0,
        height: this.rectAttr.height,
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        fill: "#4C5B3A",
        draggable: true,
        name: this.fill.length.toString(),
      };
      let slice = {
        width: this.rectAttr.width,
        height: this.rectAttr.height,
        stroke: "black",
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        sceneFunc: this.sliceSceneFunc,
        slices: this.denominator,
      };
      this.configDenominator.frame.push(frame);
      this.configDenominator.rect.push(rect);
      this.configDenominator.slice.push(slice);
      this.fill.push(0);
    },
    drawBin() {
      this.configBin.x = this.gameWidth * 0.01;
      this.configBin.y = this.gameHeight * 0.8;
      this.configBin.width = this.gameWidth * 0.15;
    },
    sliceSceneFunc(context, shape) {
      context.beginPath();
      context.setLineDash([5, 5]);
      let sliceWidth = shape.getAttr("width") / shape.getAttr("slices");
      for (let i = 1; i < shape.getAttr("slices"); ++i) {
        context.moveTo(sliceWidth * i, 0);
        context.lineTo(sliceWidth * i, shape.getAttr("height"));
      }
      context.stroke();
      context.closePath();
    },
    denominatorDragMove(e) {
      let id = e.target.attrs.name;
      if (this.configDenominator.rect[id].visible) {
        e.target.x(Math.max(e.target.x(), this.boundaries.left));
        e.target.x(Math.min(e.target.x(), this.boundaries.right));
        e.target.y(Math.max(e.target.y(), this.boundaries.up));
        e.target.y(Math.min(e.target.y(), this.boundaries.down));
      }
      this.configDenominator.frame[id].x = e.target.x();
      this.configDenominator.frame[id].y = e.target.y();
      this.configDenominator.rect[id].x = e.target.x();
      this.configDenominator.rect[id].y = e.target.y();
      this.configDenominator.slice[id].x = e.target.x();
      this.configDenominator.slice[id].y = e.target.y();
      if (
        canvasTools.distance(
          canvasTools.center(e.target.attrs),
          this.binPosition
        ) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = true;
      } else {
        this.configBin.open = false;
      }
    },
    denominatorDragEnd(e) {
      let id = e.target.attrs.name;
      if (!this.configDenominator.rect[id].visible) {
        if (canvasTools.isInBound(e.target.position(), this.boundaries)) {
          this.drawDenominator();
          this.configDenominator.rect[id].visible = true;
        } else {
          e.target.position(this.denominatorSnapTo);
          this.configDenominator.slice[id].x = this.denominatorSnapTo.x;
          this.configDenominator.slice[id].y = this.denominatorSnapTo.y;
        }
      }
      if (
        canvasTools.distance(
          canvasTools.center(e.target.attrs),
          this.binPosition
        ) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = false;
        this.destory(id);
      }
    },
    numeratorDragEnd(e) {
      for (let i = 0; i < this.fill.length; ++i) {
        if (this.configDenominator.rect[i].visible) {
          let range = {
            up: this.configDenominator.rect[i].y,
            down: this.configDenominator.rect[i].y + this.rectAttr.height,
            left: this.configDenominator.rect[i].x,
            right: this.configDenominator.rect[i].x + this.rectAttr.width,
          };
          if (
            canvasTools.isInBound(canvasTools.center(e.target.attrs), range)
          ) {
            if (this.fill[i] + 1 / this.numerator <= 1)
              this.fill[i] += 1 / this.numerator;
            this.$emit("addFill", this.fill);
            break;
          }
        }
      }
      e.target.x(this.numeratorSnapTo.x);
      e.target.y(this.numeratorSnapTo.y);
    },
    destory(id) {
      for (let object in this.configDenominator) {
        this.configDenominator[object][id] = null;
      }
      this.fill[id] = 0;
      this.$emit("addFill", this.fill);
    },
  },
};
</script>
