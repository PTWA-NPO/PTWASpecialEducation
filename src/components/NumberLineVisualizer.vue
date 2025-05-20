<template>
  <div ref="numberLineContainer" class="number-line">
    <v-stage :config="stageConfig">
      <v-layer>
        <!-- 主線 -->
        <v-line :config="mainLineConfig" />

        <!-- 刻度線 -->
        <v-line
          v-for="(line, index) in tickLines"
          :key="`tick-line-${index}`"
          :config="line"
        />

        <!-- 總數連接線 -->
        <v-shape :config="curvedConnectorConfig" />

        <!-- 數字標籤 -->
        <v-shape
          v-for="(circle, index) in numberCircles"
          :key="`number-circle-${index}`"
          :config="circle"
        />
        <v-text
          v-for="(text, index) in numberLabels"
          :key="`number-label-${index}`"
          :config="text"
        />

        <v-shape />

        <!-- 總數標籤 -->
        <v-text :config="totalLabel" />

        <!-- 區段標籤 -->
        <v-text
          v-for="(label, index) in segmentLabels"
          :key="`segment-label-${index}`"
          :config="label"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
export default {
  name: "NumberLineVisualizer",
  props: {
    Data: {
      type: Object,
      required: true,
      default: () => ({
        total: 100,
        segments: 10,
        stepLabel: "10",
        displayOneSegment: false,
      }),
    },
  },
  data() {
    return {
      containerWidth: 0,
      containerHeight: 0,
      padding: 20,
      lineHeight: 3,
      tickHeight: 15,
      fontSize: 16,
    };
  },
  computed: {
    stageConfig() {
      return {
        width: this.containerWidth,
        height: this.containerHeight,
      };
    },
    mainLineConfig() {
      return {
        points: [
          this.padding,
          this.containerHeight / 2,
          this.containerWidth - this.padding,
          this.containerHeight / 2,
        ],
        stroke: "black",
        strokeWidth: this.lineHeight,
      };
    },
    tickLines() {
      const lines = [];
      const segmentWidth = this.calculateSegmentWidth();

      for (let i = 0; i <= this.Data.segments; i++) {
        if (this.Data.displayOneSegment && i < this.Data.segments && i > 1)
          continue;
        const x = this.padding + i * segmentWidth;
        lines.push({
          points: [
            x,
            this.containerHeight / 2 - this.tickHeight / 2,
            x,
            this.containerHeight / 2 + this.tickHeight / 2,
          ],
          stroke: "black",
          strokeWidth: this.lineHeight,
        });
      }

      return lines;
    },
    numberLabels() {
      const labels = [];
      const segmentWidth = this.calculateSegmentWidth();
      const y = this.containerHeight / 2 - this.tickHeight - this.fontSize / 2;

      for (let i = 0; i < this.Data.segments; i++) {
        const x = this.padding + (i + 0.5) * segmentWidth;
        labels.push({
          x: x,
          y: y,
          text: (i + 1).toString(),
          fontSize: this.fontSize,
          align: "center",
          fill: "purple",
        });
        if (this.Data.displayOneSegment) {
          // 添加 "...?" 標籤，位置更靠近數字標籤
          labels.push({
            x: x + this.fontSize * 1.5,
            y: y,
            text: "...?",
            fontSize: this.fontSize,
            align: "left",
            fill: "purple",
          });
          break;
        }
      }

      return labels;
    },
    numberCircles() {
      const circles = [];
      const segmentWidth = this.calculateSegmentWidth();
      const y = this.containerHeight / 2 - this.tickHeight - this.fontSize / 2;
      const radius = this.fontSize * 0.7; // 圓形半徑

      for (let i = 0; i < this.Data.segments; i++) {
        const x = this.padding + (i + 0.5) * segmentWidth;
        circles.push({
          sceneFunc: function (context) {
            context.beginPath();
            context.arc(
              x + radius / 2,
              y + radius / 2,
              radius,
              0,
              Math.PI * 2,
              false
            );
            context.strokeStyle = "purple";
            context.lineWidth = 2;
            context.stroke();
          }.bind(this),
        });
        if (this.Data.displayOneSegment) break;
      }

      return circles;
    },
    totalLabel() {
      return {
        x: this.containerWidth / 2 - this.fontSize,
        y: this.containerHeight / 2 - this.containerHeight * 0.4,
        text: this.Data.total.toString(),
        fontSize: this.fontSize,
        align: "center",
        fill: "red",
      };
    },
    curvedConnectorConfig() {
      const totalY = this.containerHeight / 2 - this.containerHeight * 0.4;
      const centerX = this.containerWidth / 2;
      const lineY = this.containerHeight / 2;
      const controlPointY = totalY + this.containerHeight * 0.05;
      const startLabelY =
        this.containerHeight / 2 + this.tickHeight + this.fontSize / 2;
      const segmentWidth = this.calculateSegmentWidth();

      return {
        sceneFunc: function (context) {
          // 繪製起點標籤連接線
          context.beginPath();
          context.strokeStyle = "black";
          context.lineWidth = 2;

          // 為每個區段繪製連接線
          for (let i = 1; i <= this.Data.segments; i++) {
            const segmentStartX = this.padding + (i - 1) * segmentWidth;
            const segmentEndX = this.padding + i * segmentWidth;
            this.drawStartLabelConnector(
              context,
              segmentStartX,
              lineY,
              startLabelY,
              segmentWidth
            );
            this.drawSegmentConnector(
              context,
              segmentEndX,
              lineY,
              startLabelY,
              segmentWidth
            );
            if (this.Data.stepLabel === "?" || this.Data.displayOneSegment)
              break;
          }
          context.stroke();

          // 繪製紅色曲線
          context.beginPath();
          context.strokeStyle = "red";
          context.lineWidth = 2;
          this.drawLeftCurve(context, lineY, centerX, controlPointY, totalY);
          this.drawRightCurve(context, centerX, controlPointY, totalY, lineY);
          context.stroke();
        }.bind(this),
      };
    },
    segmentLabels() {
      const labels = [];
      const segmentWidth = this.calculateSegmentWidth();
      const y = this.containerHeight / 2 + this.tickHeight + this.fontSize / 2;

      for (let i = 0; i < this.Data.segments; i++) {
        const x = this.padding + (i + 0.5) * segmentWidth;
        labels.push({
          x: x,
          y: y,
          text: this.Data.stepLabel,
          fontSize: this.fontSize,
          fill: "blue",
          align: "center",
          fontStyle: "bold",
        });
        if (this.Data.stepLabel === "?" || this.Data.displayOneSegment) break;
      }

      return labels;
    },
  },
  mounted() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  },
  methods: {
    updateDimensions() {
      if (this.$refs.numberLineContainer) {
        this.containerWidth = this.$refs.numberLineContainer.clientWidth;
        this.containerHeight = this.$refs.numberLineContainer.clientHeight;
      }
    },
    calculateSegmentWidth() {
      return (this.containerWidth - 2 * this.padding) / this.Data.segments;
    },
    drawStartLabelConnector(
      context,
      segmentStartX,
      lineY,
      startLabelY,
      segmentWidth
    ) {
      context.moveTo(segmentStartX, lineY);
      context.quadraticCurveTo(
        segmentStartX,
        startLabelY - 10,
        segmentStartX + segmentWidth * 0.2,
        startLabelY
      );
    },
    drawSegmentConnector(
      context,
      segmentEndX,
      lineY,
      startLabelY,
      segmentWidth
    ) {
      context.moveTo(segmentEndX, lineY);
      context.quadraticCurveTo(
        segmentEndX,
        startLabelY - 10,
        segmentEndX - segmentWidth * 0.2,
        startLabelY
      );
    },
    drawLeftCurve(context, lineY, centerX, controlPointY, totalY) {
      context.moveTo(this.padding, lineY);
      context.quadraticCurveTo(
        this.padding + (centerX - this.padding) * 0.01,
        controlPointY,
        centerX - (centerX - this.padding) * 0.8,
        totalY + this.fontSize * 0.3
      );
    },
    drawRightCurve(context, centerX, controlPointY, totalY, lineY) {
      const rightStartX = centerX + (centerX - this.padding) * 0.8;
      const rightControlX =
        this.containerWidth - this.padding - (centerX - this.padding) * 0.01;
      const rightEndX = this.containerWidth - this.padding;
      const rightY = totalY + this.fontSize * 0.3;

      context.moveTo(rightStartX, rightY);
      context.quadraticCurveTo(rightControlX, controlPointY, rightEndX, lineY);
    },
  },
};
</script>

<style scoped>
.number-line {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 150px;
  min-width: 100px;
  justify-content: center;
  align-items: center;
}
</style>
