<template>
  <div class="container">
    <div class="question">
      <div class="questionText">
        <FractionText :ID="ID" :text="GameData.Question" />
      </div>
      <button class="submitBtn" @click="checkAnswer">提交答案</button>
    </div>
    <div v-if="GameData.Type == 'Ribbon'" class="options flex">
      <div class="ribbons">
        <div class="rowContainer">
          <div
            v-for="j in GameData.Denominator"
            :key="j - 1"
            class="ribbonPart"
            :style="wholeRibbonStyle[j - 1]"
          ></div>
        </div>
        <div v-for="i in GameData.Option" :key="i - 1" class="rowContainer">
          <div
            v-for="j in GameData.Denominator"
            :key="j - 1"
            class="ribbonPart"
            :style="ribbonStyle[i - 1][j - 1]"
          ></div>
        </div>
      </div>
      <div class="checkBoxes">
        <div class="rowContainer">{{ GameData.Itemdescription }}</div>
        <div v-for="i in GameData.Option" :key="i - 1" class="rowContainer">
          <button
            class="checkBoxBtn"
            :style="btnStyle[i - 1]"
            @click="handleClick(i - 1)"
          >
            ✔
          </button>
        </div>
      </div>
    </div>
    <div v-if="GameData.Type == 'Paper'" class="options grid">
      <div class="paper">
        <div class="gridContainer" :style="gridContainerStyle">
          <div
            v-for="j in GameData.Denominator"
            :key="j - 1"
            class="paperPiece"
            :style="wholePaperStyle[j - 1]"
          ></div>
        </div>
        {{ GameData.Itemdescription }}
      </div>
      <div v-for="i in GameData.Option" :key="i - 1" class="paper">
        <div class="gridContainer" :style="gridContainerStyle">
          <div
            v-for="j in GameData.Denominator"
            :key="j - 1"
            class="paperPiece"
            :style="paperStyle[i - 1][j - 1]"
          ></div>
        </div>
        <div class="checkBoxContainer">
          <button
            class="checkBoxBtn"
            :style="btnStyle[i - 1]"
            @click="handleClick(i - 1)"
          >
            ✔
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FractionText from "@/components/FractionText.vue";
export default {
  components: {
    FractionText,
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
      map: [],
      wholeRibbonStyle: [],
      ribbonStyle: [],
      wholePaperStyle: [],
      paperStyle: [],
      btnStyle: [],
      selected: [],
      color: "lightblue",
    };
  },

  beforeMount() {
    this.setMap();
    if (this.GameData.Type == "Ribbon") {
      this.setRibbonStyle();
    } else if (this.GameData.Type == "Paper") {
      this.setPaperStyle();
    }
    this.setbtnStyle();
  },

  methods: {
    setMap() {
      this.correctOptionID = this.randomCombination(
        this.GameData.Option,
        this.GameData.CorrectOption
      );
      for (let i = 0; i < this.GameData.Option; ++i) {
        if (this.correctOptionID.includes(i))
          this.map.push(this.GameData.Numerator);
        else {
          let random;
          do {
            random = Math.ceil(Math.random() * this.GameData.Denominator);
          } while (random == this.GameData.Numerator);
          this.map.push(random);
        }
      }
    },
    setRibbonStyle() {
      if (this.GameData.Color) this.color = this.GameData.Color;
      for (let j = 0; j < this.GameData.Denominator; ++j) {
        let style = {
          backgroundColor: this.color,
        };
        if (j == 0) style.borderLeft = "1px black solid";
        else if (j == this.GameData.Denominator - 1)
          style.borderRight = "1px black solid";
        this.wholeRibbonStyle.push(style);
      }

      for (let i = 0; i < this.GameData.Option; ++i) {
        let row = [];
        let coloredRibbon = this.randomCombination(
          this.GameData.Denominator,
          this.map[i]
        );
        for (let j = 0; j < this.GameData.Denominator; ++j) {
          let style = {};
          if (j == 0) style.borderLeft = "1px black solid";
          else if (j == this.GameData.Denominator - 1)
            style.borderRight = "1px black solid";

          if (coloredRibbon.includes(j)) style.backgroundColor = this.color;
          row.push(style);
        }
        this.ribbonStyle.push(row);
      }
    },
    setPaperStyle() {
      this.gridContainerStyle = {
        gridTemplateColumns: `repeat(${this.GameData.Factors[0]}, 1fr)`,
      };
      if (this.GameData.Color) this.color = this.GameData.Color;
      for (let i = 0; i < this.GameData.Factors[1]; ++i) {
        for (let j = 0; j < this.GameData.Factors[0]; ++j) {
          let style = {
            backgroundColor: this.color,
          };
          if (i == 0) style.borderTop = "1px black solid";
          else if (i == this.GameData.Factors[1] - 1)
            style.borderBottom = "1px black solid";

          if (j == 0) style.borderLeft = "1px black solid";
          else if (j == this.GameData.Factors[0] - 1)
            style.borderRight = "1px black solid";
          this.wholePaperStyle.push(style);
        }
      }
      for (let i = 0; i < this.GameData.Option; ++i) {
        let grid = [];
        let coloredPaper = this.randomCombination(
          this.GameData.Denominator,
          this.map[i]
        );
        for (let i = 0; i < this.GameData.Factors[1]; ++i) {
          for (let j = 0; j < this.GameData.Factors[0]; ++j) {
            let style = {};
            if (i == 0) style.borderTop = "1px black solid";
            else if (i == this.GameData.Factors[1] - 1)
              style.borderBottom = "1px black solid";

            if (j == 0) style.borderLeft = "1px black solid";
            else if (j == this.GameData.Factors[0] - 1)
              style.borderRight = "1px black solid";
            if (coloredPaper.includes(grid.length))
              style.backgroundColor = this.color;
            grid.push(style);
          }
        }
        this.paperStyle.push(grid);
      }
    },
    setbtnStyle() {
      for (let i = 0; i < this.GameData.Option; ++i) {
        let style = {
          color: "transparent",
        };
        this.btnStyle.push(style);
        this.selected.push(false);
      }
    },
    randomCombination(n, r) {
      let combination = [];
      do {
        let random = Math.floor(Math.random() * n);
        if (!combination.includes(random)) combination.push(random);
      } while (combination.length < r);
      return combination;
    },
    handleClick(i) {
      if (this.btnStyle[i].color == "black") {
        this.btnStyle[i].color = "transparent";
        this.selected[i] = false;
      } else {
        this.btnStyle[i].color = "black";
        this.selected[i] = true;
      }
    },
    checkAnswer() {
      let isCorrect = true,
        wrongAnswers = [];
      for (let i = 0; i < this.GameData.Option; ++i) {
        if (this.selected[i] != this.correctOptionID.includes(i)) {
          isCorrect = false;
          wrongAnswers.push(this.map[i]);
        }
      }
      console.log(isCorrect);
      this.emitAnswers(wrongAnswers);
    },
    emitAnswers(wrongAnswers) {
      if (wrongAnswers.length > 0) {
        while (wrongAnswers.findIndex(this.isNumerator) != -1) {
          wrongAnswers[wrongAnswers.findIndex(this.isNumerator)] = "未勾選";
        }
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.Numerator,
          wrongAnswers.toString(),
          "錯誤",
        ]);
      } else {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.GameData.Numerator, "#", "正確"]);
        this.$emit("next-question");
      }
    },
    isNumerator(i) {
      if (i == this.GameData.Numerator) return true;
      else return false;
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
  font-size: 2rem;
}
.question {
  width: 100%;
  height: 10%;
  display: flex;
}
.options {
  width: 100%;
  height: 90%;
}
.flex {
  display: flex;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
}
.ribbons {
  width: 70%;
  height: 100%;
}
.paper {
  font-size: 1.5rem;
  width: 100%;
  height: 100%;
  padding: 10px;
}
.ribbonPart {
  width: 100%;
  height: 80%;
  border-right: 2px black dashed;
  border-top: 1px black solid;
  border-bottom: 1px black solid;
}
.paperPiece {
  width: 100%;
  height: 100%;
  border: 1px black dashed;
}
.checkBoxes {
  font-size: 1.5rem;
  width: 28%;
  height: 100%;
  margin-left: auto;
}
.rowContainer {
  height: 10%;
  width: 100%;
  display: flex;
}
.gridContainer {
  width: 100%;
  height: 80%;
  display: grid;
}
.checkBoxBtn {
  font-size: 1rem;
  height: 80%;
  aspect-ratio: 1;
  background-color: transparent;
  border: 2px black solid;
}
.submitBtn {
  height: 80%;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  border-radius: 1rem;
  &:hover {
    background-color: darken(lightgray, 10%);
  }
  font-size: 2rem;
}
</style>
