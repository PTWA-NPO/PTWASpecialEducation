<template>
  <div class="phone-calculator-panel">
    <div class="phone-calculator-panel__shell">
      <div class="phone-calculator-panel__camera" />
      <CalculatorDisplay
        :display="calculatorState.display"
        :expression="calculatorState.expression"
        :show-expression="showExpression"
        :is-error="isError"
      />
      <CalculatorKeypad
        :clear-label="clearLabel"
        :active-operator="activeOperator"
        @action="handleAction"
      />
    </div>
  </div>
</template>

<script>
import CalculatorDisplay from "./CalculatorDisplay.vue";
import CalculatorKeypad from "./CalculatorKeypad.vue";
import {
  applyCalculatorAction,
  createInitialState,
  getActiveOperator,
  getClearLabel,
  isErrorState,
} from "./calculatorEngine.js";
import {
  DEFAULT_PRECISION,
  matchesExpectedValue,
} from "./format.js";

export default {
  name: "PhoneCalculatorPanel",
  components: {
    CalculatorDisplay,
    CalculatorKeypad,
  },
  props: {
    componentConfig: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["replyAnswer", "calculatorResult"],
  data() {
    return {
      calculatorState: createInitialState(),
    };
  },
  computed: {
    precision() {
      return this.componentConfig.precision ?? DEFAULT_PRECISION;
    },
    showExpression() {
      return this.componentConfig.showExpression !== false;
    },
    hasExpectedAnswer() {
      return this.componentConfig.answer !== undefined;
    },
    clearLabel() {
      return getClearLabel(this.calculatorState);
    },
    activeOperator() {
      return getActiveOperator(this.calculatorState);
    },
    isError() {
      return isErrorState(this.calculatorState);
    },
  },
  methods: {
    handleAction(action) {
      const transition = applyCalculatorAction(this.calculatorState, action, {
        precision: this.precision,
      });

      this.calculatorState = transition.state;
      this.emitAnswerStatus();

      if (transition.emittedResult) {
        this.$emit("calculatorResult", {
          ...transition.emittedResult,
          display: this.calculatorState.display,
        });
      }
    },
    emitAnswerStatus() {
      if (!this.hasExpectedAnswer) {
        return;
      }

      this.$emit(
        "replyAnswer",
        matchesExpectedValue(
          this.calculatorState.display,
          this.componentConfig.answer,
          this.precision
        )
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.phone-calculator-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  min-height: 0;
  padding: 0;

  &__shell {
    box-sizing: border-box;
    position: relative;
    width: min(100%, 23rem);
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 2rem;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.65) 0%, transparent 32%),
      linear-gradient(180deg, #fff5df 0%, #dcefd9 58%, #c6e2dd 100%);
    border: 3px solid rgba(255, 255, 255, 0.72);
    box-shadow:
      0 1rem 2rem rgba(29, 29, 29, 0.14),
      inset 0 0.25rem 0 rgba(255, 255, 255, 0.72);

    &::before,
    &::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      opacity: 0.65;
      pointer-events: none;
    }

    &::before {
      top: 1rem;
      right: 1rem;
      width: 3.2rem;
      height: 3.2rem;
      background: rgba(255, 255, 255, 0.22);
    }

    &::after {
      bottom: 4.5rem;
      left: 0.8rem;
      width: 4rem;
      height: 4rem;
      background: rgba(255, 195, 123, 0.18);
    }
  }

  &__camera {
    align-self: center;
    width: 4rem;
    height: 0.38rem;
    border-radius: 999px;
    background: rgba(29, 29, 29, 0.18);
    box-shadow: inset 0 0.08rem 0 rgba(255, 255, 255, 0.4);
  }
}
</style>
