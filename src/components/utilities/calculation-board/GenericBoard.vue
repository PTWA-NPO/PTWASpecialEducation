<template>
  <div class="Board__container">
    <table class="Board__table">
      <tr v-if="unitArray">
        <td
          v-for="(unit, index) in unitArray"
          :key="`unit-${index}`"
          class="table__unit-text"
        >
          {{ unit }}
        </td>
      </tr>
      <tr v-if="carryBorrowArray">
        <td
          v-for="(carry, index) in carryBorrowArray"
          :key="`carry-${index}`"
          :style="{
            visibility: carry.visible ? 'visible' : 'hidden',
          }"
        >
          <button
            class="table__carry-button"
            :class="{ 'table__carry-button--wrong': carry.isWrong }"
            @click="handleClick(carry, 'carryBorrow', index, $event)"
          >
            {{ carry.text }}
          </button>
        </td>
      </tr>
      <tr v-for="(row, rowIndex) in operationArray" :key="`row-${rowIndex}`">
        <td
          v-for="(item, itemIndex) in row"
          :key="`item-${itemIndex}`"
          :class="`table__td${item.class}`"
          :style="{
            visibility: item.visible ? 'visible' : 'hidden',
          }"
        >
          <button
            class="table__button"
            :class="{
              'table__button--question': !item.editable,
              'table__button--answer': item.editable,
              'table__button--place-value': item.class === 'place-value-cell',
              'table__button--wrong': item.isWrong,
              'table__button--crossed-out':
                !item.editable &&
                crossedOutItems.has(`${rowIndex}-${itemIndex}`),
            }"
            @click="handleClick(item, rowIndex, itemIndex, $event)"
          >
            {{ item.text }}
          </button>
        </td>
      </tr>
    </table>
    <FloatNumPad
      v-if="showNumPad"
      :component-config="numPadPosition"
      @button-clicked="handleNumPadInput"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
