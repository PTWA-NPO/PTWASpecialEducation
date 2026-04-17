<template>
  <div class="draggable-number-board">
    <!-- Row 1: Drop Zones (Answers) -->
    <div class="board-row drop-row">
      <div
        v-for="(slot, index) in answers"
        :key="'slot-' + index"
        class="board-cell drop-zone"
        :class="{ 'has-item': slot.value, 'is-wrong': slot.isWrong }"
        @dragover.prevent
        @dragenter.prevent="dragEnter(index)"
        @dragleave="dragLeave(index)"
        @drop="onDrop($event, index)"
        @click="returnToPool(index)"
      >
        <div v-if="slot.value" class="dropped-item">
          <span>{{ slot.value }}</span>
        </div>
      </div>
    </div>

    <!-- Row 2: Draggable Numerals (Pool) -->
    <div class="board-row pool-row">
      <div
        v-for="(numeral, index) in poolNumerals"
        :key="'numeral-' + index"
        class="board-cell draggable-cell numeral-cell"
        draggable="true"
        @dragstart="onDragStart($event, numeral, 'numeral')"
      >
        {{ numeral }}
      </div>
    </div>

    <!-- Row 3: Draggable Units (Pool) -->
    <div class="board-row pool-row">
      <div
        v-for="(unit, index) in poolUnits"
        :key="'unit-' + index"
        class="board-cell draggable-cell unit-cell"
        draggable="true"
        @dragstart="onDragStart($event, unit, 'unit')"
      >
        {{ unit }}
      </div>
    </div>
  </div>
</template>

<script>
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "DraggableNumberBoard",
  props: {
    componentConfig: {
      type: [Array, Object],
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      expectedSequence: [], // Flat array of expected strings
      answers: [], // Flat array of slots { value: null, type: null }
      poolNumerals: [
        "零",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九",
      ],
      poolUnits: ["萬", "千", "百", "十"],
      dragSource: null, // Track what is currently being dragged
    };
  },
  computed: {
    answerArray() {
      const config = this.componentConfig;
      if (!config) return [];

      // Support Data.answer or Data.Answer or array directly
      if (config.Data) {
        if (Array.isArray(config.Data.answer)) return config.Data.answer;
        if (Array.isArray(config.Data.Answer)) return config.Data.Answer;
        if (Array.isArray(config.Data)) return config.Data;
      }

      if (Array.isArray(config.answer)) return config.answer;
      if (Array.isArray(config.Answer)) return config.Answer;
      if (Array.isArray(config)) return config;

      return [];
    },
  },
  watch: {
    answerArray: {
      immediate: true,
      handler(newArr) {
        if (newArr && newArr.length > 0) {
          this.initGame(newArr);
        }
      },
    },
  },
  created() {
    emitter.on("submitAnswer", this.markWrong);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.markWrong);
  },
  methods: {
    initGame(answerArr) {
      if (!Array.isArray(answerArr)) return;

      this.expectedSequence = [...answerArr];

      // Initialize empty answer slots, one for each expected item
      this.answers = answerArr.map(() => ({
        value: null,
        type: null,
        isWrong: false,
      }));

      // No need to shuffle or create items dynamically anymore
      // We rely on the static poolNumerals and poolUnits defined in data()

      // Reset answer state
      this.$emit("replyAnswer", false);
    },

    onDragStart(event, item, type) {
      this.clearAllErrors();
      this.dragSource = { item, type };
      event.dataTransfer.effectAllowed = "copy";
      // Minimal data just to satisfy HTML5 spec, we use this.dragSource for actual logic
      event.dataTransfer.setData("text/plain", item);
    },

    dragEnter() {
      // Optional Visual Feedback
    },

    dragLeave() {
      // Optional Visual Feedback
    },

    onDrop(event, slotIndex) {
      const source = this.dragSource;
      if (!source) return;

      const slot = this.answers[slotIndex];

      // Assign the new item to the slot
      slot.value = source.item;
      slot.type = source.type;

      this.dragSource = null;
      this.checkAnswer();
    },

    returnToPool(slotIndex) {
      this.clearAllErrors();
      const slot = this.answers[slotIndex];

      if (slot.value !== null) {
        slot.value = null;
        slot.type = null;
      }

      this.checkAnswer();
    },

    checkAnswer() {
      // Are all slots completely filled?
      const isComplete = this.answers.every((s) => s.value);

      // Do they match the expected sequence?
      const isCorrect = this.answers.every(
        (slot, index) => slot.value === this.expectedSequence[index]
      );

      if (isComplete) {
        this.$emit("replyAnswer", isCorrect);
      } else {
        this.$emit("replyAnswer", false);
      }
    },

    clearAllErrors() {
      this.answers.forEach((slot) => {
        slot.isWrong = false;
      });
    },

    markWrong() {
      // Mark specific incorrect slots based on expected sequence
      this.answers.forEach((slot, index) => {
        if (slot.value !== this.expectedSequence[index]) {
          slot.isWrong = true;
        } else {
          slot.isWrong = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.draggable-number-board {
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  align-items: center;
  font-family: inherit;
  margin: 10px;
  width: 100%;
}

.board-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.board-cell {
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: white;
  user-select: none;
}

/* Drop Zone Styles */
.drop-zone {
  border: 2px dashed #888;
  background-color: #f9f9f9;
  cursor: pointer;
}

.drop-zone.has-item {
  border-style: solid;
  border-color: #333;
  background-color: #e6f7ff;
}

.drop-zone.is-wrong {
  border-color: red !important;
  background-color: #ffe6e6 !important;
}

.dropped-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Pool Items Styles */
.draggable-cell {
  cursor: grab;
  border-color: #333;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.draggable-cell:active {
  cursor: grabbing;
}

.numeral-cell {
  background-color: #fff0f0;
}

.unit-cell {
  background-color: #f0fff0;
}

/* Hide items in the pool when they are used in a drop zone */
.invisible {
  opacity: 0;
  pointer-events: none;
}
</style>
