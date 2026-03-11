<template>
  <div
    v-if="visible"
    ref="calculator"
    class="floating-calculator"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
  >
    <div class="calculator-header" @mousedown="startDrag">
      <div class="header-title">計算工具</div>
      <div class="header-controls">
        <button class="minimize-btn" @click="toggleMinimize">
          {{ isMinimized ? "□" : "−" }}
        </button>
        <button class="close-btn" @click="closeCalculator">×</button>
      </div>
    </div>

    <div v-if="!isMinimized" class="calculator-type-selector">
      <div class="type-options">
        <button
          v-for="type in calculatorTypes"
          :key="type.value"
          class="type-btn"
          :class="{ active: selectedType === type.value }"
          @click="selectCalculatorType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <div v-if="!isMinimized" class="calculator-content">
      <PhoneCalculator
        v-if="selectedType === 'phone'"
        :key="selectedType"
        :component-config="currentCalculatorData"
        :game-id="'floating-calculator'"
        @calculator-result="handleCalculatorResult"
      />
      <GenericBoard
        v-else
        :key="selectedType"
        :game-id="'floating-calculator'"
        :data="currentCalculatorData"
        :config="currentConfig"
        @reply-answer="handleCalculatorResult"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import {
  addsubConfig,
  multiplyConfig,
  divisionConfig,
  decimalConfig,
} from "@/components/utilities/calculation-board/index.js";

const GenericBoard = defineAsyncComponent(
  () => import("@/components/utilities/calculation-board/GenericBoard.vue")
);
const PhoneCalculator = defineAsyncComponent(
  () => import("@/components/PhoneCalculator.vue")
);

export default {
  name: "FloatingCalculator",
  components: {
    GenericBoard,
    PhoneCalculator,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "calculatorResult"],
  data() {
    return {
      position: { x: 100, y: 100 },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      isMinimized: false,
      selectedType: "phone",
      calculatorTypes: [
        { value: "phone", label: "手機計算機" },
        { value: "addsub", label: "加減法" },
        { value: "multiply", label: "乘法" },
        { value: "division", label: "除法" },
        { value: "decimal", label: "小數" },
      ],
      configs: {
        addsub: addsubConfig,
        multiply: multiplyConfig,
        division: divisionConfig,
        decimal: decimalConfig,
      },
      phoneCalculatorData: {
        showExpression: true,
        precision: 12,
      },
      calculatorData: {
        addsub: {
          type: "add",
          mode: "freeInput",
          digit: 3,
          unitType: "Number",
        },
        multiply: {
          type: "multiply",
          mode: "freeInput",
          digit: 3,
          unitType: "Number",
          customUnit: [],
        },
        division: {
          type: "division",
          mode: "freeInput",
          digit: 3,
          unitType: "Number",
          customUnit: [],
        },
        decimal: {
          type: "decimal",
          mode: "freeInput",
          digit: {
            beforeDecimal: 3,
            afterDecimal: 2,
          },
          unitType: "Number",
          customUnit: [],
        },
      },
    };
  },
  computed: {
    currentConfig() {
      return this.configs[this.selectedType];
    },
    currentCalculatorData() {
      if (this.selectedType === "phone") {
        return this.phoneCalculatorData;
      }

      return this.calculatorData[this.selectedType];
    },
  },
  mounted() {
    window.addEventListener("resize", this.keepWithinViewport);
    this.$nextTick(() => {
      this.centerInViewport();
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.keepWithinViewport);
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.stopDrag);
  },
  methods: {
    centerInViewport() {
      const calculatorWidth = this.$refs.calculator?.offsetWidth || 540;
      const calculatorHeight = this.$refs.calculator?.offsetHeight || 700;
      const horizontalPadding = 16;
      const verticalPadding = 16;
      const centeredX = (window.innerWidth - calculatorWidth) / 2;
      const centeredY = (window.innerHeight - calculatorHeight) / 2;

      this.position = {
        x: Math.max(horizontalPadding, centeredX),
        y: Math.max(verticalPadding, centeredY),
      };
    },
    keepWithinViewport() {
      const calculatorWidth = this.$refs.calculator?.offsetWidth || 540;
      const calculatorHeight = this.$refs.calculator?.offsetHeight || 700;
      const horizontalPadding = 16;
      const verticalPadding = 16;
      const maxX = Math.max(
        horizontalPadding,
        window.innerWidth - calculatorWidth - horizontalPadding
      );
      const maxY = Math.max(
        verticalPadding,
        window.innerHeight - calculatorHeight - verticalPadding
      );

      this.position = {
        x: Math.max(horizontalPadding, Math.min(this.position.x, maxX)),
        y: Math.max(verticalPadding, Math.min(this.position.y, maxY)),
      };
    },
    startDrag(event) {
      if (event.target.tagName === "BUTTON") return;

      this.isDragging = true;
      const rect = event.currentTarget.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      event.preventDefault();
    },
    onDrag(event) {
      if (!this.isDragging) return;

      const newX = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;
      const calculatorWidth = this.$refs.calculator?.offsetWidth || 500;
      const calculatorHeight = this.$refs.calculator?.offsetHeight || 700;
      const maxX = Math.max(0, window.innerWidth - calculatorWidth);
      const maxY = Math.max(0, window.innerHeight - calculatorHeight);

      this.position = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
    },
    closeCalculator() {
      this.$emit("close");
    },
    selectCalculatorType(type) {
      this.selectedType = type;
    },
    handleCalculatorResult(result) {
      this.$emit("calculatorResult", {
        type: this.selectedType,
        result,
        data: this.currentCalculatorData,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.floating-calculator {
  position: fixed;
  width: min(540px, calc(100vw - 32px));
  height: min(720px, calc(100vh - 32px));
  max-height: calc(100vh - 32px);
  background-color: #ffffff;
  border: 2px solid #a5adb1;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  user-select: none;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #a5adb1;
  border-radius: 8px 8px 0 0;
  cursor: move;

  .header-title {
    font-weight: bold;
    color: #495057;
    font-size: 1.1rem;
  }

  .header-controls {
    display: flex;
    gap: 5px;

    button {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 3px;
      background-color: #687174;
      color: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #494f52;
      }

      &.close-btn:hover {
        background-color: #dc3545;
      }
    }
  }
}

.calculator-type-selector {
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;

  .type-options {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;

    .type-btn {
      padding: 8px 16px;
      border: 2px solid #a5adb1;
      border-radius: 999px;
      background-color: #ffffff;
      color: #495057;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;

      &:hover {
        background-color: #e9ecef;
        border-color: #687174;
      }

      &.active {
        background-color: #007bff;
        border-color: #007bff;
        color: white;
      }
    }
  }
}

.calculator-content {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
</style>