// import { getGameAssets } from "@/lib/get-assets.js"; // Feel free to change your the method to get assets.
export default {
  name: "GenericBoard",
  components: {
    FloatNumPad: defineAsyncComponent(
      () => import("@/components/FloatNumPad.vue")
    ),
    // Import your components here, you can use defineAsyncComponent for lazy loading
    // If you pretty sure that the component will be used in the template, you can import it here
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      unitArray: [],
      carryBorrowArray: [],
      operationArray: [],
      showNumPad: false,
      numPadPosition: {
        top: "0px",
        left: "0px",
      },
      currentTarget: null,
      operators: ["", "+", "-"],
      crossedOutItems: new Set(), // ?啣?嚗??◤??????
    };
  },
  computed: {
    // Your computed properties here
  },
  watch: {
    // ???蔭霈嚗??啣?憪?閮???
    config: {
      handler() {
        this.initializeBoard();
      },
      deep: true,
    },
    data: {
      handler() {
        this.initializeBoard();
      },
      deep: true,
    },
  },
  beforeMount() {
    this.initializeBoard();
  },
  created() {
    // ?? checkAnswer 鈭辣
    emitter.on("checkAnswer", this.markWrong);
  },
  beforeUnmount() {
    // 蝘駁鈭辣????
    emitter.off("checkAnswer", this.markWrong);
  },
  methods: {
    initializeBoard() {
      try {
        if (!this.data || !this.config || !this.config.getGrid) {
          console.warn("GenericBoard: Missing required props or methods");
          return;
        }

        // ?蔭?????
        this.crossedOutItems.clear();

        const { unit, carry, operation } = this.config.getGrid(this.data);

        this.unitArray = unit;
        this.carryBorrowArray = carry.map((item) => ({
          ...item,
          text: "",
          isValid: true,
          visible: item.visible,
          isWrong: false,
        }));
        this.operationArray = operation;
      } catch (error) {
        console.error("GenericBoard initialization error:", error);
      }
    },
    handleClick(item, rowIndex, itemIndex, event) {
      if (!item.editable) {
        // ??銝蝺刻摩?????- ???????
        const itemKey = `${rowIndex}-${itemIndex}`;
        if (this.crossedOutItems.has(itemKey)) {
          this.crossedOutItems.delete(itemKey);
        } else {
          this.crossedOutItems.add(itemKey);
        }
        return;
      }

      const rect = event.target.getBoundingClientRect();

      this.currentTarget = {
        row: rowIndex,
        col: itemIndex,
        isCarryBorrow: rowIndex === "carryBorrow",
      };

      if (item.editable === "operator") {
        // 敺芰????蝚西?
        const currentIndex = this.operators.indexOf(item.text);
        const nextIndex = (currentIndex + 1) % this.operators.length;
        this.operationArray[rowIndex][itemIndex].text =
          this.operators[nextIndex];
        const isCorrect = this.checkAnswer();
        this.$emit("replyAnswer", isCorrect);
      } else {
        this.numPadPosition = {
          top: `${rect.top + window.scrollY}px`,
          left: `${rect.right + window.scrollX + 10}px`,
        };
        this.showNumPad = true;
      }
    },
    handleNumPadInput(input) {
      if (input === "??") {
        this.showNumPad = false;
        return;
      }

      if (!this.currentTarget) return;

      const { row, col, isCarryBorrow } = this.currentTarget;
      const targetArray = isCarryBorrow
        ? this.carryBorrowArray
        : this.operationArray;
      const targetItem = isCarryBorrow
        ? targetArray[col]
        : targetArray[row][col];

      if (input === "皜") {
        targetItem.text = "";
      } else {
        if (isCarryBorrow) {
          // ?脖???甈??憭撓??雿摮?
          if (targetItem.text.length >= 2) return;
          targetItem.text += input;
        } else {
          // 銝?祆?雿?交??
          targetItem.text = input;
        }
      }

      // 瑼Ｘ蝑?銝阡??摮??
      const isCorrect = this.checkAnswer();
      this.$emit("replyAnswer", isCorrect);

      // ?脖???甈?頛詨摰?雿摮???嚗??祆?雿撓?亙?蝡??
      if (!isCarryBorrow || targetItem.text.length === 2) {
        this.showNumPad = false;
      }
    },
    checkAnswer() {
      if (this.data.mode !== "checkAnswer") return true;

      // 蝯曹???獢炎?仿?頛?
      let isCorrect = true;
      for (let i = 0; i < this.operationArray.length; i++) {
        for (let j = 0; j < this.operationArray[i].length; j++) {
          const cell = this.operationArray[i][j];
          // ?芣炎?交?蝑?銝閬??舐楊頛舐?甈?
          if (
            cell.visible &&
            cell.editable &&
            cell.answer &&
            cell.answer !== ""
          ) {
            const isValid = cell.answer.toString() === cell.text.toString();
            if (!isValid) {
              isCorrect = false;
            }
            cell.isValid = isValid;
          }
        }
      }
      return isCorrect;
    },
    markWrong() {
      // ?蔭??隤斗?閮?
      this.resetWrongMarks();

      // 瑼Ｘ蝑?銝行?閮隤?
      this.checkAnswer();

      // 璅??航炊??雿?
      for (let i = 0; i < this.operationArray.length; i++) {
        for (let j = 0; j < this.operationArray[i].length; j++) {
          const cell = this.operationArray[i][j];
          if (
            cell.visible &&
            cell.editable &&
            cell.answer &&
            cell.answer !== ""
          ) {
            const isValid = cell.answer.toString() === cell.text.toString();
            cell.isWrong = !isValid;
          }
        }
      }
    },
    resetWrongMarks() {
      // ?蔭??????隤斗?閮?
      for (let i = 0; i < this.operationArray.length; i++) {
        for (let j = 0; j < this.operationArray[i].length; j++) {
          const cell = this.operationArray[i][j];
          if (cell) {
            cell.isWrong = false;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Board__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.Board__table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  border: none;
  font-size: $text-medium;
  table-layout: fixed;

  td {
    padding: 8px;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
  }
}

button {
  border: none;
  width: 100%;
  height: 100%;
}

.table__row--border-bottom {
  border-bottom: 1px solid #000;
}

.table__td--border-bottom {
  border-bottom: 2px solid #000;
}

.table__td--border-right {
  border-right: 2px solid #000;
}

.table__button {
  border: none;
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.table__button--question {
  background-color: #c4cfc5;
  color: #000;
}

.table__button--answer {
  background-color: #f0f4ef;
  cursor: pointer;
}

.table__button--place-value {
  background-color: #e8f4f8;
}

.table__button--wrong {
  background-color: #ff6b6b !important;
  color: white !important;
}

.table__button--crossed-out {
  position: relative;
  color: #888;
}

.table__button--crossed-out::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ff6b6b;
  transform: translateY(-50%) rotate(45deg);
  transform-origin: center;
}

.table__unit-text {
  border-radius: 15px;
  color: #000;
  writing-mode: vertical-lr;
  text-orientation: upright;
}

.table__carry-button {
  border: 3px dashed #198754;
  border-radius: 5px;
  background-color: #fff;
  color: #afafaf;
  width: 100%;
  height: 100%;
}

.table__carry-button--wrong {
  border-color: #ff6b6b !important;
  background-color: #ff6b6b !important;
  color: white !important;
}
</style>



