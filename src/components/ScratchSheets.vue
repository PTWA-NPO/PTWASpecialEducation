<template>
  <div class="scratchsheet-overlay">
    <div class="sheet-container">
      <div ref="con" class="canvas-container">
        <canvas
          ref="canvas"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        />
      </div>

      <div class="option-menu">
        <div class="option-container">
          <div class="btn-title">筆刷大小</div>
          <div class="brush-size-option">
            <!--&#9679-->
            <button style="font-size: 10px" @click="changeLineWidth(5)">
              &#9679;
            </button>
            <button style="font-size: 20px" @click="changeLineWidth(10)">
              &#9679;
            </button>
            <button style="font-size: 30px" @click="changeLineWidth(15)">
              &#9679;
            </button>
          </div>
        </div>
        <div class="option-container">
          <div class="btn-title">顏色選盤</div>
          <div class="color-option">
            <button
              class="black-btn"
              @click.prevent="setcolor('#000000')"
              @touchend="brushColor = '#000000'"
            >
              黑色
            </button>
            <button
              class="white-btn"
              @click.prevent="setcolor('#ffffff')"
              @touchend="brushColor = '#ffffff'"
            >
              白色
            </button>
            <button
              class="green-btn"
              @click="setcolor('#09814A')"
              @touchend="brushColor = '#09814A'"
            >
              綠色
            </button>
            <button
              class="red-btn"
              @click="setcolor('#F13030')"
              @touchstart="brushColor = '#F13030'"
            >
              紅色
            </button>
            <button
              class="blue-btn"
              @click="setcolor('#0D21A1')"
              @touchend="brushColor = '#0D21A1'"
            >
              藍色
            </button>
            <button
              class="yellow-btn"
              @click="setcolor('#FFD166')"
              @touchend="brushColor = '#FFD166'"
            >
              黃色
            </button>
          </div>
        </div>

        <div class="operation-option">
          <button @click="clearCanvas" @touchend="clearCanvas">清空</button>
        </div>
        <button
          class="exit-btn"
          data-bs-dismiss="modal"
          @click="closeCanvas"
          @touchend="closeCanvas"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "CanvasDrawing",
  emits: ["closeSheet"],
  data() {
    return {
      brushSize: 5,
      brushColor: "#198754",
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      ctx: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      prevPinchDistance: 0,
    };
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.resizeCanvas();
    const observer = new ResizeObserver(this.resizeCanvas);
    observer.observe(this.$refs.con);
  },
  updated() {
    this.resizeCanvas();
  },
  methods: {
    resizeCanvas() {
      const rect = this.$refs.con.getBoundingClientRect();
      const scaleFactor = 2; // Increase this factor for higher resolution
      this.$refs.canvas.width = rect.width * scaleFactor;
      this.$refs.canvas.height = rect.height * scaleFactor;
      this.$refs.canvas.style.width = `${rect.width}px`;
      this.$refs.canvas.style.height = `${rect.height}px`;

      // Adjust the context scaling to handle higher resolution
      this.ctx.scale(scaleFactor, scaleFactor);
      this.initCanvas();
    },
    setcolor(color) {
      this.brushColor = color;
    },
    changeLineWidth(width) {
      this.brushSize = width;
    },
    initCanvas() {
      this.ctx.lineWidth = this.brushSize;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.brushColor;
    },
    handleMouseDown(event) {
      this.isDrawing = true;
      this.ctx.beginPath();
      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - this.offsetX) / this.scale;
      const y = (event.clientY - rect.top - this.offsetY) / this.scale;
      this.ctx.moveTo(x, y);
      this.lastX = x;
      this.lastY = y;
    },
    handleMouseMove(event) {
      if (!this.isDrawing) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - this.offsetX) / this.scale;
      const y = (event.clientY - rect.top - this.offsetY) / this.scale;
      this.ctx.lineTo(x, y);
      this.ctx.lineWidth = this.brushSize;
      this.ctx.strokeStyle = this.brushColor;
      this.ctx.stroke();
      this.lastX = x;
      this.lastY = y;
    },
    handleMouseUp() {
      this.isDrawing = false;
      this.ctx.closePath();
    },
    handleTouchStart(event) {
      event.preventDefault();
      if (event.touches.length === 1) {
        this.isDrawing = true;
        this.ctx.beginPath();
        const rect = this.$refs.canvas.getBoundingClientRect();
        const x =
          (event.touches[0].clientX - rect.left - this.offsetX) / this.scale;
        const y =
          (event.touches[0].clientY - rect.top - this.offsetY) / this.scale;
        this.ctx.moveTo(x, y);
        this.lastX = x;
        this.lastY = y;
      } else if (event.touches.length === 2) {
        this.prevPinchDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
      }
    },
    handleTouchMove(event) {
      event.preventDefault();
      if (event.touches.length === 1 && this.isDrawing) {
        const rect = this.$refs.canvas.getBoundingClientRect();
        const x =
          (event.touches[0].clientX - rect.left - this.offsetX) / this.scale;
        const y =
          (event.touches[0].clientY - rect.top - this.offsetY) / this.scale;
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.stroke();
        this.lastX = x;
        this.lastY = y;
      } else if (event.touches.length === 2) {
        const currentPinchDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
        const deltaScale = currentPinchDistance / this.prevPinchDistance;
        this.scale *= deltaScale;
        this.prevPinchDistance = currentPinchDistance;
      } else if (event.touches.length === 3) {
        const dx = event.touches[0].clientX - event.touches[2].clientX;
        const dy = event.touches[0].clientY - event.touches[2].clientY;
        this.offsetX += dx / this.scale;
        this.offsetY += dy / this.scale;
      }
    },
    handleTouchEnd() {
      this.isDrawing = false;
      this.ctx.closePath();
    },
    clearCanvas() {
      this.ctx.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
    },
    closeCanvas() {
      this.$emit("closeSheet");
    },
  },
};
</script>

