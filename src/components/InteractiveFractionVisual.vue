<template>
  <div class="fraction-visual-container">
    <!-- 圖形顯示區域 -->
    <div
      ref="fractionChart"
      class="visual-content"
      :class="{ clickable: !displayOnly }"
      @click="handleShapeClick"
    >
      <!-- 當形狀是水杯時 -->
      <div
        v-if="shape === 'cup'"
        class="cup"
        :class="{ 'cup-disabled': displayOnly }"
      >
        <div
          v-for="line in denominatorLines"
          :key="line"
          class="division-line"
          :style="{ top: `${(line / denominator) * 100}%` }"
        ></div>
        <div
          class="water"
          :style="{ height: `${(numerator / denominator) * 100}%` }"
        ></div>
      </div>

      <!-- 當形狀是圓形或方形時 -->
      <v-stage v-else :config="stageConfig">
        <v-layer>
          <v-rect v-if="shape === 'rect'" :config="configNumerator"></v-rect>
          <v-shape v-else :config="configNumerator"></v-shape>
        </v-layer>
        <v-layer>
          <v-rect :config="configDenominatorBorder"></v-rect>
          <v-shape :config="configDenominator"></v-shape>
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script>
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
  name: "InteractiveFractionVisual",
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
  emits: ["replyAnswer"],
  data() {
    return {
      numerator: this.Data.Numerator || 0,
      denominator: this.Data.Denominator || 1,
      displayOnly: this.Data.DisplayOnly || false,
      gameWidth: 300,
      gameHeight: 300,
      shape: this.Data.shape || "rect", // 可以是 'rect', 'circle' 或 'cup'
    };
  },

  computed: {
    // 為水杯形狀添加分割線計算
    denominatorLines() {
      return Array.from({ length: this.denominator - 1 }, (_, i) => i + 1);
    },
    stageConfig() {
      return {
        width: this.gameWidth,
        height: this.gameHeight,
      };
    },

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
        : this.getCircleBorderConfig(shapeConfig);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initializeScene();
    });
  },

  methods: {
    handleShapeClick() {
      if (this.displayOnly) return;

      if (this.numerator >= this.denominator) {
        this.numerator = 0;
      } else {
        this.numerator++;
      }

      this.$emit("replyAnswer", {
        numerator: this.numerator,
        denominator: this.denominator,
      });
    },

    initializeScene() {
      const container = this.$refs.fractionChart;
      if (container) {
        this.gameWidth = container.offsetWidth;
        this.gameHeight = container.offsetHeight;
      }
    },

    // 圓形配置
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

    // 方形配置
    getRectConfig(fillRatio, config) {
      return {
        width: this.gameWidth * config.widthRatio * fillRatio,
        height: this.gameHeight * config.heightRatio,
        fill: "#4C5B3A",
        x: this.gameWidth * config.xOffset,
        y: this.gameHeight * config.yOffset,
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
        fill: "transparent",
      };
    },

    getRectSlicesConfig(config) {
      return {
        width: this.gameWidth * config.widthRatio,
        height: this.gameHeight * config.heightRatio,
        stroke: "black",
        strokeWidth: 1,
        x: this.gameWidth * config.xOffset,
        y: this.gameHeight * config.yOffset,
        sceneFunc: this.drawSlice,
        slices: this.denominator,
      };
    },

    drawSlice(context, shape) {
      const slices = shape.getAttr("slices");
      context.beginPath();
      context.setLineDash([5, 5]);
      context.lineWidth = shape.getAttr("strokeWidth");

      if (this.shape === "rect") {
        const width = shape.getAttr("width");
        const height = shape.getAttr("height");
        const sliceWidth = width / slices;

        for (let i = 1; i < slices; i++) {
          const x = sliceWidth * i;
          context.moveTo(x, 0);
          context.lineTo(x, height);
        }
      }

      context.strokeStyle = "black";
      context.stroke();
      context.closePath();
    },

    getCircleBorderConfig(config) {
      return {
        x: this.gameWidth / 2,
        y: this.gameHeight / 2,
        radius: this.gameWidth * config.radiusRatio,
        stroke: "black",
        strokeWidth: 2,
      };
    },

    getCircleSlicesConfig(config) {
      return {
        x: this.gameWidth / 2,
        y: this.gameHeight / 2,
        radius: this.gameWidth * config.radiusRatio,
        stroke: "black",
        strokeWidth: 2,
        sceneFunc: (context, shape) => {
          context.beginPath();
          context.setLineDash([5, 5]);

          // 繪製分割線
          for (let i = 0; i < this.denominator; i++) {
            const angle = (i * 2 * Math.PI) / this.denominator - Math.PI / 2;
            const endX = Math.cos(angle) * shape.getAttr("radius");
            const endY = Math.sin(angle) * shape.getAttr("radius");

            context.moveTo(0, 0);
            context.lineTo(endX, endY);
          }

          context.stroke();
        },
      };
    },
  },
};
</script>

<style scoped>
.fraction-visual-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.shape-selector {
  display: flex;
  gap: 10px;
}

.shape-selector button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.shape-selector button.active {
  background-color: #4c5b3a;
  color: white;
}

.visual-content {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
}

.clickable {
  cursor: pointer;
}

.fraction-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1rem;
}

/* 互動效果 */
.clickable:hover {
  opacity: 0.9;
}

/* 添加水杯相關樣式 */
.cup {
  position: relative;
  width: 40%;
  height: 80%;
  border: 3px solid #333;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.cup-disabled {
  cursor: default;
}

.division-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #333;
  z-index: 2;
}

.water {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #4fa7ff;
  transition: height 0.3s ease;
  z-index: 1;
}
</style>
