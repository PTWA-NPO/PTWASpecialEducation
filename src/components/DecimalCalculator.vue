<template>
  <div class="decimal-calculator__container">
    <div class="decimal-calculator__calculator">
      <div
        v-for="(rowConfig, rowIndex) in [
          { type: 'unit', number: null },
          { type: 'carry', number: carryNumber, isCarry: true },
          { type: 'number', number: firstNumber },
          { type: 'number', number: secondNumber, label: operation },
          { type: 'separator' },
          { type: 'number', number: userAnswer, isAnswer: true },
        ]"
        :key="`row-${rowIndex}`"
        :class="`decimal-calculator__${rowConfig.type === 'separator' ? 'separator' : rowConfig.type + '-row'}`"
      >
        <!-- 分隔線 -->
        <template v-if="rowConfig.type === 'separator'">
          <div class="decimal-calculator__separator-container"></div>
        </template>

        <!-- 正常行顯示 -->
        <template v-else>
          <!-- 可選的標籤顯示 -->
          <button
            v-for="(position, index) in getFormattedPositions(
              rowConfig.type,
              rowConfig.number,
              rowConfig.label
            )"
            :key="`${rowConfig.type}-${rowIndex}-${index}`"
            :class="[
              `decimal-calculator__${rowConfig.type === 'unit' ? 'unit' : 'digit'}`,
              { 'decimal-calculator__digit--answer': rowConfig.isAnswer },
              {
                'decimal-calculator__digit--carry':
                  rowConfig.isCarry && index > 0,
              },
              {
                'decimal-calculator__digit--decimal-point':
                  position.value === '.',
              },
              { 'decimal-calculator__digit--empty': !position.show },
            ]"
            @click="
              (rowConfig.isAnswer || rowConfig.isCarry) &&
              position.value !== '.'
                ? btnClick($event, index, position, rowConfig.isCarry)
                : null
            "
          >
            {{ position.show ? position.value : "" }}
          </button>
        </template>
      </div>
    </div>
    <div class="number-pad">
      <numPad v-if="showPad" :Data="numPadData" @buttonClicked="handleNumPad" />
    </div>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
