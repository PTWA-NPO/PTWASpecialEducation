<template>
  <div class="phone-calculator">
    <PhoneCalculatorPanel
      :component-config="componentConfig"
      @reply-answer="$emit('replyAnswer', $event)"
      @calculator-result="$emit('calculatorResult', $event)"
    />
  </div>
</template>

<script>
import PhoneCalculatorPanel from "@/components/utilities/phone-calculator/PhoneCalculatorPanel.vue";

export default {
  name: "PhoneCalculator",
  components: {
    PhoneCalculatorPanel,
  },
  props: {
    componentConfig: {
      type: Object,
      default: () => ({}),
    },
    gameId: {
      type: String,
      default: "",
    },
  },
  emits: ["replyAnswer", "calculatorResult"],
};
</script>

<style lang="scss" scoped>
.phone-calculator {
  width: 100%;
  height: 100%;
}
</style>
