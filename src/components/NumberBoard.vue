<template>
  <table class="number-board">
    <tr class="number-board__row">
      <td
        v-for="(unit, uIndex) in Unit"
        :key="uIndex"
        class="number-board__cell number-board__cell--unit"
      >
        {{ unit }}
      </td>
    </tr>
    <tr class="number-board__row">
      <td
        v-for="(number, index) in numbers"
        :key="index"
        class="number-board__cell"
        :class="{
          'number-board__cell--clickable': isInput,
          'number-board__cell--wrong': showWrong && wrongDigits[index],
        }"
        @click="isInput ? incrementDigit(index) : null"
      >
        {{ number }}
      </td>
    </tr>
  </table>
</template>

<script>
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "NumberBoard",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      numbers: [],
      Unit: null,
      isInput: this.componentConfig.isInput || false,
      wrongDigits: [],
      showWrong: false,
    };
  },
  created() {
    this.Unit = this.componentConfig.Unit;
    this.numbers = this.componentConfig.Number;
    if (typeof this.componentConfig.Number === "number") {
      this.numbers = this.componentConfig.Number.toString().split("");
    }
    if (this.componentConfig.Unit.length !== this.numbers.length) {
      if (this.componentConfig.Unit.length > this.numbers.length) {
        const diff = this.componentConfig.Unit.length - this.numbers.length;
        for (let i = 0; i < diff; i++) {
          this.numbers.unshift(" ");
        }
      } else {
        const diff = this.numbers.length - this.componentConfig.Unit.length;
        for (let i = 0; i < diff; i++) {
          this.Unit.unshift(" ");
        }
      }
    }

    if (this.isInput) {
      for (const i in this.numbers) {
        this.numbers[i] = "0";
      }
    }

    // 初始化錯誤狀態陣列
    this.wrongDigits = new Array(this.numbers.length).fill(false);
    this.showWrong = false;
    // 監聽 checkAnswer 事件
    emitter.on("checkAnswer", this.markWrong);
  },
  beforeUnmount() {
    emitter.off("checkAnswer", this.markWrong);
  },
  methods: {
    incrementDigit(index) {
      if (!this.isInput) return;

      this.numbers[index] = (
        (parseInt(this.numbers[index]) + 1) %
        10
      ).toString();
      this.checkAnswer();
    },
    checkAnswer() {
      if (!this.isInput) return;

      let check = true;
      const correctAnswer = this.componentConfig.Number.toString().split("");
      // 只檢查正確與否，不標記紅色
      for (let i = correctAnswer.length - 1; i >= 0; i--) {
        if (correctAnswer[i] !== this.numbers[i]) {
          check = false;
        }
      }
      this.$emit("replyAnswer", check);
    },
    markWrong() {
      // 觸發紅色標記
      this.showWrong = true;
      // 更新錯誤狀態
      const correctAnswer = this.componentConfig.Number.toString().split("");
      this.wrongDigits = new Array(this.numbers.length).fill(false);
      for (let i = correctAnswer.length - 1; i >= 0; i--) {
        if (correctAnswer[i] !== this.numbers[i]) {
          this.wrongDigits[i] = true;
        }
      }
      this.checkAnswer();
    },
  },
};
</script>

<style scoped lang="scss">
.number-board {
  width: 100%;
  height: 100%;
  display: table;
  border: solid;
  border-color: blue;
  table-layout: fixed;
  border-collapse: collapse;
  max-width: 350px;

  &__row {
    width: 100%;
    display: table-row;
    font-family: "YuanQuan";
    box-sizing: border-box;
  }

  &__cell {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    border: solid;
    box-sizing: border-box;
    font-size: 1.2em;

    &--unit {
      font-size: 1.5em;
      text-align: center;
      min-height: 2em;
      overflow: hidden;
      word-break: break-all;
      writing-mode: vertical-rl;
      text-orientation: upright;
    }

    &--clickable {
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: #f0f0f0;
      }
    }

    &--wrong {
      background-color: red !important;
    }
  }
}
</style>
