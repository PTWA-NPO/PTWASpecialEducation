<template>
  <button
    type="button"
    class="calculator-button"
    :class="[
      `calculator-button--${variant}`,
      {
        'calculator-button--wide': wide,
        'calculator-button--active': active,
      },
    ]"
    @click="$emit('press')"
  >
    <span
      class="calculator-button__label"
      :class="labelClasses"
    >
      {{ label }}
    </span>
  </button>
</template>

<script>
export default {
  name: "CalculatorButton",
  props: {
    label: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: "digit",
    },
    wide: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    symbolKey: {
      type: String,
      default: "",
    },
  },
  emits: ["press"],
  computed: {
    labelClasses() {
      return this.symbolKey
        ? [`calculator-button__label--${this.symbolKey}`]
        : [];
    },
  },
};
</script>

<style lang="scss" scoped>
.calculator-button {
  box-sizing: border-box;
  border: none;
  border-radius: 26px;
  min-height: 0;
  height: 100%;
  width: 100%;
  padding: 0.45rem;
  font-family: "YuanQuan", sans-serif;
  font-size: clamp(1.2rem, 2.6vw, 1.65rem);
  font-weight: 700;
  color: $dark-color;
  box-shadow:
    0 0.35rem 0 rgba(0, 0, 0, 0.08),
    inset 0 0.15rem 0 rgba(255, 255, 255, 0.8);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px) scale(0.99);
    box-shadow:
      0 0.16rem 0 rgba(0, 0, 0, 0.08),
      inset 0 0.1rem 0 rgba(255, 255, 255, 0.7);
  }

  &--wide {
    grid-column: span 2;
  }

  &--digit {
    background: linear-gradient(180deg, #ffffff 0%, #f8f4eb 100%);
  }

  &--utility {
    background: linear-gradient(180deg, #d8efe1 0%, #bfd8c7 100%);
  }

  &--operator {
    background: linear-gradient(180deg, #ffd19b 0%, #ffb86a 100%);
  }

  &--equals {
    background: linear-gradient(180deg, #8cd5d1 0%, #5fb9c2 100%);
    color: $light-color;
  }

  &--active {
    background: linear-gradient(180deg, #ff9c5d 0%, #f97c3c 100%);
    color: $light-color;
    box-shadow:
      0 0.45rem 0 rgba(249, 124, 60, 0.28),
      inset 0 0.15rem 0 rgba(255, 255, 255, 0.28);
  }

  &__label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    line-height: 1;
  }

  &__label--divide {
    transform: translateX(0.06em);
  }

  &__label--multiply {
    transform: translateX(0.04em);
  }
}
</style>
