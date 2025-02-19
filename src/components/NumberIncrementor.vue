<template>
  <div class="number-incrementor__container">
    <div class="number-display">
      <span v-if="Data.prefix" class="prefix">{{ Data.prefix }}</span>
      <template v-for="(digit, index) in formattedDigits" :key="index">
        <span v-if="digit === '.'" class="decimal-point">
          {{ digit }}
        </span>
        <span
          v-else
          class="digit"
          @click="incrementDigit(getActualIndex(index))"
        >
          {{ digit }}
        </span>
      </template>
      <span v-if="Data.suffix" class="suffix">{{ Data.suffix }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "NumberIncrementor",
  props: {
    Data: {
      type: Object,
      required: true,
      validator: (prop) => {
        return (
          typeof prop.digitCount === "number" &&
          (!prop.decimalPlaces || typeof prop.decimalPlaces === "number")
        );
      },
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["numberChanged", "replyAnswer"],
  data() {
    return {
      digits: Array(this.Data.digitCount).fill(0),
    };
  },
  computed: {
    formattedDigits() {
      const result = [...this.digits];
      if (this.Data.decimalPlaces) {
        const insertPosition = this.digits.length - this.Data.decimalPlaces;
        result.splice(insertPosition, 0, ".");
      }
      return result;
    },
  },
  methods: {
    getActualIndex(displayIndex) {
      if (!this.Data.decimalPlaces) return displayIndex;
      const decimalPosition = this.digits.length - this.Data.decimalPlaces;
      return displayIndex > decimalPosition ? displayIndex - 1 : displayIndex;
    },
    incrementDigit(index) {
      this.digits[index] = (this.digits[index] + 1) % 10;

      const totalValue = this.digits.reduce((acc, curr, idx) => {
        return acc + curr * Math.pow(10, this.digits.length - 1 - idx);
      }, 0);
      const result = this.Data.decimalPlaces
        ? totalValue / Math.pow(10, this.Data.decimalPlaces)
        : totalValue;
      this.$emit("numberChanged", result);
      this.$emit("replyAnswer", result === this.Data.answer);
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
      user-select: none; // 防止文本選中

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
}
</style>
