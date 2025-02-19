<template>
  <div :class="$attrs.class">
    <div ref="container" class="fraction-for-answer">
      <input
        ref="numerator"
        class="fraction-input numerator"
        type="text"
        @click="showNumPad('numerator', $event)"
      />
      <span class="line"></span>
      <input
        ref="denominator"
        class="fraction-input denominator"
        type="text"
        @click="showNumPad('denominator', $event)"
      />
    </div>
    <FloatNumPad
      v-if="virtualNumpadSwitch"
      :Data="numPadPosition"
      @buttonClicked="numPadButtonClicked"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "FractionForAnswer",
  components: {
    FloatNumPad: defineAsyncComponent(() =>
      import("@/components/FloatNumPad.vue")
    ),
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
    };
  },
  methods: {
    showNumPad(inputRef, event) {
      const inputRect = event.target.getBoundingClientRect();

      this.activeInputRef = inputRef;

      this.numPadPosition = {
        top: `${inputRect.bottom + window.scrollY + this.numPadOffset}px`,
        left: `${inputRect.left + window.scrollX}px`,
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
      const userNumerator = this.$refs.numerator.value;
      const userDenominator = this.$refs.denominator.value;

      const correctAnswer = `${this.Data.numerator}/${this.Data.denominator}`;

      const isCorrect =
        parseInt(userNumerator, 10) === this.Data.numerator &&
        parseInt(userDenominator, 10) === this.Data.denominator;

      let userAnswer = `${parseInt(userNumerator, 10) || null}/${
        parseInt(userDenominator, 10) || null
      }`;
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
    clearActiveInput() {
      if (this.activeInputRef) {
        this.$refs[this.activeInputRef].value = "";
      }
    },
    updateInputValue(label) {
      if (this.activeInputRef) {
        const input = this.$refs[this.activeInputRef];
        input.value += label;
      }
    },
  },
};
</script>

<style scoped>
.fraction-for-answer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 0.2rem;
}

.fraction-input {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  text-align: center;
  font-size: 1.5rem;
}

.line {
  display: block;
  border-top: 0.2rem solid black;
  width: 100%;
  margin: 2px 0;
}
</style>
