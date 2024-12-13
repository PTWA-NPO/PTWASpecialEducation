<template>
  <div class="OutterContainer">
    <div v-if="Data.Text != undefined" class="TextOnly">
      <p class="Division">{{ Data.Text }}{{ Data.Unit }}</p>
    </div>
    <div v-else class="Division">
      <p class="Child">
        {{ childScore }}
      </p>
      <hr class="Fraction-line" />
      <p class="Mother">
        {{ motherScore }}
      </p>
    </div>
    <p v-if="Data.Text == undefined">
      {{ Data.Unit }}
    </p>
    <div ref="container" class="container">
      <canvas ref="canvas" @click="handleClick" />
    </div>
  </div>
</template>
<script>
export default {
  name: "CircleChart",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      colors: Array(this.Data.Mother).fill(null), // 儲存每個部分的顏色
      childScore: this.Data.Child, // 假設的數學分數
      motherScore: this.Data.Mother, // 假設的數學分數
      division: this.Data.Mother, // 將分數分成幾個部分
      centerX: 0,
      centerY: 0,
      radius: 0,
      AnswerRecord: Array(this.Data.Mother).fill(false),
    };
  },
  mounted() {
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
    this.drawPieChart();
    this.AnswerRecord = [];
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeCanvas);
  },
  methods: {
    resizeCanvas() {
      const container = this.$refs.container;
      const canvas = this.$refs.canvas;
      let size = Math.min(container.clientWidth, container.clientHeight);
      size = size * 0.8; // 留白
      canvas.width = size;
      canvas.height = size;
      this.centerX = size / 2;
      this.centerY = size / 2;
      this.radius = size / 2 - 2;
      this.drawPieChart();
    },
    drawPieChart() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空畫布
      ctx.fillStyle = "white"; // 設置白色底
      ctx.lineWidth = 3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const angleStep = (2 * Math.PI) / this.division;
      for (let i = 0; i < this.division; i++) {
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.arc(
          this.centerX,
          this.centerY,
          this.radius,
          i * angleStep,
          (i + 1) * angleStep
        );
        ctx.closePath();
        ctx.fillStyle = this.colors[i] ? this.colors[i] : "white"; // 使用已選顏色或預設顏色
        ctx.fill();
        ctx.stroke();
      }
    },
    getSegmentIndex(x, y) {
      const dx = x - this.centerX;
      const dy = y - this.centerY;
      const angle = Math.atan2(dy, dx);
      const adjustedAngle = angle >= 0 ? angle : 2 * Math.PI + angle;
      return Math.floor(adjustedAngle / ((2 * Math.PI) / this.division));
    },
    handleClick(event) {
      const canvas = this.$refs.canvas;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const index = this.getSegmentIndex(x, y);
      this.AnswerRecord[index] = !this.AnswerRecord[index];
      this.colors[index] = this.colors[index]
        ? null
        : `hsl(${Math.random() * 360}, 100%, 50%)`; // 隨機顏色或取消顏色
      this.drawPieChart();
      this.ReplyAnswer();
    },
    ReplyAnswer() {
      let temp = 0;
      this.AnswerRecord.forEach((element) => {
        if (element == true) {
          temp += 1;
        }
      });
      if (temp == this.childScore) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.TextOnly {
  grid-column: 1 / 3;
}
.OutterContainer {
  width: 100%;
  height: 100%;
  display: grid;
  font-size: x-large;
  grid-template-columns: 1fr 1fr 4fr;
}
.container {
  display: flex;
  flex-direction: row;
  grid-column: 3 / 4;
  gap: 1rem;
  width: 100%;
  height: 100%;
  position: relative;
  justify-content: space-between;
  align-items: center;
}

.Division {
  display: inline-block;
  text-align: center;
  font-size: 2rem;
  line-height: 2; /* 設置行高 */
  vertical-align: middle; /* 垂直對齊 */
  .Child {
    margin: 0;
  }
  .Mother {
    margin: 0;
  }
  .Fraction-line {
    margin: 0;
    border: none;
    border-top: 2px solid black;
    width: 2em;
  }
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
</style>
