<template>
  <bin
    :config="configBin"
    @get-bin-pos="
      (e) => {
        binPosition = e;
      }
    "
  />
  <v-circle
    v-for="(frame, index) in configDenominator.frame"
    :key="index"
    :config="frame"
    @dragmove="denominatorDragMove"
    @dragend="denominatorDragEnd"
  />
  <v-shape
    v-for="(circle, index) in configDenominator.circle"
    :key="index"
    :config="circle"
    @dragmove="denominatorDragMove"
    @dragend="denominatorDragEnd"
  />
  <v-shape
    v-for="(slice, index) in configDenominator.slice"
    :key="index"
    :config="slice"
  />

  <v-shape :config="configNumerator" @dragend="numeratorDragEnd" />
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
      type: Object,
      required: true,
    },
    denominator: {
      type: Object,
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
        circle: [],
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
      this.numeratorSnapTo.x = this.gameWidth * 0.875;
      this.numeratorSnapTo.y = this.gameHeight * 0.2;
      this.denominatorSnapTo.x = this.gameWidth * 0.875;
      this.denominatorSnapTo.y = this.gameHeight * 0.7;
      this.radius = this.gameWidth * 0.075;
      this.boundaries = {
        up: this.radius,
        down: this.gameHeight - this.radius,
        left: this.radius,
        right: this.gameWidth * 0.75 - this.radius,
      };
    },
    initialize() {
      this.drawNumerator();
      this.drawDenominator();
      this.drawBin();
    },
    update() {
      this.configNumerator.endRadians = this.animation(
        this.configNumerator.endRadians,
        (Math.PI * 2) / this.numerator
      );
      let i;
      for (i = 0; i < this.fill.length; ++i) {
        if (this.fill[i] > 0) {
          this.configDenominator.circle[i].endRadians = this.animation(
            this.configDenominator.circle[i].endRadians,
            Math.PI * 2 * this.fill[i]
          );
        }
      }
      if (this.configDenominator.slice[i - 1].slices != this.denominator)
        this.configDenominator.slice[i - 1].slices = this.denominator;
    },
    animation(currentRadians, targetRadians) {
      if (Math.abs(currentRadians - targetRadians) < 0.02) {
        currentRadians = targetRadians;
      } else if (currentRadians < targetRadians) {
        currentRadians += 0.02;
      } else if (currentRadians > targetRadians) {
        currentRadians -= 0.02;
      }
      return currentRadians;
    },
    drawNumerator() {
      this.configNumerator.radius = this.radius;
      this.configNumerator.x = this.numeratorSnapTo.x;
      this.configNumerator.y = this.numeratorSnapTo.y;
      this.configNumerator.startRadians = 0;
      this.configNumerator.endRadians = (Math.PI * 2) / this.numerator;
      this.configNumerator.sceneFunc = this.circleSceneFunc;
    },
    drawDenominator() {
      let frame = {
        radius: this.radius,
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        fill: "white",
        stroke: "white",
        draggable: true,
        name: this.fill.length.toString(),
      };
      let circle = {
        strokeEnabled: false,
        visible: false,
        radius: this.radius,
        startRadians: 0,
        endRadians: 0,
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        fill: "#4C5B3A",
        sceneFunc: this.circleSceneFunc,
        draggable: true,
        name: this.fill.length.toString(),
      };
      let slice = {
        radius: this.radius,
        stroke: "black",
        x: this.denominatorSnapTo.x,
        y: this.denominatorSnapTo.y,
        sceneFunc: this.sliceSceneFunc,
        slices: this.denominator,
      };
      this.configDenominator.frame.push(frame);
      this.configDenominator.circle.push(circle);
      this.configDenominator.slice.push(slice);
      this.fill.push(0);
    },
    drawBin() {
      this.configBin.x = this.gameWidth * 0.01;
      this.configBin.y = this.gameHeight * 0.8;
      this.configBin.width = this.gameWidth * 0.15;
    },
    circleSceneFunc(context, shape) {
      context.beginPath();
      context.moveTo(0, 0);
      context.rotate(Math.PI * -0.5);
      context.arc(
        0,
        0,
        shape.getAttr("radius"),
        shape.getAttr("startRadians"),
        shape.getAttr("endRadians")
      );
      context.lineTo(0, 0);
      context.fillStrokeShape(shape);
      context.closePath();
    },
    sliceSceneFunc(context, shape) {
      context.beginPath();
      context.setLineDash([5, 5]);
      for (let i = 0; i < shape.getAttr("slices"); ++i) {
        context.moveTo(0, 0);
        context.lineTo(0, -shape.getAttr("radius"));
        context.moveTo(0, 0);
        context.rotate((Math.PI * 2) / shape.getAttr("slices"));
      }
      context.stroke();
      context.closePath();
    },
    denominatorDragMove(e) {
      let id = e.target.attrs.name;
      if (this.configDenominator.circle[id].visible) {
        e.target.x(Math.max(e.target.x(), this.boundaries.left));
        e.target.x(Math.min(e.target.x(), this.boundaries.right));
        e.target.y(Math.max(e.target.y(), this.boundaries.up));
        e.target.y(Math.min(e.target.y(), this.boundaries.down));
      }
      this.configDenominator.frame[id].x = e.target.x();
      this.configDenominator.frame[id].y = e.target.y();
      this.configDenominator.circle[id].x = e.target.x();
      this.configDenominator.circle[id].y = e.target.y();
      this.configDenominator.slice[id].x = e.target.x();
      this.configDenominator.slice[id].y = e.target.y();

      if (
        canvasTools.distance(e.target.position(), this.binPosition) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = true;
      } else {
        this.configBin.open = false;
      }
    },
    denominatorDragEnd(e) {
      let id = e.target.attrs.name;
      if (!this.configDenominator.circle[id].visible) {
        if (canvasTools.isInBound(e.target.position(), this.boundaries)) {
          this.drawDenominator();
          this.configDenominator.circle[id].visible = true;
        } else {
          e.target.position(this.denominatorSnapTo);
          this.configDenominator.slice[id].x = this.denominatorSnapTo.x;
          this.configDenominator.slice[id].y = this.denominatorSnapTo.y;
        }
      }
      if (
        canvasTools.distance(e.target.position(), this.binPosition) <
        this.gameWidth * 0.05
      ) {
        this.configBin.open = false;
        this.destory(id);
      }
    },
    numeratorDragEnd(e) {
      for (let i = 0; i < this.fill.length; ++i) {
        if (this.configDenominator.circle[i] == null) continue;
        if (this.configDenominator.circle[i].visible) {
          if (
            canvasTools.distance(
              e.target.position(),
              this.configDenominator.circle[i]
            ) <= this.radius
          ) {
            if (this.fill[i] + 1 / this.numerator <= 1) {
              this.fill[i] += 1 / this.numerator;
              this.$emit("addFill", this.fill);
            }
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
