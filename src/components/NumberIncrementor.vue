<template>
  <div class="number-incrementor__container">
    <div class="number-display">
      <span v-if="componentConfig.prefix" class="prefix">{{
        componentConfig.prefix
      }}</span>
      <template v-for="(digit, index) in formattedDigits" :key="index">
        <span v-if="digit === '.'" class="decimal-point">
          {{ digit }}
        </span>
        <span
          v-else
          class="digit"
          :class="{
            'digit--error':
              isChecking && !isDigitCorrect(getActualIndex(index)),
          }"
          @click="incrementDigit(getActualIndex(index))"
        >
          {{ digit }}
        </span>
      </template>
      <span v-if="componentConfig.suffix" class="suffix">{{
        componentConfig.suffix
      }}</span>
    </div>
  </div>
</template>

<script>
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "NumberIncrementor",
  props: {
    componentConfig: {
      type: Object,
      required: true,
      validator: (prop) => {
        return (
          typeof prop.digitCount === "number" &&
          (!prop.decimalPlaces || typeof prop.decimalPlaces === "number")
        );
      },
    },
  },
  emits: ["numberChanged", "replyAnswer"],
  data() {
    return {
      digits: Array(this.componentConfig.digitCount).fill(0),
      isChecking: false,
      correctDigits: [],
    };
  },
  computed: {
    formattedDigits() {
      const result = [...this.digits];
      if (this.componentConfig.decimalPlaces) {
        const insertPosition =
          this.digits.length - this.componentConfig.decimalPlaces;
        result.splice(insertPosition, 0, ".");
      }
      return result;
    },
  },
  mounted() {
    emitter.on("checkAnswer", () => {
      this.isChecking = true;
      this.checkDigits();
    });
  },
  beforeUnmount() {
    emitter.off("checkAnswer");
  },
  methods: {
    getActualIndex(displayIndex) {
      if (!this.componentConfig.decimalPlaces) return displayIndex;
      const decimalPosition =
        this.digits.length - this.componentConfig.decimalPlaces;
      return displayIndex > decimalPosition ? displayIndex - 1 : displayIndex;
    },
    incrementDigit(index) {
      this.digits[index] = (this.digits[index] + 1) % 10;

      const totalValue = this.digits.reduce((acc, curr, idx) => {
        return acc + curr * Math.pow(10, this.digits.length - 1 - idx);
      }, 0);
      const result = this.componentConfig.decimalPlaces
        ? totalValue / Math.pow(10, this.componentConfig.decimalPlaces)
        : totalValue;
      this.$emit("numberChanged", result);
      this.$emit("replyAnswer", result === this.componentConfig.answer);
    },
    checkDigits() {
      const answer = this.componentConfig.answer;
      const answerDigits = String(answer)
        .padStart(this.componentConfig.digitCount, "0")
        .split("")
        .map(Number);
      this.correctDigits = this.digits.map(
        (digit, index) => digit === answerDigits[index]
      );
    },
    isDigitCorrect(index) {
      return this.correctDigits[index];
    },
  },
};
</script>

<style scoped lang="scss">
.number-incrementor__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  .number-display {
    display: flex;

    .prefix,
    .suffix {
      font-size: 2rem;
      padding: 5px;
      user-select: none;
    }

    .decimal-point {
      font-size: 2rem;
      padding-top: 10px;
      padding-bottom: 10px;
      user-select: none;
    }

    .digit {
      font-size: 2rem;
      padding: 10px;
      border: 1px solid #ccc;
      min-width: 40px;
      text-align: center;
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: #f0f0f0;
      }

      &--error {
        color: red;
      }
    }
  }
}
</style>

