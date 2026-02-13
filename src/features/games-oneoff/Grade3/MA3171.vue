<template>
  <div class="MA3171__container">
    <div class="equations-container">
      <div
        v-for="(row, rowIndex) in ['firstRow', 'secondRow']"
        :key="rowIndex"
        class="equation"
      >
        <template
          v-for="(type, index) in [
            'start',
            'multiply',
            'middle',
            'divide',
            'end',
          ]"
          :key="`${rowIndex}-${index}`"
        >
          <div v-if="type === 'multiply' || type === 'divide'" class="operator">
            {{ type === "multiply" ? "×" : "÷" }}{{ gameData[row][type] }}
          </div>
          <div
            v-else
            class="box"
            :class="{
              error: submitted && !isAnswerCorrect(rowIndex, type),
              preset: isPresetValue(gameData[row][type]),
            }"
            @click="
              handleBoxClick(
                getBoxIndex(rowIndex, type),
                gameData[row][type],
                $event
              )
            "
          >
            {{
              displayValue(
                gameData[row][type],
                inputValues[getBoxIndex(rowIndex, type)]
              )
            }}
          </div>
        </template>
      </div>
    </div>

    <!-- <button class="submit-btn" :disabled="!isAllFilled" @click="checkAnswer">
      送出答案
    </button> -->

    <FloatNumPad
      v-if="showNumPad"
      :component-config="numPadPosition"
      @button-clicked="numPadButtonClicked"
    />
  </div>
</template>

<script>
import FloatNumPad from "@/components/FloatNumPad.vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "MA3171",
  components: {
    FloatNumPad,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
  },
  emits: ["add-record", "next-question", "play-effect"],
  data() {
    return {
      inputValues: Array(6).fill(""), // 初始化為空字串陣列
      currentInputIndex: null,
      showNumPad: false,
      submitted: false,
      numPadPosition: {
        top: 0,
        left: 0,
      },
      numPadOffset: 10,
    };
  },
  computed: {
    isAllFilled() {
      const rows = ["firstRow", "secondRow"];
      const types = ["start", "middle", "end"];

      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < types.length; j++) {
          const value = this.gameData[rows[i]][types[j]];
          const inputIndex = this.getBoxIndex(i, types[j]);
          if (!this.isPresetValue(value) && !this.inputValues[inputIndex]) {
            return false;
          }
        }
      }
      return true;
    },
  },

  created() {
    // 在組件創建時初始化預設值
    if (this.gameData) {
      const { firstRow, secondRow } = this.gameData;
      this.inputValues = [
        firstRow?.start || "",
        firstRow?.middle || "",
        firstRow?.end || "",
        secondRow?.start || "",
        secondRow?.middle || "",
        secondRow?.end || "",
      ];
    }
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },

  methods: {
    getBoxIndex(rowIndex, type) {
      const indexMap = {
        firstRow: { start: 0, middle: 1, end: 2 },
        secondRow: { start: 3, middle: 4, end: 5 },
      };
      return indexMap[rowIndex === 0 ? "firstRow" : "secondRow"][type];
    },

    isPresetValue(value) {
      return value !== null && value !== undefined && value !== "";
    },

    displayValue(presetValue, inputValue) {
      return this.isPresetValue(presetValue) ? presetValue : inputValue || "";
    },

    handleBoxClick(index, presetValue, event) {
      if (!this.isPresetValue(presetValue)) {
        this.openNumPad(index, event);
      }
    },

    openNumPad(index, event) {
      const boxRect = event.target.getBoundingClientRect();

      this.currentInputIndex = index;
      this.numPadPosition = {
        top: `${boxRect.bottom + this.numPadOffset}px`,
        left: `${boxRect.left}px`,
      };
      this.showNumPad = true;
    },
    closeNumPad() {
      this.showNumPad = false;
    },
    numPadButtonClicked(label) {
      if (this.currentInputIndex !== null) {
        switch (label) {
          case "清除":
            this.inputValues[this.currentInputIndex] = "";
            break;
          case "關閉":
            this.closeNumPad();
            break;
          default:
            this.inputValues[this.currentInputIndex] =
              this.inputValues[this.currentInputIndex] + label;
            break;
        }
      }
    },
    getAnswerIndex(rowIndex, type) {
      let answerCount = 0;
      const rows = ["firstRow", "secondRow"];
      const types = ["start", "middle", "end"];

      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < types.length; j++) {
          const value = this.gameData[rows[i]][types[j]];
          if (!this.isPresetValue(value)) {
            if (i === rowIndex && types[j] === type) {
              return answerCount;
            }
            answerCount++;
          }
        }
      }
      return -1;
    },
    isAnswerCorrect(rowIndex, type) {
      const answerIndex = this.getAnswerIndex(rowIndex, type);
      if (answerIndex === -1) return true; // 預設值永遠正確

      const inputIndex = this.getBoxIndex(rowIndex, type);
      return (
        String(this.inputValues[inputIndex]) ===
        String(this.gameData.answers[answerIndex])
      );
    },
    checkAnswer() {
      if (!this.isAllFilled) return;

      let isCorrect = true;
      const rows = ["firstRow", "secondRow"];
      const types = ["start", "middle", "end"];

      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < types.length; j++) {
          if (!this.isPresetValue(this.gameData[rows[i]][types[j]])) {
            if (!this.isAnswerCorrect(i, types[j])) {
              isCorrect = false;
            }
          }
        }
      }

      this.submitted = true;

      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "wrong");
        this.$emit("add-record", ["不支援", "不支援", "錯誤"]);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.MA3171__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $padding--large;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  gap: $gap--large;

  .equations-container {
    display: flex;
    flex-direction: column;
    gap: $gap--large;
  }

  .equation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $gap--large;
  }

  .box {
    width: 60px;
    height: 60px;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-medium;
    cursor: pointer;
    background-color: white;
    border-radius: $border-radius;
    padding: 0 $padding--small;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &.error {
      background-color: $error-color;
      border-color: $error-color;
    }

    &.preset {
      background-color: $sub-color;
      cursor: not-allowed;
    }
  }

  .operator {
    font-size: $text-large;
    color: $accent-color;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
    position: relative;
    padding-bottom: 20px;

    &::after {
      content: "→";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      font-size: $text-large;
      color: $accent-color;
    }
  }

  .submit-btn {
    padding: $padding--small $padding--large;
    font-size: $text-medium;
    background-color: $submit-color;
    color: white;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: $submit-color;
    }

    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }
}
</style>
