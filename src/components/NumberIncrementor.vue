<template>
  <div class="number-incrementor__container">
    <div class="number-display">
      <span
        v-for="(digit, index) in digits"
        :key="index"
        class="digit"
        @click="incrementDigit(index)"
      >
        {{ digit }}
      </span>
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
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["numberChanged"],
  data() {
    return {
      digits: Array(this.Data.digitCount).fill(0),
    };
  },
  methods: {
    incrementDigit(index) {
      this.digits[index] = (this.digits[index] + 1) % 10;

      const totalValue = this.digits.reduce((acc, curr, idx) => {
        return acc + curr * Math.pow(10, this.digits.length - 1 - idx);
      }, 0);

      this.$emit("numberChanged", totalValue);
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
    gap: 10px;

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
