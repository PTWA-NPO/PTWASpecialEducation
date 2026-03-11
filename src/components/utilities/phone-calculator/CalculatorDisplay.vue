<template>
  <div class="calculator-display">
    <div v-if="showExpression" class="calculator-display__expression">
      {{ expression || "\u00A0" }}
    </div>
    <div
      class="calculator-display__value"
      :class="[
        displaySizeClass,
        { 'calculator-display__value--error': isError },
      ]"
      :title="display"
    >
      <span>{{ display }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalculatorDisplay",
  props: {
    display: {
      type: String,
      required: true,
    },
    expression: {
      type: String,
      default: "",
    },
    showExpression: {
      type: Boolean,
      default: true,
    },
    isError: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    displaySizeClass() {
      if (this.display.length > 16) {
        return "calculator-display__value--small";
      }

      if (this.display.length > 11) {
        return "calculator-display__value--medium";
      }

      return "calculator-display__value--large";
    },
  },
};
</script>

<style lang="scss" scoped>
.calculator-display {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-radius: 28px;
  padding: 0.8rem 1rem 0.9rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 247, 235, 0.92) 100%);
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    inset 0 0.18rem 0 rgba(255, 255, 255, 0.75),
    0 0.65rem 1.5rem rgba(29, 29, 29, 0.08);

  &__expression {
    min-height: 1.2rem;
    font-family: "YuanQuan", sans-serif;
    font-size: 0.88rem;
    color: rgba(29, 29, 29, 0.62);
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__value {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    min-height: 3.8rem;
    font-family: "YuanQuan", sans-serif;
    font-weight: 700;
    color: $dark-color;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;

    span {
      min-width: 100%;
      text-align: right;
      line-height: 1.1;
    }

    &--large {
      font-size: clamp(2.2rem, 4vw, 2.9rem);
    }

    &--medium {
      font-size: clamp(1.8rem, 3.2vw, 2.2rem);
    }

    &--small {
      font-size: clamp(1.25rem, 2.4vw, 1.55rem);
    }

    &--error {
      color: $error-color;
    }
  }
}
</style>
