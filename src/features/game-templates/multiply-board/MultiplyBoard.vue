<template>
  <div class="container">
    <div class="board">
      <div class="unit" :style="unitRowStyle">
        <button v-for="(i, idx) in unitStyle" :key="idx" :style="i">
          {{ i.text }}
        </button>
      </div>
      <div ref="row" class="row" :style="btnRowStyle">
        <button
          v-for="i in rowStyle[0].btnStyle.length"
          :key="i"
          class="numBtn"
          :style="rowStyle[0].btnStyle[i - 1]"
          @click="btnClick($event, 0, i - 1)"
        >
          {{ rowStyle[0].btnStyle[i - 1].value }}
        </button>
      </div>
      <div class="row" :style="btnRowStyle">
        <button
          v-for="i in rowStyle[1].btnStyle.length"
          :key="i"
          class="numBtn"
          :style="rowStyle[1].btnStyle[i - 1]"
          @click="btnClick($event, 1, i - 1)"
        >
          {{ rowStyle[1].btnStyle[i - 1].value }}
        </button>
      </div>
      <hr />
      <div
        v-for="i in gameData.digitsOfEachRow.length - 3"
        :key="i"
        class="row"
        :style="btnRowStyle"
      >
        <button
          v-for="j in rowStyle[i + 1].btnStyle.length"
          :key="j"
          class="numBtn"
          :style="rowStyle[i + 1].btnStyle[j - 1]"
          @click="btnClick($event, i + 1, j - 1)"
        >
          {{ rowStyle[i + 1].btnStyle[j - 1].value }}
        </button>
      </div>
      <hr />
      <div class="row" :style="btnRowStyle">
        <button
          v-for="i in rowStyle[gameData.digitsOfEachRow.length - 1].btnStyle
            .length"
          :key="i"
          class="numBtn"
          :style="rowStyle[gameData.digitsOfEachRow.length - 1].btnStyle[i - 1]"
          @click="btnClick($event, gameData.digitsOfEachRow.length - 1, i - 1)"
        >
          {{
            rowStyle[gameData.digitsOfEachRow.length - 1].btnStyle[i - 1].value
          }}
        </button>
      </div>
    </div>
    <div class="drawingBoard" :style="canvasStyle">
      <drawingBoard ref="canvas" :component-config="configBrush"></drawingBoard>
    </div>
    <div class="function">
      <button @click="drawingFunc('brush')">{{ brushStatusBtn }}</button>
      <button @click="drawingFunc('clear')">清除</button>
      <button @click="drawingFunc('eraser')">橡皮擦</button>
      <button @click="drawingFunc('visibility')">
        {{ drawingBoardStatusBtn }}
      </button>
      <button @click="checkAnswer()">檢查答案</button>
    </div>
    <div class="number-pad">
      <numPad
        v-if="showPad"
        :component-config="numPadData"
        @button-clicked="handleNumPad"
      />
    </div>
  </div>
</template>

