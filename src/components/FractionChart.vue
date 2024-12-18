<template>
  <div ref="fractionChart" class="fraction-chart">
    <v-stage :config="{ width: gameWidth, height: gameHeight }">
      <v-layer>
        <v-rect :config="configNumerator"></v-rect>
      </v-layer>

      <v-layer>
        <v-rect :config="configDenominatorBorder"></v-rect>
        <v-shape :config="configDenominator"></v-shape>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { objectEntries } from "@vueuse/core";

const SHAPE_CONFIGS = {
  circle: {
    radiusRatio: 0.4,
    startAngle: -Math.PI / 2,
    fullAngle: Math.PI * 2,
  },
  rect: {
    widthRatio: 0.8,
    heightRatio: 0.6,
    xOffset: 0.1,
    yOffset: 0.2,
  },
};

export default {
  name: "FractionChart",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      gameWidth: 150,
      gameHeight: 150,
      numerator: this.Data.numerator,
      denominator: this.Data.denominator,
      shape: this.Data.shape,
    };
  },
  computed: {
    configNumerator() {
      const shapeConfig = SHAPE_CONFIGS[this.shape];
      const fillRatio = this.numerator / this.denominator;
      return this.shape === "circle"
        ? this.getCircleConfig(fillRatio, shapeConfig)
        : this.getRectConfig(fillRatio, shapeConfig);
    },
    configDenominator() {
      const shapeConfig = SHAPE_CONFIGS[this.shape];
      return this.shape === "circle"
        ? this.getCircleSlicesConfig(shapeConfig)
        : this.getRectSlicesConfig(shapeConfig);
    },
    configDenominatorBorder() {
      const shapeConfig = SHAPE_CONFIGS[this.shape];
      return this.shape === "rect"
        ? this.getRectBorderConfig(shapeConfig)
        : null;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeScene();
    });
  },
  methods: {
    initializeScene() {
      const fractionChart = this.$refs.fractionChart;
      if (fractionChart) {
        this.gameWidth = fractionChart.offsetWidth * 0.8; // 確保有預設值
        this.gameHeight = fractionChart.offsetHeight * 0.8; // 確保有預設值
      } else {
        console.error("FractionChart not found!");
      }
    },
    getCircleConfig(fillRatio, config) {
      return {
        radius: this.gameWidth * config.radiusRatio,
        fill: "#4C5B3A",
        stroke: "transparent",
        x: this.gameWidth / 2,
        y: this.gameHeight / 2,
        startRadians: config.startAngle,
        endRadians: config.startAngle + config.fullAngle * fillRatio,
        sceneFunc(context, shape) {
          context.beginPath();
          context.moveTo(0, 0);
          context.arc(
            0,
            0,
            shape.getAttr("radius"),
            shape.getAttr("startRadians"),
            shape.getAttr("endRadians")
          );
          context.closePath();
          context.fillStyle = shape.getAttr("fill");
          context.fill();
        },
      };
    },
    getRectConfig(fillRatio, config) {
      return {
        width: this.gameWidth * config.widthRatio * fillRatio,
        height: this.gameHeight * config.heightRatio,
        fill: "#4C5B3A",
        x: this.gameWidth * config.xOffset,
        y: this.gameHeight * config.yOffset,
      };
    },
    getCircleSlicesConfig(config) {
      return {
        radius: this.gameWidth * config.radiusRatio,
        stroke: "black",
        strokeWidth: 2,
        x: this.gameWidth / 2,
        y: this.gameHeight / 2,
        sceneFunc: this.drawSlice,
        slices: this.denominator,
      };
    },
    getRectSlicesConfig(config) {
      return {
        width: this.gameWidth * config.widthRatio,
        height: this.gameHeight * config.heightRatio,
        stroke: "black",
        strokeWidth: 2,
        x: this.gameWidth * config.xOffset,
        y: this.gameHeight * config.yOffset,
        sceneFunc: this.drawSlice,
        slices: this.denominator,
      };
    },
    getCircleBorderConfig(config) {
      return {
        radius: this.gameWidth * config.radiusRatio,
        stroke: "black", // 邊框顏色
        strokeWidth: 2, // 邊框寬度
        x: this.gameWidth / 2,
        y: this.gameHeight / 2,
      };
    },
    getRectBorderConfig(config) {
      return {
        width: this.gameWidth * config.widthRatio,
        height: this.gameHeight * config.heightRatio,
        stroke: "black",
        strokeWidth: 2,
        x: this.gameWidth * config.xOffset,
        y: this.gameHeight * config.yOffset,
      };
    },
    drawSlice(context, shape) {
      const slices = shape.getAttr("slices");
      context.beginPath();
      context.setLineDash([5, 5]);
      context.lineWidth = shape.getAttr("strokeWidth");

      if (this.shape === "circle") {
        for (let i = 0; i < slices; i++) {
          context.moveTo(0, 0);
          context.lineTo(0, -shape.getAttr("radius"));
          context.rotate((Math.PI * 2) / slices);
        }
      } else if (this.shape === "rect") {
        const sliceWidth = shape.getAttr("width") / slices;
        for (let i = 1; i < slices; i++) {
          context.moveTo(sliceWidth * i, 0);
          context.lineTo(sliceWidth * i, shape.getAttr("height"));
        }
      }
      context.stroke();
      context.closePath();
    },
  },
};
</script>

<style scoped lang="scss">
.fraction-chart {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
