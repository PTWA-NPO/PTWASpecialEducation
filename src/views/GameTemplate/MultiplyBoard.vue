<template>
  <div class="container">
    <div class="board">
      <div class="unit" :style="unitRowStyle">
        <button v-for="i in unitStyle" :style="i">{{ i.text }}</button>
      </div>
      <div ref="row" class="row" :style="btnRowStyle">
        <button
          v-for="i in rowStyle[0].btnStyle.length"
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
          class="numBtn"
          :style="rowStyle[1].btnStyle[i - 1]"
          @click="btnClick($event, 1, i - 1)"
        >
          {{ rowStyle[1].btnStyle[i - 1].value }}
        </button>
      </div>
      <hr />
      <div
        v-for="i in GameData.digitsOfEachRow.length - 3"
        class="row"
        :style="btnRowStyle"
      >
        <button
          v-for="j in rowStyle[i + 1].btnStyle.length"
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
          v-for="i in rowStyle[GameData.digitsOfEachRow.length - 1].btnStyle.length"
          class="numBtn"
          :style="rowStyle[GameData.digitsOfEachRow.length - 1].btnStyle[i - 1]"
          @click="btnClick($event, GameData.digitsOfEachRow.length - 1, i - 1)"
        >
          {{ rowStyle[GameData.digitsOfEachRow.length - 1].btnStyle[i - 1].value }}
        </button>
      </div>
    </div>
    <div class="drawingBoard" :style="canvasStyle">
      <drawingBoard ref="canvas" :Data="configBrush"></drawingBoard>
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
  </div>
  <div class="number-pad">
    <numPad v-if="showPad" :Data="numPadData" @buttonClicked="input" />
  </div>
</template>

<script>
import { getGameStaticAssets } from "@/utilitys/get_assets.js";
import { defineAsyncComponent } from "vue";
import fetchJson from "@/utilitys/fetch-json";
export default {
  components: {
    drawingBoard: defineAsyncComponent(() => import("@/components/DrawingBoard.vue")),
    numPad: defineAsyncComponent(() => import("@/components/FloatNumPad.vue")),
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
      unitRowStyle: {},
      btnRowStyle: {},
      rowStyle: [],
      unitStyle: [],
      answer: [],
      numPadData: {},
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
    this.unit = await fetchJson(getGameStaticAssets("MultiplyBoard", "unit.json"));
    this.unit = this.unit.data.unit;
    this.setUnit();
    console.log(this.rowStyle);
  },

  methods: {
    drawingFunc(btn) {
      switch (btn) {
        case "brush":
          if (this.canvasStyle.zIndex == -1) {
            this.canvasStyle.zIndex = 1;
            this.configBrush = this.brush;
            this.brushStatusBtn = "控制";
          } else if (this.canvasStyle.zIndex == 1) {
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
          if (this.canvasStyle.visibility == "visible") {
            this.canvasStyle.visibility = "hidden";
            this.drawingBoardStatusBtn = "顯示";
          } else if (this.canvasStyle.visibility == "hidden") {
            this.canvasStyle.visibility = "visible";
            this.drawingBoardStatusBtn = "隱藏";
          }
          break;
      }
    },
    setRowStyles() {
      this.btnRowStyle = {
        height: 90 / this.GameData.digitsOfEachRow.length + "%",
      };
      for (let i in this.GameData.digitsOfEachRow) {
        let rowStyle = {};
        rowStyle.btnStyle = this.setBtnStyle(i);
        this.rowStyle.push(rowStyle);
      }
    },
    setBtnStyle(i) {
      this.maxDigit = Math.max(...this.GameData.digitsOfEachRow);
      let btnStyle = [],
        btnColor;
      if (i == this.GameData.digitsOfEachRow.length - 1) btnColor = "pink";
      else btnColor = "lightgray";

      if (i < this.GameData.digitsOfEachRow.length - 1 && i > 1) {
        for (let j = 0; j < this.GameData.digitsOfEachRow[i]; ++j) {
          let btn = {
            gridColumn: j + 10 - this.GameData.digitsOfEachRow[i] - i + 2,
            gridRow: 1,
            backgroundColor: btnColor,
            adjustable: true,
          };

          btnStyle.push(btn);
        }
      } else {
        for (let j = 0; j < this.GameData.digitsOfEachRow[i]; ++j) {
          let btn = {
            gridColumn: j + 10 - this.GameData.digitsOfEachRow[i],
            gridRow: 1,
            backgroundColor: btnColor,
          };
          if (i < 2) {
            if (this.GameData.preset) {
              if (this.GameData.preset[i][j]) {
                btn.value = this.GameData.preset[i][j];
                btn.adjustable = false;
              }
            }
          }
          if (btn.adjustable == null) btn.adjustable = true;
          btnStyle.push(btn);
        }
      }

      if (i == 1) {
        let btn = {
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
    setPadPosition(row, column) {
      let position;
      if (row >= this.GameData.digitsOfEachRow.length / 2) position = "upper";
      else position = "lower";

      if (column > 5) return position.concat("Left");
      else return position.concat("Right");
    },
    setUnit() {
      this.unitRowStyle.width = this.$refs.row.clientWidth + "px";

      switch (this.GameData.unit) {
        case "Length":
        case "Time":
        case "Volume":
        case "Weight":
          for (let i in this.unit[this.GameData.unit]) {
            if (i >= this.maxDigit) break;

            if (this.unit[this.GameData.unit][i]) {
              let unitStyle = {
                gridColumn: 9 - i,
                gridRow: 1,
                text: this.unit[this.GameData.unit][i],
              };
              this.unitStyle.push(unitStyle);
            }
          }
          break;
        case "Number":
          break;
        case "Custom":
          for (let i in this.GameData.customUnit) {
            if (i >= this.maxDigit) break;
            if (this.GameData.customUnit[i]) {
              let unitStyle = {
                gridColumn: 9 - i,
                gridRow: 1,
                text: this.GameData.customUnit[i],
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
    getAnswer(ans, id) {
      this.answer[id - 1] = ans;
    },
    checkAnswer() {
      let isCorrect = true;
      let ansDigits = this.GameData.digitsOfEachRow[
        this.GameData.digitsOfEachRow.length - 1
      ];
      for (let i in this.GameData.answers) {
        if (
          this.answer[ansDigits - i - 1] ==
          this.GameData.answers[this.GameData.answers.length - i - 1]
        ) {
          this.btnRef[ansDigits - i - 1].updateColor("pink");
        } else {
          isCorrect = false;

          this.btnRef[ansDigits - i - 1].updateColor("red");
        }
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.GameData.answers.toString(),
          this.answer.toString(),
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.answers.toString(),
          this.answer.toString(),
          "錯誤",
        ]);
      }
    },
    btnClick(e, row, column) {
      if (this.rowStyle[row].btnStyle[column].adjustable) {
        this.showPad = true;
        this.numPadData = {
          top: e.target.getBoundingClientRect().top,
          left:
            e.target.getBoundingClientRect().left +
            e.target.getBoundingClientRect().width,
        };
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
