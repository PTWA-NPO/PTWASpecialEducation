<template>
  <Teleport to="body">
    <div
      ref="numpad"
      class="floating-num-pad"
      :style="{ top: adjustedTop, left: adjustedLeft }"
    >
      <button
        v-for="button in buttons"
        :key="button.label"
        :class="getButtonClass(button.label)"
        @click="handleClick(button.label)"
      >
        {{ button.label }}
      </button>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "FloatNumPad",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  emits: ["buttonClicked"],
  data() {
    return {
      // 使用物件陣列來描述每個按鈕，並設定其標籤和類型
      buttons: [
        { label: 1, type: "number" },
        { label: 2, type: "number" },
        { label: 3, type: "number" },
        { label: 4, type: "number" },
        { label: 5, type: "number" },
        { label: 6, type: "number" },
        { label: 7, type: "number" },
        { label: 8, type: "number" },
        { label: 9, type: "number" },
        { label: "清除", type: "clear" },
        { label: 0, type: "number" },
        { label: "關閉", type: "close" },
      ],
      adjustedTop: "0px",
      adjustedLeft: "0px",
      bais: 15,
    };
  },
  watch: {
    Data: {
      handler() {
        this.adjustPosition();
      },
      deep: true,
    },
  },
  mounted() {
    this.adjustPosition();
    window.addEventListener("resize", this.adjustPosition);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.adjustPosition);
  },
  methods: {
    handleClick(label) {
      this.$emit("buttonClicked", label);
    },
    adjustPosition() {
      this.$nextTick(() => {
        const numpad = this.$refs.numpad;
        if (!numpad) return;
        const numpadRect = numpad.getBoundingClientRect();
        const numpadWidth = numpadRect.width;
        const numpadHeight = numpadRect.height;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = parseFloat(this.Data.top) + this.bais;
        let left = parseFloat(this.Data.left) + this.bais;

        if (top + numpadHeight > viewportHeight) {
          top = viewportHeight - numpadHeight;
        }
        if (top < 0) {
          top = 0;
        }

        if (left + numpadWidth > viewportWidth) {
          left = viewportWidth - numpadWidth;
        }
        if (left < 0) {
          left = 0;
        }

        this.adjustedTop = top + "px";
        this.adjustedLeft = left + "px";
      });
    },
    getButtonClass(label) {
      if (label === "清除") return "button-clear";
      if (label === "關閉") return "button-close";
      return "button-number";
    },
  },
};
</script>

<style scoped lang="scss">
.floating-num-pad {
  position: absolute;
  display: grid;
  width: 11rem;
  background: $primary-color;
  border: black solid 2px;
  grid-template-columns: repeat(3, 1fr);
  padding: 0.2rem;
  justify-content: center;
  align-items: center;
  gap: $gap--tiny;
  border-radius: $border-radius;
}

button {
  width: 3rem;
  height: 3rem;
  font-size: 14px;
  @extend .button-basic;
}

.button-number {
  background-color: $sub-color;
}

.button-clear {
  background-color: $warning-color;
}

.button-close {
  background-color: $error-color;
  color: white;
}
</style>
