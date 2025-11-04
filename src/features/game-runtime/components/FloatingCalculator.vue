<template>
  <div
    v-if="visible"
    class="floating-calculator"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
  >
    <!-- 拖曳標題欄 -->
    <div class="calculator-header" @mousedown="startDrag">
      <div class="header-title">計算板</div>
      <div class="header-controls">
        <button class="minimize-btn" @click="toggleMinimize">
          {{ isMinimized ? "□" : "−" }}
        </button>
        <button class="close-btn" @click="closeCalculator">×</button>
      </div>
    </div>

    <!-- 計算類型選擇器 -->
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

    <!-- 計算板內容 -->
    <div v-if="!isMinimized" class="calculator-content">
      <GenericBoard
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
} from "@/components/components-utilitys/calculation-board/index.js";

const GenericBoard = defineAsyncComponent(
  () =>
    import(
      "@/components/components-utilitys/calculation-board/GenericBoard.vue"
    )
);

export default {
  name: "FloatingCalculator",
  components: {
    GenericBoard,
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
      selectedType: "addsub",
      calculatorTypes: [
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
      return this.calculatorData[this.selectedType];
    },
  },

  beforeUnmount() {
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.stopDrag);
  },
  methods: {
    startDrag(event) {
      // 防止點擊按鈕時觸發拖曳
      if (event.target.tagName === "BUTTON") return;

      this.isDragging = true;
      const rect = event.currentTarget.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);

      // 防止文字選擇
      event.preventDefault();
    },

    onDrag(event) {
      if (!this.isDragging) return;

      const newX = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;

      // 限制不超出視窗邊界
      const maxX = window.innerWidth - 600; // 計算板寬度
      const maxY = window.innerHeight - 500; // 計算板高度

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
      console.log("切換計算類型:", type);
      this.selectedType = type;
    },

    handleCalculatorResult(result) {
      console.log("計算結果:", result);
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
  width: 500px;
  height: 700px;
  background-color: #ffffff;
  border: 2px solid #a5adb1;
  border-radius: 10px;
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
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;

  .type-options {
    display: flex;
    gap: 10px;
    justify-content: center;

    .type-btn {
      padding: 8px 16px;
      border: 2px solid #a5adb1;
      border-radius: 5px;
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
  padding: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
