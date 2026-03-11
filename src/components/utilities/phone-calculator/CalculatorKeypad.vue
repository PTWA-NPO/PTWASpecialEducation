<template>
  <div class="calculator-keypad">
    <CalculatorButton
      v-for="key in keypadKeys"
      :key="`${key.type}-${key.label}`"
      :label="key.label"
      :variant="key.variant"
      :wide="key.wide"
      :symbol-key="key.symbolKey"
      :active="Boolean(key.operator && activeOperator === key.operator)"
      @press="emitAction(key)"
    />
  </div>
</template>

<script>
import CalculatorButton from "./CalculatorButton.vue";

export default {
  name: "CalculatorKeypad",
  components: {
    CalculatorButton,
  },
  props: {
    clearLabel: {
      type: String,
      default: "AC",
    },
    activeOperator: {
      type: String,
      default: null,
    },
  },
  emits: ["action"],
  computed: {
    keypadKeys() {
      return [
        {
          label: this.clearLabel,
          type: "clear",
          variant: "utility",
        },
        {
          label: "+/-",
          type: "sign",
          variant: "utility",
        },
        {
          label: "%",
          type: "percent",
          variant: "utility",
        },
        {
          label: "÷",
          type: "operator",
          operator: "÷",
          variant: "operator",
          symbolKey: "divide",
        },
        {
          label: "7",
          type: "digit",
          value: "7",
          variant: "digit",
        },
        {
          label: "8",
          type: "digit",
          value: "8",
          variant: "digit",
        },
        {
          label: "9",
          type: "digit",
          value: "9",
          variant: "digit",
        },
        {
          label: "×",
          type: "operator",
          operator: "×",
          variant: "operator",
          symbolKey: "multiply",
        },
        {
          label: "4",
          type: "digit",
          value: "4",
          variant: "digit",
        },
        {
          label: "5",
          type: "digit",
          value: "5",
          variant: "digit",
        },
        {
          label: "6",
          type: "digit",
          value: "6",
          variant: "digit",
        },
        {
          label: "−",
          type: "operator",
          operator: "-",
          variant: "operator",
        },
        {
          label: "1",
          type: "digit",
          value: "1",
          variant: "digit",
        },
        {
          label: "2",
          type: "digit",
          value: "2",
          variant: "digit",
        },
        {
          label: "3",
          type: "digit",
          value: "3",
          variant: "digit",
        },
        {
          label: "+",
          type: "operator",
          operator: "+",
          variant: "operator",
        },
        {
          label: "0",
          type: "digit",
          value: "0",
          variant: "digit",
          wide: true,
        },
        {
          label: ".",
          type: "decimal",
          variant: "digit",
        },
        {
          label: "=",
          type: "equals",
          variant: "equals",
        },
      ];
    },
  },
  methods: {
    emitAction(key) {
      if (key.type === "digit") {
        this.$emit("action", {
          type: "digit",
          value: key.value,
        });
        return;
      }

      if (key.type === "operator") {
        this.$emit("action", {
          type: "operator",
          value: key.operator,
        });
        return;
      }

      this.$emit("action", {
        type: key.type,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.calculator-keypad {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;
}
</style>