export default {
  name: "DecimalCalculator",
  components: {
    numPad: defineAsyncComponent(() => import("@/components/FloatNumPad.vue")),
  },
  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      firstNumber: this.Data.number1,
      secondNumber: this.Data.number2,
      result: 0,
      userAnswer: "",
      operation: this.Data.operation,
      userInput: "",
      units: {
        beforeDecimal: ["千位", "百位", "十位", "個位"],
        afterDecimal: ["十分位", "百分位", "千分位"],
      },
      maxLength: {
        beforeDecimal: 0,
        afterDecimal: 0,
      },
      numPadData: null,
      showPad: false,
      currentDigit: null,
      carryNumber: "",
    };
  },
  created() {
    this.calculateResult();
    this.getLength();
  },
  methods: {
    calculateResult() {
      if (this.operation === "+") {
        this.result = +(this.firstNumber + this.secondNumber).toFixed(2);
      } else {
        this.result = +(this.firstNumber - this.secondNumber).toFixed(2);
      }
    },
    getLength() {
      // 將數字轉為字符串，並分離小數點前後的部分
      const splitNumber = (num) => {
        const str = num.toString();
        const parts = str.split(".");
        return {
          beforeDecimal: parts[0].length,
          afterDecimal: parts.length > 1 ? parts[1].length : 0,
        };
      };

      const firstLength = splitNumber(this.firstNumber);
      const secondLength = splitNumber(this.secondNumber);
      const resultLength = splitNumber(this.result);

      // 找出小數點前和小數點後的最大長度
      this.maxLength = {
        beforeDecimal: Math.max(
          firstLength.beforeDecimal,
          secondLength.beforeDecimal,
          resultLength.beforeDecimal
        ),
        afterDecimal: Math.max(
          firstLength.afterDecimal,
          secondLength.afterDecimal,
          resultLength.afterDecimal
        ),
      };

      return this.maxLength;
    },
    getDigitsArray(number) {
      const str = number.toString();
      const parts = str.split(".");
      const beforeDecimal = parts[0].split("").map(Number);
      const afterDecimal =
        parts.length > 1 ? parts[1].split("").map(Number) : [];
      return {
        beforeDecimal: beforeDecimal,
        afterDecimal: afterDecimal,
      };
    },
    getNumberAtPosition(number, position, isBeforeDecimal) {
      const digits = this.getDigitsArray(number);
      if (isBeforeDecimal) {
        const offset =
          this.maxLength.beforeDecimal - digits.beforeDecimal.length;
        const adjustedPosition = position - offset;
        return adjustedPosition >= 0
          ? digits.beforeDecimal[adjustedPosition]
          : "";
      } else {
        return digits.afterDecimal[position] || "";
      }
    },
    getFormattedPositions(type, number = null, label = null) {
      const positions = [];
      const isAnswerRow = number === this.userAnswer;
      const isCarryRow = type === "carry";

      // 添加標籤位置（運算符號）
      positions.push({
        value: label || "",
        show: !!label, // 只有當 label 存在時才顯示
      });

      // 處理小數點前的數據
      const getValue = (index, isBeforeDecimal) => {
        if (type === "unit") {
          return isBeforeDecimal
            ? this.units.beforeDecimal[
                this.units.beforeDecimal.length -
                  this.maxLength.beforeDecimal +
                  index
              ]
            : this.units.afterDecimal[index];
        }
        return number === ""
          ? ""
          : this.getNumberAtPosition(number, index, isBeforeDecimal);
      };

      // 處理小數點前的數據
      for (let i = 0; i < this.maxLength.beforeDecimal; i++) {
        const value = getValue(i, true);
        positions.push({
          value: value,
          show: isAnswerRow || isCarryRow ? true : value !== "",
        });
      }

      // 添加小數點（如果需要）
      if (this.maxLength.afterDecimal > 0) {
        positions.push({
          value: ".",
          show: true,
        });
      }

      // 處理小數點後的數據
      for (let i = 0; i < this.maxLength.afterDecimal; i++) {
        const value = getValue(i, false);
        positions.push({
          value: value,
          show: isAnswerRow || isCarryRow ? true : value !== "",
        });
      }

      return positions;
    },
    btnClick(e, index, position, isCarry) {
      if (position.value === ".") return;

      this.showPad = true;
      this.currentDigit = {
        index: index,
        isBeforeDecimal: index <= this.maxLength.beforeDecimal,
        isCarry: isCarry,
      };

      this.numPadData = {
        top: e.target.getBoundingClientRect().top,
        left:
          e.target.getBoundingClientRect().left +
          e.target.getBoundingClientRect().width,
      };
    },
    handleNumPad(input) {
      if (!this.currentDigit) return;

      if (input === "清除") {
        this.updateDigit("");
      } else if (input !== "關閉") {
        this.updateDigit(input);
      }
      this.showPad = false;
      this.checkAnswer();
    },
    updateDigit(value) {
      if (this.currentDigit.isCarry) {
        const carryStr = this.carryNumber.toString();
        const parts = carryStr.split(".");
        let beforeDecimal = parts[0].split("");
        let afterDecimal = parts.length > 1 ? parts[1].split("") : [];

        if (this.currentDigit.isBeforeDecimal) {
          const position = this.currentDigit.index - 1;
          while (beforeDecimal.length < this.maxLength.beforeDecimal) {
            beforeDecimal.unshift("0");
          }
          beforeDecimal[position] = value;
        } else {
          const position =
            this.currentDigit.index - this.maxLength.beforeDecimal - 2;
          while (afterDecimal.length < this.maxLength.afterDecimal) {
            afterDecimal.push("0");
          }
          afterDecimal[position] = value;
        }

        while (beforeDecimal[0] === "0" && beforeDecimal.length > 1) {
          beforeDecimal.shift();
        }

        this.carryNumber = parseFloat(
          beforeDecimal.join("") +
            "." +
            (afterDecimal.length ? afterDecimal.join("") : "0")
        );
      } else {
        const userAnswerStr = this.userAnswer.toString();
        const parts = userAnswerStr.split(".");
        let beforeDecimal = parts[0].split("");
        let afterDecimal = parts.length > 1 ? parts[1].split("") : [];

        if (this.currentDigit.isBeforeDecimal) {
          const position = this.currentDigit.index - 1;
          while (beforeDecimal.length < this.maxLength.beforeDecimal) {
            beforeDecimal.unshift("0");
          }
          beforeDecimal[position] = value;
        } else {
          const position =
            this.currentDigit.index - this.maxLength.beforeDecimal - 2;
          while (afterDecimal.length < this.maxLength.afterDecimal) {
            afterDecimal.push("0");
          }
          afterDecimal[position] = value;
        }

        while (beforeDecimal[0] === "0" && beforeDecimal.length > 1) {
          beforeDecimal.shift();
        }

        this.userAnswer = parseFloat(
          beforeDecimal.join("") +
            "." +
            (afterDecimal.length ? afterDecimal.join("") : "0")
        );
      }
    },
    checkAnswer() {
      if (this.userAnswer === "") return;
      const isVerticalCorrect = Math.abs(this.userAnswer - this.result) < 0.001;
      this.$emit("replyAnswer", isVerticalCorrect);
    },
  },
};
</script>

<style scoped lang="scss">
.decimal-calculator {
  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__calculator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 600px; // 設置最大寬度
    height: 100%;
    min-height: 400px;
    padding: 0 20px; // 增加一些邊距
    gap: 10px;
  }

  &__unit-row,
  &__number-row,
  &__carry-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 4px; // 設置按鈕之間的間距
  }

  &__unit,
  &__digit {
    flex: 1;
    max-width: 40px;
    background-color: #f0f0f0;
    border-radius: 10px;
    margin: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
  }
  &__unit {
    height: 80px;
  }
  &__digit {
    height: 40px;
    &--decimal-point {
      cursor: default;
      background-color: transparent;
      border: none;
      max-width: 20px;
      margin: 2px 0;
      flex: 0.3;
    }

    &--carry {
      border: 1px dashed #ccc;
      background-color: transparent;
    }

    &--carry,
    &--answer {
      min-height: 40px; // 確保進位和答案行的最小高度
      height: 40px; // 固定高度
    }

    &--empty {
      background-color: transparent;
      opacity: 0.5;
      min-height: 40px; // 空格子也保持高度
      height: 40px;
    }
  }

  &__separator {
    width: 100%;
    height: 2px;
    background-color: #333;
    min-width: 300px;
  }

  &__submit-btn {
    padding: 10px 30px;
    font-size: 1.2rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #45a049;
    }

    &:active {
      background-color: #3d8b40;
    }
  }
}
</style>
