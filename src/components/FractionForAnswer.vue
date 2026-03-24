<template>
  <div :class="[$attrs.class, 'fraction-for-answer-wrapper']">
    <div
      ref="container"
      class="fraction-for-answer"
      :style="{ '--estimated-width': estimatedWidthEm }"
    >
      <span v-if="componentConfig.prefix" class="prefix">{{
        componentConfig.prefix
      }}</span>
      <div
        class="fraction-container"
        :style="{ fontSize: `${containerScale}em` }"
      >
        <!-- 分子部分 -->
        <template v-if="isNumeratorInput">
          <input
            ref="numerator"
            class="fraction-input numerator"
            type="text"
            @click="showNumPad('numerator', $event)"
            @input="handleNativeInput"
          />
        </template>
        <span v-else class="fraction-text numerator">{{
          componentConfig.numerator
        }}</span>

        <span class="line"></span>

        <!-- 分母部分 -->
        <template v-if="isDenominatorInput">
          <input
            ref="denominator"
            class="fraction-input denominator"
            type="text"
            @click="showNumPad('denominator', $event)"
            @input="handleNativeInput"
          />
        </template>
        <span v-else class="fraction-text denominator">{{
          componentConfig.denominator
        }}</span>
      </div>
      <span v-if="componentConfig.suffix" class="suffix">{{
        componentConfig.suffix
      }}</span>
    </div>
    <FloatNumPad
      v-if="virtualNumpadSwitch"
      :component-config="numPadPosition"
      @button-clicked="numPadButtonClicked"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "FractionForAnswer",
  components: {
    FloatNumPad: defineAsyncComponent(
      () => import("@/components/FloatNumPad.vue")
    ),
  },
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["recordAnswer", "replyAnswer"],
  data() {
    return {
      virtualNumpadSwitch: false,
      numPadPosition: {
        top: 0,
        left: 0,
      },
      activeInputRef: "",
      // 定義常數
      numPadOffset: 10, // 虛擬鍵盤與目標輸入框的間距
      containerScale: 1,
    };
  },
  computed: {
    estimatedWidthEm() {
      let ems = 3.5; // fraction default content width
      let gapCount = 0;
      if (this.componentConfig.prefix) {
        ems += String(this.componentConfig.prefix).length;
        gapCount++;
      }
      if (this.componentConfig.suffix) {
        ems += String(this.componentConfig.suffix).length;
        gapCount++;
      }
      ems += gapCount * 1; // account for 1em gap per item
      return ems;
    },
    // 判斷分子是否為輸入框
    isNumeratorInput() {
      const blankPart = this.componentConfig.blank_part;
      // 預設為輸入框 (undefined or 'both' or 'numerator')
      if (!blankPart || blankPart === "both" || blankPart === "numerator") {
        return true;
      }
      return false;
    },
    // 判斷分母是否為輸入框
    isDenominatorInput() {
      const blankPart = this.componentConfig.blank_part;
      // 預設為輸入框 (undefined or 'both' or 'denominator')
      if (!blankPart || blankPart === "both" || blankPart === "denominator") {
        return true;
      }
      return false;
    },
  },
  methods: {
    showNumPad(inputRef, event) {
      const inputRect = event.target.getBoundingClientRect();

      this.activeInputRef = inputRef;

      this.numPadPosition = {
        top: `${inputRect.top + window.scrollY}px`,
        left: `${inputRect.right + window.scrollX + this.numPadOffset}px`,
      };

      this.virtualNumpadSwitch = true;
    },
    numPadButtonClicked(label) {
      switch (label) {
        case "清除":
          this.clearActiveInput();
          break;
        case "關閉":
          this.closeNumPad();
          break;
        default:
          this.updateInputValue(label);
          this.validateAnswer();
          break;
      }
    },
    validateAnswer() {
      let userNumerator, userDenominator;

      // 取得或設定分子數值
      if (this.isNumeratorInput) {
        // 如果是輸入框，從 input 讀值
        userNumerator = parseInt(this.$refs.numerator.value, 10);
      } else {
        // 如果不是輸入框，直接使用正確答案的數值
        userNumerator = this.componentConfig.numerator;
      }

      // 取得或設定分母數值
      if (this.isDenominatorInput) {
        // 如果是輸入框，從 input 讀值
        userDenominator = parseInt(this.$refs.denominator.value, 10);
      } else {
        // 如果不是輸入框，直接使用正確答案的數值
        userDenominator = this.componentConfig.denominator;
      }

      // 檢查是否有輸入值 (針對輸入框的部分檢查 NaN)
      // 若是純顯示部分，上面的邏輯已經assign了 componentConfig 的值 (假設 config 正確則不會是 NaN)
      if (
        isNaN(userNumerator) ||
        isNaN(userDenominator) ||
        userDenominator === 0
      ) {
        this.$emit("replyAnswer", false);
        return;
      }

      // 計算實際的小數值來比較
      const correctValue =
        this.componentConfig.numerator / this.componentConfig.denominator;
      const userValue = userNumerator / userDenominator;

      // 比較浮點數 (雖然這裡大多是整數除法，但為了保險可以用 epsilon，不過目前邏輯是用恆等)
      // 小學生題目通常數值單純，直接比較即可
      const isCorrect =
        Math.abs(correctValue - userValue) < Number.EPSILON * 10 ||
        correctValue === userValue;

      const correctAnswer = `${this.componentConfig.numerator}/${this.componentConfig.denominator}`;
      const userAnswer = `${userNumerator}/${userDenominator}`;

      this.$emit("replyAnswer", isCorrect);
      this.$emit("recordAnswer", [
        correctAnswer,
        userAnswer,
        isCorrect ? "正確" : "錯誤",
      ]);
    },
    closeNumPad() {
      this.virtualNumpadSwitch = false;
    },
    handleNativeInput() {
      this.adjustInputWidth();
      this.validateAnswer();
    },
    updateInputValue(label) {
      if (this.activeInputRef) {
        const input = this.$refs[this.activeInputRef];
        input.value += label;
        this.adjustInputWidth();
      }
    },
    clearActiveInput() {
      if (this.activeInputRef) {
        const input = this.$refs[this.activeInputRef];
        input.value = "";
        this.adjustInputWidth();
        this.validateAnswer();
      }
    },
    adjustInputWidth() {
      // 找出所有 active 的 input
      const inputs = [];
      if (this.isNumeratorInput && this.$refs.numerator) {
        inputs.push(this.$refs.numerator);
      }
      if (this.isDenominatorInput && this.$refs.denominator) {
        inputs.push(this.$refs.denominator);
      }

      if (inputs.length === 0) return;

      // 計算最大長度
      let maxLength = 3; // 預設 3
      inputs.forEach((input) => {
        if (input.value.length > maxLength) {
          maxLength = input.value.length;
        }
      });

      // 計算縮放比例 (基準 3 個字不縮放)
      const baseLength = 3;
      const scale = Math.min(1, baseLength / maxLength);

      // 套用寬度到所有 input
      inputs.forEach((input) => {
        // 使用 ch 單位，大概 1ch = 1 個數字寬度
        // 加上 padding/border 的餘裕 (+2 ch)
        // 這裡統一設定，如果長度 <= 3 其實 4ch 就夠 (預設width: 4ch)
        // 但為了同步，如果有一個 > 3，所有的都要變大
        // 當縮放時，字體變小，ch 也會變小，所以寬度數值依然適用
        if (maxLength > 3) {
          input.style.width = maxLength + 2 + "ch";
        } else {
          input.style.width = ""; // 回復 CSS 預設 (4ch)
        }

        // 套用縮放字體
        // input.style.fontSize = `${scale}em`; // Moved to container level
      });

      this.containerScale = scale;
    },
  },
};
</script>

<style scoped>
.fraction-for-answer-wrapper {
  width: 100%;
  height: 100%;
  container-type: size;
}

.fraction-for-answer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1em;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  font-size: clamp(
    1rem,
    min(30cqh, calc(100cqw / var(--estimated-width, 3.5))),
    3rem
  ); /* Respond to container min dimension depending on texts */
}

.fraction-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  width: auto;
  height: 100%;
}

.fraction-input,
.fraction-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4ch;
  max-width: 100%;
  max-height: 2em;
  min-height: 0; /* Important for flex items to not overflow vertically */
  padding: 0 0.2em;
  text-align: center;
  box-sizing: border-box;
}

.line {
  display: block;
  border-top: 0.1em solid black;
  width: 100%;
  margin: 0.1em 0;
  transform: scaleX(1.25); /* Widen the line visually */
  flex-shrink: 0;
}

.prefix,
.suffix {
  /* font-size: 1em; */
  display: flex;
  align-items: center;
  white-space: nowrap;
}
</style>
