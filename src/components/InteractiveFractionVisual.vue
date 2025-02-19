<template>
  <div
    ref="fractionChart"
    class="fraction-chart"
    :class="{ 'fraction-chart--clickable': !displayOnly }"
    @click="handleShapeClick"
  >
    <canvas
      v-if="!isCupMode"
      ref="canvas"
      class="fraction-chart__canvas"
    ></canvas>
    <div
      v-else
      class="fraction-chart__cup"
      :class="{ 'fraction-chart__cup--disabled': displayOnly }"
    >
      <div
        v-for="line in denominatorLines"
        :key="line"
        class="fraction-chart__division-line"
        :style="{ top: `${(line / denominator) * 100}%` }"
      ></div>
      <div
        class="fraction-chart__water"
        :style="{ height: `${(numerator / denominator) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InteractiveFractionVisual",
  props: {
    Data: {
      type: Object,
      required: true,
      validator(value) {
        return value.Numerator >= 0 && value.Denominator > 0;
      },
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
      gameWidth: 0,
      gameHeight: 0,
      shape: this.Data.shape || "rect",
      ctx: null,
      fillColor: "#4C5B3A",
      strokeColor: "black",
      lineWidth: 1,
      dashPattern: [5, 5],
      rectScale: { width: 0.8, height: 0.6, x: 0.1, y: 0.2 },
      circleScale: 0.45,
      gridScale: { width: 0.8, height: 0.6, x: 0.1, y: 0.2 },
      isCupMode: this.Data.shape === "cup",
      answer: this.Data.answer,
      isRandomFill: this.Data.randomFill || false,
      randomIndices: [],
    };
  },
  computed: {
    denominatorLines() {
      return Array.from({ length: this.denominator - 1 }, (_, i) => i + 1);
    },
  },

  watch: {
    numerator() {
      this.drawShape();
    },
    shape() {
      this.randomIndices = [];
    },
  },
  mounted() {
    if (!this.isCupMode) {
      this.initializeScene();
      this.initializeCanvas();
    }
    this.drawShape();
    window.addEventListener("resize", this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    initializeScene() {
      this.gameWidth = this.$refs.fractionChart.offsetWidth;
      this.gameHeight = this.$refs.fractionChart.offsetHeight;
    },
    initializeCanvas() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      canvas.width = this.gameWidth;
      canvas.height = this.gameHeight;
      this.ctx = canvas.getContext("2d");
    },
    handleResize() {
      this.initializeScene();
      this.initializeCanvas();
      this.drawShape();
    },

    drawShape() {
      if (this.isCupMode || !this.ctx) return;

      this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
      this.setStrokeStyle();
      if (this.shape === "rect") {
        this.drawRectangle();
      } else if (this.shape === "circle") {
        this.drawCircle();
      } else if (this.shape === "grid") {
        this.drawGrid();
      }
    },

    setStrokeStyle() {
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.lineWidth;
    },

    drawRectangle() {
      const { width, height, x, y } = this.calculateRectDimensions();

      // 先繪製外框
      this.drawRectOutline(x, y, width, height);

      // 再繪製填充
      if (this.isRandomFill && this.displayOnly) {
        this.drawRandomRectFill(x, y, width, height);
      } else {
        this.drawRectFill(x, y, width, height);
      }

      // 最後繪製分隔線（虛線）
      this.ctx.setLineDash(this.dashPattern);
      this.drawRectDividers(x, y, width, height);
      this.ctx.setLineDash([]);
    },

    calculateRectDimensions() {
      return {
        width: this.gameWidth * this.rectScale.width,
        height: this.gameHeight * this.rectScale.height,
        x: this.gameWidth * this.rectScale.x,
        y: this.gameHeight * this.rectScale.y,
      };
    },

    drawRectOutline(x, y, width, height) {
      this.ctx.strokeRect(x, y, width, height);
    },

    drawRectFill(x, y, width, height) {
      this.ctx.fillStyle = this.fillColor;
      const fillWidth = (width * this.numerator) / this.denominator;
      this.ctx.fillRect(x, y, fillWidth, height);
    },

    drawRectDividers(x, y, width, height) {
      this.ctx.beginPath();
      for (let i = 1; i < this.denominator; i++) {
        const lineX = x + (width * i) / this.denominator;
        this.ctx.moveTo(lineX, y);
        this.ctx.lineTo(lineX, y + height);
      }
      this.ctx.stroke();
    },

    drawRandomRectFill(x, y, width, height) {
      if (this.randomIndices.length === 0) {
        this.generateRandomIndices(this.denominator);
      }

      this.ctx.fillStyle = this.fillColor;
      const sectionWidth = width / this.denominator;

      // 使用隨機位置填充
      for (let i = 0; i < this.numerator; i++) {
        const section = this.randomIndices[i];
        this.ctx.fillRect(x + section * sectionWidth, y, sectionWidth, height);
      }
    },

    drawCircle() {
      const { centerX, centerY, radius } = this.calculateCircleDimensions();

      // 先繪製圓形外框
      this.drawCircleOutline(centerX, centerY, radius);

      // 再繪製填充
      if (this.isRandomFill && this.displayOnly) {
        this.drawRandomCircleFill(centerX, centerY, radius);
      } else {
        this.drawCircleFill(centerX, centerY, radius);
      }

      // 最後繪製分隔線（虛線）
      this.ctx.setLineDash(this.dashPattern);
      this.drawCircleDividers(centerX, centerY, radius);
      this.ctx.setLineDash([]);
    },

    calculateCircleDimensions() {
      return {
        centerX: this.gameWidth / 2,
        centerY: this.gameHeight / 2,
        radius: Math.min(this.gameWidth, this.gameHeight) * this.circleScale,
      };
    },

    drawCircleOutline(centerX, centerY, radius) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    },

    drawCircleFill(centerX, centerY, radius) {
      this.ctx.fillStyle = this.fillColor;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + (Math.PI * 2 * this.numerator) / this.denominator
      );
      this.ctx.lineTo(centerX, centerY);
      this.ctx.fill();
    },

    drawCircleDividers(centerX, centerY, radius) {
      this.ctx.beginPath();
      for (let i = 1; i <= this.denominator; i++) {
        const angle = (i * Math.PI * 2) / this.denominator - Math.PI / 2;
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
      }
      this.ctx.stroke();
    },

    drawRandomCircleFill(centerX, centerY, radius) {
      if (this.randomIndices.length === 0) {
        this.generateRandomIndices(this.denominator);
      }

      this.ctx.fillStyle = this.fillColor;

      // 使用隨機位置填充扇形
      for (let i = 0; i < this.numerator; i++) {
        const section = this.randomIndices[i];
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        const startAngle =
          -Math.PI / 2 + (section * Math.PI * 2) / this.denominator;
        const endAngle = startAngle + (Math.PI * 2) / this.denominator;
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.fill();
      }
    },

    generateRandomIndices(totalSections) {
      // 創建所有可能的位置陣列
      const indices = Array.from({ length: totalSections }, (_, i) => i);
      // 打亂陣列
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      this.randomIndices = indices;
    },

    drawGrid() {
      const { width, height, x, y } = this.calculateGridDimensions();

      // 固定兩行，列數根據分母計算
      const rows = 2;
      const cols = Math.ceil(this.denominator / 2);

      const cellWidth = width / cols;
      const cellHeight = height / rows;

      // 先繪製網格外框
      this.ctx.strokeRect(x, y, width, height);

      // 如果是隨機模式且還沒有生成隨機位置，則生成
      if (
        this.isRandomFill &&
        this.displayOnly &&
        this.randomIndices.length === 0
      ) {
        this.generateRandomIndices(cols * rows);
      }

      // 填充選中的格子
      this.ctx.fillStyle = this.fillColor;
      if (this.isRandomFill && this.displayOnly) {
        // 使用隨機位置填充
        for (let i = 0; i < this.numerator; i++) {
          const index = this.randomIndices[i];
          const col = Math.floor(index / 2);
          const row = index % 2;
          this.ctx.fillRect(
            x + col * cellWidth,
            y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      } else {
        // 原本的上下上下順序填充
        for (let i = 0; i < this.numerator; i++) {
          const col = Math.floor(i / 2);
          const row = i % 2;
          this.ctx.fillRect(
            x + col * cellWidth,
            y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }

      // 最後繪製分隔線（虛線）
      this.ctx.setLineDash(this.dashPattern);
      for (let i = 1; i < cols; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i * cellWidth, y);
        this.ctx.lineTo(x + i * cellWidth, y + height);
        this.ctx.stroke();
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, y + cellHeight);
      this.ctx.lineTo(x + width, y + cellHeight);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    },

    calculateGridDimensions() {
      return {
        width: this.gameWidth * this.gridScale.width,
        height: this.gameHeight * this.gridScale.height,
        x: this.gameWidth * this.gridScale.x,
        y: this.gameHeight * this.gridScale.y,
      };
    },

    handleShapeClick() {
      if (this.displayOnly) return;

      this.numerator =
        this.numerator >= this.denominator ? 0 : this.numerator + 1;

      const isCorrect =
        this.numerator === this.answer.numerator &&
        this.denominator === this.answer.denominator;

      this.$emit("replyAnswer", isCorrect);
    },
  },
};
</script>

<style scoped>
.fraction-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: inherit;
  position: relative;
  &__canvas {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
  &--clickable {
    cursor: pointer;
  }
}

.fraction-chart__cup {
  position: relative;
  width: 60%;
  height: 80%;
  border: 3px solid #333;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.8);
  aspect-ratio: 2/3;
}

.fraction-chart__cup--disabled {
  cursor: default;
}

.fraction-chart__division-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #333;
  z-index: 2;
}

.fraction-chart__water {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #4fa7ff;
  transition: height 0.3s ease;
  z-index: 1;
}
</style>
