<template>
  <div class="container">
    <div class="board">
      <div class="question">
        <numBtn :Data="test"></numBtn>
        <numBtn :Data="test2"></numBtn>
      </div>
      <hr />
      <div class="calculation"></div>
      <hr />
      <div class="answer"></div>
    </div>
    <div class="drawingBoard" :style="canvasStyle">
      <drawingBoard ref="canvas" :Data="configBrush"></drawingBoard>
    </div>
    <div class="function">
      <button @click="drawingFunc('brush')">{{ brushStatusBtn }}</button>
      <button @click="drawingFunc('clear')">clear</button>
      <button @click="drawingFunc('eraser')">eraser</button>
      <button @click="drawingFunc('visibility')">
        {{ drawingBoardStatusBtn }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  components: {
    drawingBoard: defineAsyncComponent(() =>
      import("@/components/DrawingBoard.vue")
    ),
    numBtn: defineAsyncComponent(() =>
      import("@/components/ButtonWithNumPad.vue")
    ),
  },

  props: {
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      test: {
        color: "red",
        padPosition: "lowerRight",
      },
      test2: {
        color: "blue",
        padPosition: "lowerRight",
      },
      brushStatusBtn: "brush",
      drawingBoardStatusBtn: "hide",
      brush: {
        color: "black",
        size: 5,
      },
      eraser: {
        color: "eraser",
        size: 20,
      },
      canvasStyle: {
        visibility: "visible",
        zIndex: -1,
      },
    };
  },
  beforeMount() {
    this.configBrush = this.brush;
  },

  mounted() {},

  methods: {
    drawingFunc(btn) {
      switch (btn) {
        case "brush":
          if (this.canvasStyle.zIndex == -1) {
            this.canvasStyle.zIndex = 1;
            this.configBrush = this.brush;
            this.brushStatusBtn = "control";
          } else if (this.canvasStyle.zIndex == 1) {
            this.canvasStyle.zIndex = -1;
            this.brushStatusBtn = "brush";
          }
          break;
        case "clear":
          this.$refs.canvas.clear();
          break;
        case "eraser":
          this.canvasStyle.zIndex = -1;
          this.configBrush = this.eraser;
          this.canvasStyle.zIndex = 1;
          this.brushStatusBtn = "control";
          break;
        case "visibility":
          if (this.canvasStyle.visibility == "visible") {
            this.canvasStyle.visibility = "hidden";
            this.drawingBoardStatusBtn = "show";
          } else if (this.canvasStyle.visibility == "hidden") {
            this.canvasStyle.visibility = "visible";
            this.drawingBoardStatusBtn = "hide";
          }
          break;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
}

.board {
  height: 90%;
  width: 90%;
  margin: auto;
}
.question {
  height: 35%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}
.calculation {
  height: 35%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}
.answer {
  height: 17.5%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 10px;
  padding: 10px;
}
hr {
  opacity: 100;
  border: 1px solid black;
}

.function {
  position: relative;
  z-index: 2;
  height: 10%;
  width: 70%;
  background-color: aqua;
  display: flex;
  justify-content: space-evenly;
  margin: auto;
}
.function button {
  border: none;
  margin: 2%;
  width: 20%;
}

.drawingBoard {
  height: 95%;
  width: 95%;
  position: absolute;
  top: 0;
}
</style>