<style lang="scss" scoped>
.scratchsheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0); /* 背景半透明 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 保持在頂層 */
}

.sheet-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: rgba(0, 0, 0, 0); /* 背景透明 */
  border: none;
  box-shadow: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
.canvas-container {
  width: 85%;
  height: 90%;
  align-self: end;
}
canvas {
  border: 2px solid #a5adb1;
  display: block;
  margin: 0 auto;
}

.option-menu {
  background-color: #d5dfe4;
  height: 90%;
  align-self: end;
  width: 15%;
  margin-top: 5%;
}
.btn-title {
  width: 100%;
  height: 40px;
  background-color: #a5adb1;
  text-align: center;
  align-content: center;
  font-weight: bold;
  font-size: larger;
}

.brush-size-option {
  display: flex;
  justify-content: space-between;
  margin: 10px;
}
.brush-size-option button {
  width: 30%;
  background-color: #687174;
  height: 50px;
  color: #181a1b;
}
.brush-size-option button:hover {
  width: 30%;
  background-color: #494f52;
}

.color-option {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
}
.color-option button {
  width: 100%;
  height: 50px;
}

.black-btn {
  background-color: #000000;
  color: #ffffff;
}
.black-btn:hover {
  background-color: #2c2c2c;
}

.white-btn {
  background-color: #ffffff;
}
.white-btn:hover {
  background-color: #868686;
}

.green-btn {
  background-color: #09814a;
}
.green-btn:hover {
  background-color: #075c36;
}

.red-btn {
  background-color: #f13030;
}
.red-btn:hover {
  background-color: #ac2424;
}

.blue-btn {
  background-color: #0d21a1;
}
.blue-btn:hover {
  background-color: #091670;
}

.yellow-btn {
  background-color: #ffd166;
}
.yellow-btn:hover {
  background-color: #b49449;
}

.operation-option {
  width: 100%;
  display: flex;

  justify-content: center;
  flex-wrap: wrap;
}
.operation-option button {
  width: 60%;
  height: 50px;
  background-color: #a5adb1;
}
.operation-option button:hover {
  background-color: #687174;
}

.exit-btn {
  width: 5%;
  height: 50px;
  background-color: #a5adb1;
  position: absolute;
  bottom: 20px;
  right: 20px;
}
.exit-btn:hover {
  background-color: #687174;
}

button {
  border: none;
}
</style>
