<template>
  <div class="container">
    <div class="board">
      <div class="row" :style="rowStyle[0].style">
        <div
          class="numBtn"
          v-for="i in GameData.digitsOfEachRow[0]"
          :style="rowStyle[0].button[i - 1]"
        >
          <numBtn :Data="test"></numBtn>
        </div>
      </div>
      <div class="row" :style="rowStyle[1].style">
        <div
          class="numBtn"
          v-for="i in GameData.digitsOfEachRow[1]"
          :style="rowStyle[0].button[i]"
        >
          <numBtn :Data="test"></numBtn>
        </div>
      </div>
      <hr />
      <div
        class="row"
        v-for="i in GameData.digitsOfEachRow.length - 3"
        :style="rowStyle[i + 1].style"
      >
        <div class="numBtn" v-for="j in GameData.digitsOfEachRow[i + 1]">
          <numBtn :Data="test"></numBtn>
        </div>
      </div>
      <hr />
      <div
        class="row"
        :style="rowStyle[GameData.digitsOfEachRow.length - 1].style"
      >
        <div
          class="numBtn"
          v-for="i in GameData.digitsOfEachRow[
            GameData.digitsOfEachRow.length - 1
          ]"
        >
          <numBtn :Data="test"></numBtn>
        </div>
      </div>
    </div>
    <div class="drawingBoard" :style="canvasStyle">
      <drawingBoard :Data="configBrush" ref="canvas"></drawingBoard>
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
  data() {
    return {
      rowStyle: [],
      test: {
        color: "gray",
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

  beforeMount() {
    this.configBrush = this.brush;
    this.setStyles();
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
    setStyles() {
      for (let i in this.GameData.digitsOfEachRow) {
        let rowStyle = {
          style: {
            height: 100 / this.GameData.digitsOfEachRow.length + "%",
          },
          button: [],
        };
        if (i < 2) {
          for (let j = 0; j < this.GameData.digitsOfEachRow[i]; ++j) {
            let btnStyle = {
              gridColumn: j + 10 - this.GameData.digitsOfEachRow[i],
              gridRow: 1,
            };
            rowStyle.button.push(btnStyle);
          }
        } else if (i < this.GameData.digitsOfEachRow.length - 1) {
        } else {
        }
        this.rowStyle.push(rowStyle);
      }
      console.log(this.rowStyle);
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
.row {
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 10px;
  padding: 10px;
  margin: auto;
}
.numBtn {
  aspect-ratio: 2/3;
  width: fit-content;
  padding: 0;
}
hr {
  margin: 0;
  padding: 0;
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
  border-radius: 10px;
}
.function button {
  border: none;
  margin: 15px;
  width: 20%;
}

.drawingBoard {
  height: 95%;
  width: 95%;
  position: absolute;
  top: 0;
}
</style>
