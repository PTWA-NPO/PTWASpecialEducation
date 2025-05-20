<template>
  <div class="division-container">
    <div class="division-container__calculator">
      <div v-for="rowData in row" :key="rowData.id" class="calculator__row">
        <button
          v-for="cell in rowData"
          :key="cell.id"
          class="calculator__cell"
          :class="{
            'calculator__cell--adjustable': cell.adjustable,
            'calculator__cell--place-value':
              cell.className === 'place-value-cell',
          }"
          :style="cell.style"
          @click="handleCellClick($event, cell)"
        >
          <span>{{ cell.value ?? " " }}</span>
        </button>
      </div>
    </div>
    <numPad v-if="showPad" :Data="numPadData" @buttonClicked="handleNumPad" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "Division",
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
      divisor: this.Data.divisor,
      dividend: this.Data.dividend,
      quotient: 0,
      remainder: 0,
      row: [],
      widthLength: 0,
      showPad: false,
      numPadData: {
        top: 0,
        left: 0,
      },
      currentCell: null,
    };
  },
  mounted() {
    this.getAnswer();
    this.setRow();
  },
  methods: {
    // 計算相關方法
    getAnswer() {
      this.quotient = Math.floor(this.dividend / this.divisor);
      this.remainder = this.dividend % this.divisor;
    },

    calculateDivisionStep(currentNum, remainingDividend, pos) {
      const divisorNum = this.divisor;
      const quotient = Math.floor(currentNum / divisorNum);
      const product = quotient * divisorNum;
      const remainder = currentNum - product;

      const restDigits = remainingDividend.toString().slice(pos);
      const newRemainingDividend = parseInt(remainder + restDigits) || 0;
      const adjustedPos =
        product.toString().length -
        (remainder ? remainder.toString().length : 0);

      return { newRemainingDividend, adjustedPos };
    },

    getNextDividendInfo(num) {
      let pos = 1;
      let currentNum = parseInt(num.toString().slice(0, pos));

      while (currentNum < this.divisor && pos < num.toString().length) {
        pos++;
        currentNum = parseInt(num.toString().slice(0, pos));
      }

      return { pos, currentNum };
    },

    // 界面初始化相關方法
    getWidthLength() {
      return this.dividend.toString().length + this.divisor.toString().length;
    },

    createQuotientRow(width, divisorLength) {
      return Array(width)
        .fill(null)
        .map((_, i) => ({
          value: null,
          adjustable: i >= divisorLength,
          id: `quotient-${i}`,
        }));
    },

    createQuestionRow(width, divisorStr, dividendStr) {
      return Array(width)
        .fill(null)
        .map((_, i) => {
          const isDivisor = i < divisorStr.length;
          return {
            value: isDivisor
              ? divisorStr[i]
              : dividendStr[i - divisorStr.length],
            adjustable: false,
            id: `question-${i}`,
            style: {
              ...(i === divisorStr.length - 1 && {
                borderRight: "2px solid #000000",
              }),
              ...(!isDivisor && { borderTop: "2px solid #000000" }),
            },
          };
        });
    },

    createCalculationRow(needBorder, divisorStr, processedDigits, pos) {
      return {
        needBorder,
        adjustableStart: divisorStr.length + processedDigits,
        adjustableEnd: divisorStr.length + processedDigits + pos,
      };
    },

    createFinalRow(divisorStr, processedDigits, isZeroRemainder) {
      return {
        needBorder: false,
        adjustableStart:
          divisorStr.length +
          (isZeroRemainder ? processedDigits - 1 : processedDigits),
        adjustableEnd: this.widthLength,
      };
    },

    // 處理單個計算步驟的輔助方法
    processDivisionStep(remainingDividend, processedDigits) {
      const { pos, currentNum } = this.getNextDividendInfo(remainingDividend);
      const step = this.calculateDivisionStep(
        currentNum,
        remainingDividend,
        pos
      );

      return {
        pos,
        newProcessedDigits: processedDigits + step.adjustedPos,
        newRemainingDividend: step.newRemainingDividend,
      };
    },

    // 創建計算行的輔助方法
    createStepRows(divisorStr, processedDigits, pos, isFirstStep = false) {
      if (isFirstStep) {
        return [
          this.createCalculationRow(true, divisorStr, processedDigits, pos),
        ];
      }

      return [
        this.createCalculationRow(false, divisorStr, processedDigits, pos),
        this.createCalculationRow(true, divisorStr, processedDigits, pos),
      ];
    },

    createCalculationRows(divisorStr) {
      const rows = [];
      let remainingDividend = this.dividend;
      let processedDigits = 0;
      let isFirstStep = true;

      // 處理所有計算步驟
      while (remainingDividend >= this.divisor) {
        const { pos, newProcessedDigits, newRemainingDividend } =
          this.processDivisionStep(
            remainingDividend,
            processedDigits,
            divisorStr
          );

        rows.push(
          ...this.createStepRows(divisorStr, processedDigits, pos, isFirstStep)
        );

        processedDigits = newProcessedDigits;
        remainingDividend = newRemainingDividend;
        isFirstStep = false;
      }

      // 添加最後一行
      rows.push(
        this.createFinalRow(
          divisorStr,
          processedDigits,
          remainingDividend === 0
        )
      );

      return rows;
    },

    // 新增一個專門創建位值行的方法
    createPlaceValueRow(width) {
      return Array(width)
        .fill(null)
        .map((_, i) => {
          const isDivisor = i < this.divisor.toString().length;
          if (isDivisor) {
            return {
              value: "",
              adjustable: false,
              id: `place-value-${i}`,
              style: {},
              className: "place-value-cell",
            };
          }

          const position = width - i - 1;
          let value = "";
          if (position === 0) value = "個位";
          else if (position === 1) value = "十位";
          else if (position === 2) value = "百位";
          else if (position === 3) value = "千位";
          else if (position === 4) value = "萬位";

          return {
            value: value,
            adjustable: false,
            id: `place-value-${i}`,
            style: {},
            className: "place-value-cell",
          };
        });
    },

    // 修改 setRow 方法
    setRow() {
      this.widthLength = this.getWidthLength();
      const divisorStr = this.divisor.toString();
      const dividendStr = this.dividend.toString();

      const placeValueRow = this.createPlaceValueRow(this.widthLength);
      const quotientRow = this.createQuotientRow(
        this.widthLength,
        divisorStr.length
      );
      const questionRow = this.createQuestionRow(
        this.widthLength,
        divisorStr,
        dividendStr
      );
      const calculationRows = this.createCalculationRows(divisorStr);

      const workingRows = calculationRows.map((row, index) =>
        Array(this.widthLength)
          .fill(null)
          .map((_, i) => ({
            value: null,
            adjustable: i >= row.adjustableStart && i < row.adjustableEnd,
            id: `working-${index}-${i}`,
            style: {
              ...(row.needBorder && { borderBottom: "2px solid #000000" }),
            },
          }))
      );

      this.row = [placeValueRow, quotientRow, questionRow, ...workingRows];
    },

    // 使用者互動相關方法
    handleCellClick(e, cell) {
      if (cell.adjustable) {
        this.currentCell = cell;
        this.numPadData = {
          top: e.target.getBoundingClientRect().top,
          left: e.target.getBoundingClientRect().right,
        };
        this.showPad = true;
      }
    },

    handleNumPad(input) {
      if (!this.currentCell) return;

      if (input === "清除") {
        this.currentCell.value = null;
      } else if (input !== "關閉") {
        this.currentCell.value = input;
      }
      this.showPad = false;

      // 在關閉數字鍵盤後檢查答案
      this.checkAnswer();
    },

    // 答案檢查相關方法
    isAnswerComplete() {
      // 檢查商數行是否完整
      const quotientRow = this.row[1]; // 第二行是商數行
      const isQuotientComplete = quotientRow.every(
        (cell) => cell.value !== null && cell.value !== undefined
      );

      // 檢查餘數行是否完整（最後一行）
      const remainderRow = this.row[this.row.length - 1];
      const isRemainderComplete = remainderRow.every(
        (cell) => cell.value !== null && cell.value !== undefined
      );

      return isQuotientComplete && isRemainderComplete;
    },

    checkAnswer() {
      // 獲取用戶輸入的商數
      const quotientRow = this.row[1];
      const userQuotient = parseInt(
        quotientRow.map((cell) => cell.value).join("")
      );

      // 獲取用戶輸入的餘數
      const remainderRow = this.row[this.row.length - 1];
      const userRemainder = parseInt(
        remainderRow.map((cell) => cell.value).join("")
      );

      // 檢查答案是否正確
      const isCorrect =
        userQuotient === this.quotient && userRemainder === this.remainder;
      this.$emit("replyAnswer", isCorrect);
    },
  },
};
</script>

<style scoped lang="scss">
.division-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  &__calculator {
    font-size: 1.5rem;
    display: table;
    border-collapse: collapse;
    width: fit-content; // 改為適應內容寬度
    height: fit-content; // 改為適應內容高度
    margin: auto;
  }
}

.calculator {
  &__row {
    display: table-row;
    width: 100%;
  }

  &__cell {
    border: 1px #cccccc solid;
    background-color: #f5f5f5;
    display: table-cell;
    width: 2em;
    height: 2em; // 使用固定高度
    text-align: center;
    vertical-align: middle;

    &--adjustable {
      cursor: pointer;
      background-color: #8ce4ff;
    }

    &--place-value {
      span {
        line-height: 1;
        display: inline-block;
        font-size: 0.8em;
      }
    }
  }
}

button {
  border-radius: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: none;
}
</style>