<script>
import { getGameStaticAssets } from "@/lib/get-assets.js";
import { defineAsyncComponent } from "vue";
import fetchJson from "@/lib/fetch-json";
export default {
  components: {
    drawingBoard: defineAsyncComponent(
      () => import("@/components/DrawingBoard.vue")
    ),
    numPad: defineAsyncComponent(() => import("@/components/FloatNumPad.vue")),
  },

  props: {
    gameData: {
      type: Object,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      unitRowStyle: {},
      btnRowStyle: {},
      rowStyle: [],
      unitStyle: [],
      numPadData: null,
      showPad: false,
      currentInputBtn: null,

      brushStatusBtn: "畫筆",
      drawingBoardStatusBtn: "隱藏",
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
    this.setRowStyles();
  },

  async mounted() {
    this.unit = await fetchJson(
      getGameStaticAssets("MultiplyBoard", "unit.json")
    );
    this.unit = this.unit.data.unit;
    this.setUnit();
  },

  methods: {
    drawingFunc(btn) {
      switch (btn) {
        case "brush":
          if (this.canvasStyle.zIndex === -1) {
            this.canvasStyle.zIndex = 1;
            this.configBrush = this.brush;
            this.brushStatusBtn = "控制";
          } else if (this.canvasStyle.zIndex === 1) {
            this.canvasStyle.zIndex = -1;
            this.brushStatusBtn = "畫筆";
          }
          break;
        case "clear":
          this.$refs.canvas.clear();
          break;
        case "eraser":
          this.canvasStyle.zIndex = -1;
          this.configBrush = this.eraser;
          this.canvasStyle.zIndex = 1;
          this.brushStatusBtn = "控制";
          break;
        case "visibility":
          if (this.canvasStyle.visibility === "visible") {
            this.canvasStyle.visibility = "hidden";
            this.drawingBoardStatusBtn = "顯示";
          } else if (this.canvasStyle.visibility === "hidden") {
            this.canvasStyle.visibility = "visible";
            this.drawingBoardStatusBtn = "隱藏";
          }
          break;
      }
    },
    setRowStyles() {
      this.btnRowStyle = {
        height: 90 / this.gameData.digitsOfEachRow.length + "%",
      };
      for (const i in this.gameData.digitsOfEachRow) {
        const rowStyle = {};
        rowStyle.btnStyle = this.setBtnStyle(i);
        this.rowStyle.push(rowStyle);
      }
    },
    setBtnStyle(i) {
      this.maxDigit = Math.max(...this.gameData.digitsOfEachRow);
      const btnStyle = [];
      let btnColor;
      if (i === this.gameData.digitsOfEachRow.length - 1) btnColor = "pink";
      else btnColor = "lightgray";

      if (i < this.gameData.digitsOfEachRow.length - 1 && i > 1) {
        for (let j = 0; j < this.gameData.digitsOfEachRow[i]; ++j) {
          const btn = {
            gridColumn: j + 10 - this.gameData.digitsOfEachRow[i] - i + 2,
            gridRow: 1,
            backgroundColor: btnColor,
            adjustable: true,
          };

          btnStyle.push(btn);
        }
      } else {
        for (let j = 0; j < this.gameData.digitsOfEachRow[i]; ++j) {
          const btn = {
            gridColumn: j + 10 - this.gameData.digitsOfEachRow[i],
            gridRow: 1,
            backgroundColor: btnColor,
          };
          if (i < 2) {
            if (this.gameData.preset) {
              if (this.gameData.preset[i][j]) {
                btn.value = this.gameData.preset[i][j];
                btn.adjustable = false;
                btn.backgroundColor = "#909CA7";
              }
            }
          }
          if (btn.adjustable === null) btn.adjustable = true;
          btnStyle.push(btn);
        }
      }

      if (i === 1) {
        const btn = {
          gridColumn: 9 - this.maxDigit,
          gridRow: 1,
          backgroundColor: "#aded5d",
          value: "x",
          adjustable: false,
        };
        btnStyle.push(btn);
      }
      return btnStyle;
    },
    setUnit() {
      this.unitRowStyle.width = this.$refs.row.clientWidth + "px";

      switch (this.gameData.unit) {
        case "Length":
        case "Time":
        case "Volume":
        case "Weight":
          for (const i in this.unit[this.gameData.unit]) {
            if (i >= this.maxDigit) break;

            if (this.unit[this.gameData.unit][i]) {
              const unitStyle = {
                gridColumn: 9 - i,
                gridRow: 1,
                text: this.unit[this.gameData.unit][i],
              };
              this.unitStyle.push(unitStyle);
            }
          }
          break;
        case "Number":
          break;
        case "Custom":
          for (const i in this.gameData.customUnit) {
            if (i >= this.maxDigit) break;
            if (this.gameData.customUnit[i]) {
              const unitStyle = {
                gridColumn: 9 - i,
                gridRow: 1,
                text: this.gameData.customUnit[i],
              };
              this.unitStyle.push(unitStyle);
            }
          }
          break;
        default:
          console.log("Invalid unit.");
          break;
      }
    },
    checkAnswer() {
      let isCorrect = true;
      const ans = [];
      for (const i in this.rowStyle[this.rowStyle.length - 1].btnStyle) {
        ans.push(this.rowStyle[this.rowStyle.length - 1].btnStyle[i].value);
      }
      for (const i in ans) {
        if (ans[i] !== this.gameData.answers[i]) {
          isCorrect = false;
          this.rowStyle[this.rowStyle.length - 1].btnStyle[i].backgroundColor =
            "red";
        } else {
          this.rowStyle[this.rowStyle.length - 1].btnStyle[i].backgroundColor =
            "pink";
        }
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.gameData.answers.toString(),
          ans.toString(),
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.answers.toString(),
          ans.toString(),
          "錯誤",
        ]);
      }
    },
    btnClick(e, row, column) {
      if (this.rowStyle[row].btnStyle[column].adjustable) {
        this.showPad = true;
        this.currentInputBtn = { row, column };
        this.numPadData = {
          top: e.target.getBoundingClientRect().top,
          left:
            e.target.getBoundingClientRect().left +
            e.target.getBoundingClientRect().width,
        };
      }
    },
    handleNumPad(input) {
      if (input === "清除") {
        this.rowStyle[this.currentInputBtn.row].btnStyle[
          this.currentInputBtn.column
        ].value = null;
      } else if (input !== "關閉") {
        this.rowStyle[this.currentInputBtn.row].btnStyle[
          this.currentInputBtn.column
        ].value = input;
      }
      this.showPad = false;
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
}

.unit {
  height: 10%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 10px;
  padding: 10px;
  margin: auto;
}
.unit button {
  border: none;
  width: 100%;
  height: 100%;
  background-color: #8fb0e6;
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
  border: none;
  font-size: 1.5rem;
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
  background-color: lightgray;
  display: flex;
  justify-content: space-evenly;
  margin: auto;
  border-radius: 10px;
}
.function button {
  border: none;
  margin: 15px;
  width: 20%;
  background-color: #8fb0e6;
}

.drawingBoard {
  height: 95%;
  width: 95%;
  position: absolute;
  top: 0;
}
</style>
