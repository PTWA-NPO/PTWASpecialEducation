<template>
  <div ref="container" class="ma3192">
    <div class="ma3192__form">
      <table class="ma3192__schedule-table">
        <template v-if="gameData.Level === 1">
          <thead class="ma3192__station-table">
            <tr v-for="(row, rowIndex) in stationData" :key="rowIndex">
              <th v-if="rowIndex === 0" rowspan="8">搭乘區間</th>
              <td v-for="(cell, cellIndex) in row.cells" :key="cellIndex">
                {{ cell }}
              </td>
            </tr>
          </thead>
        </template>
        <template v-if="gameData.Level === 2">
          <thead>
            <tr>
              <th class="ma3192__schedule-table__time-col">時間</th>
              <th v-for="(date, index) in scheduleData.dates" :key="index">
                {{ date.text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in scheduleData.rows" :key="rowIndex">
              <td>{{ row.time }}</td>
              <td
                v-for="(cell, cellIndex) in row.cells"
                :key="cellIndex"
                :colspan="cell.colspan"
                class="ma3192__schedule-table__cell ma3192__schedule-table__cell--draggable"
                @mousedown="handleStart($event, rowIndex, cellIndex)"
                @mousemove="handleMove"
                @mouseup="handleEnd"
                @touchstart.prevent="handleStart($event, rowIndex, cellIndex)"
                @touchmove.prevent="handleMove"
                @touchend="handleEnd"
              >
                {{ cell.text }}
              </td>
            </tr>
          </tbody>
        </template>
        <template v-if="gameData.Level === 3">
          <thead>
            <tr>
              <th rowspan="2">站名</th>
              <th colspan="3">車次</th>
            </tr>
            <tr>
              <th
                class="ma3192__schedule-table__cell ma3192__schedule-table__cell--draggable"
                @mousedown="handleStart($event, 0, 0)"
                @mousemove="handleMove"
                @mouseup="handleEnd"
                @touchstart.prevent="handleStart($event, 0, 0)"
                @touchmove.prevent="handleMove"
                @touchend="handleEnd"
              >
                110
              </th>
              <th
                class="ma3192__schedule-table__cell ma3192__schedule-table__cell--draggable"
                @mousedown="handleStart($event, 0, 0)"
                @mousemove="handleMove"
                @mouseup="handleEnd"
                @touchstart.prevent="handleStart($event, 0, 0)"
                @touchmove.prevent="handleMove"
                @touchend="handleEnd"
              >
                122
              </th>
              <th
                class="ma3192__schedule-table__cell ma3192__schedule-table__cell--draggable"
                @mousedown="handleStart($event, 0, 0)"
                @mousemove="handleMove"
                @mouseup="handleEnd"
                @touchstart.prevent="handleStart($event, 0, 0)"
                @touchmove.prevent="handleMove"
                @touchend="handleEnd"
              >
                116
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>高雄</td>
              <td>07:54</td>
              <td>12:05</td>
              <td>09:09</td>
            </tr>
            <tr>
              <td>臺南</td>
              <td>08:32</td>
              <td>12:42</td>
              <td>09:46</td>
            </tr>
            <tr>
              <td>嘉義</td>
              <td>08:57</td>
              <td>13:28</td>
              <td>10:28</td>
            </tr>
            <tr>
              <td>臺中</td>
              <td>09:54</td>
              <td>14:45</td>
              <td>11:45</td>
            </tr>
            <tr>
              <td>板橋</td>
              <td>11:26</td>
              <td>16:51</td>
              <td>-</td>
            </tr>
            <tr>
              <td>臺北</td>
              <td>11:37</td>
              <td>17:03</td>
              <td>14:03</td>
            </tr>
          </tbody>
        </template>
      </table>
    </div>

    <transition :name="transitionName" mode="out-in">
      <div
        v-if="currentQuestion"
        :key="currentQuestionIndex"
        class="ma3192__question"
      >
        <template v-if="currentQuestion.Type === 'DefaultDragBox'">
          <div>
            {{ currentQuestion.Text }}
            <div class="ma3192__drag-box"></div>
          </div>
        </template>
        <component
          :is="currentQuestion.Type"
          v-else
          :component-config="currentQuestion.Data"
          :game-id="gameId"
          @reply-answer="handleAnswer($event, currentQuestionIndex)"
        />
      </div>
    </transition>

    <!-- <div class="function-btns">
      <button class="ma3192__submit-btn" @click="submitSingleAnswer">
        送出答案
      </button>
      <button v-if="nextable" class="ma3192__submit-btn" @click="nextQuestion">
        下一題
      </button>
    </div> -->
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";

const COMPONENTS = {
  TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
  ImageContainer: defineAsyncComponent(
    () => import("@/components/ImageContainer.vue")
  ),
  NumberIncrementor: defineAsyncComponent(
    () => import("@/components/NumberIncrementor.vue")
  ),
  MarkdownRenderer: defineAsyncComponent(
    () => import("@/components/MarkdownRenderer.vue")
  ),
};

export default {
  name: "MA3192",
  components: COMPONENTS,

  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],

  data() {
    return {
      questionData: [],
      selectedElement: null,
      isDragging: false,
      dragPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      answer: [],
      originalPosition: null,
      cloneElement: null,
      currentQuestionIndex: 0,
      transitionName: "slide-right",
      nextable: false,
      scheduleData: {
        dates: [
          { text: "7月10日", colspan: 1 },
          { text: "7月11日", colspan: 1 },
        ],
        rows: [
          {
            time: "08：30～09：00",
            cells: [{ text: "報到集合", colspan: 2 }],
          },
          {
            time: "09：00～10：00",
            cells: [{ text: "暖身活動", colspan: 2 }],
          },
          {
            time: "10：00～11：40",
            cells: [
              { text: "足球", colspan: 1 },
              { text: "游泳", colspan: 1 },
            ],
          },
          {
            time: "11：40～13：30",
            cells: [{ text: "午餐與午休時間", colspan: 2 }],
          },
          {
            time: "13：30～14：30",
            cells: [
              { text: "桌球", colspan: 1 },
              { text: "籃球", colspan: 1 },
            ],
          },
          {
            time: "14：30～15：30",
            cells: [{ text: "羽球", colspan: 2 }],
          },
          {
            time: "15：30～16：30",
            cells: [
              { text: "跳跳床", colspan: 1 },
              { text: "體適能", colspan: 1 },
            ],
          },
        ],
      },
      stationData: [
        { cells: ["臺鐵嘉義"] },
        { cells: ["12", "頂六"] },
        { cells: ["20", "12", "吳鳳廟"] },
        { cells: ["31", "18", "12", "觸口"] },
        { cells: ["58", "43", "36", "25", "龍美"] },
        { cells: ["71", "56", "48", "38", "13", "嚴頭坪"] },
        { cells: ["87", "75", "67", "56", "30", "17", "奮起湖"] },
        { cells: ["120", "105", "98", "87", "62", "51", "49", "阿里山"] },
      ],
    };
  },

  computed: {
    currentQuestion() {
      if (!this.questionData || this.questionData.length === 0) {
        return null;
      }
      return this.questionData[this.currentQuestionIndex] || null;
    },
  },

  async mounted() {
    this.setQuestionData();
    this.answer = new Array(this.gameData.Questions.length).fill(null);
  },

  created() {
    emitter.on("submitAnswer", this.submitSingleAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitSingleAnswer);
    this.removeEventListeners();
  },

  methods: {
    removeEventListeners() {
      document.removeEventListener("mousemove", this.handleMove);
      document.removeEventListener("mouseup", this.handleEnd);
      document.removeEventListener("touchmove", this.handleMove);
      document.removeEventListener("touchend", this.handleEnd);
    },

    setQuestionData() {
      if (this.gameData && this.gameData.Questions) {
        this.questionData = this.gameData.Questions.map((question) => ({
          Text: question.Text,
          Type: question.Type,
          Data: question.Data,
        }));
      }
    },

    handleStart(event, columnIndex, elementIndex) {
      event.preventDefault();
      this.isDragging = true;
      this.selectedElement = { columnIndex, elementIndex };

      const pos = event.type === "touchstart" ? event.touches[0] : event;
      const draggedElement = event.target;
      const rect = draggedElement.getBoundingClientRect();

      this.originalPosition = {
        element: draggedElement,
        rect,
      };

      this.createCloneElement(rect);
      this.setStartPosition(pos, rect);
      this.addEventListeners();
    },

    createCloneElement(rect) {
      this.cloneElement = this.originalPosition.element.cloneNode(true);
      this.cloneElement.classList.add("dragging");
      Object.assign(this.cloneElement.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        position: "fixed",
        zIndex: "1000",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
      });
      document.body.appendChild(this.cloneElement);
    },

    setStartPosition(pos, rect) {
      this.startPosition = {
        x: pos.clientX - rect.left,
        y: pos.clientY - rect.top,
      };
      this.dragPosition = { x: 0, y: 0 };
    },

    addEventListeners() {
      document.addEventListener("mousemove", this.handleMove);
      document.addEventListener("mouseup", this.handleEnd);
      document.addEventListener("touchmove", this.handleMove);
      document.addEventListener("touchend", this.handleEnd);
    },

    handleMove(event) {
      if (!this.isDragging) return;

      const pos = event.type === "touchmove" ? event.touches[0] : event;
      this.updateCloneElementPosition(pos);
    },

    updateCloneElementPosition(pos) {
      if (this.cloneElement) {
        this.cloneElement.style.left = `${pos.clientX - this.startPosition.x}px`;
        this.cloneElement.style.top = `${pos.clientY - this.startPosition.y}px`;
      }
    },

    handleEnd() {
      if (!this.isDragging) return;

      this.removeEventListeners();
      this.resetDragState();
      this.checkDragTarget();
      this.cleanupCloneElement();
    },

    resetDragState() {
      this.isDragging = false;
      this.selectedElement = null;
      this.dragPosition = { x: 0, y: 0 };
    },

    checkDragTarget() {
      const dragBoxes = document.querySelectorAll(".ma3192__drag-box");
      const draggedRect = this.cloneElement.getBoundingClientRect();

      dragBoxes.forEach((dragBox) => {
        const boxRect = dragBox.getBoundingClientRect();
        if (this.isOverlapping(draggedRect, boxRect)) {
          this.handleDragBoxDrop(dragBox);
        }
      });
    },

    handleDragBoxDrop(dragBox) {
      const draggedText = this.originalPosition.element.textContent.trim();
      dragBox.textContent = draggedText;
      dragBox.style.justifyContent = "center";
      dragBox.style.alignItems = "center";
      dragBox.classList.remove("ma3192__drag-box--wrong");

      const questionIndex = this.currentQuestionIndex;
      const answer = this.gameData.Questions[questionIndex].Data.answer.trim();
      this.answer[questionIndex] = draggedText === answer;
    },

    cleanupCloneElement() {
      if (this.cloneElement) {
        document.body.removeChild(this.cloneElement);
        this.cloneElement = null;
      }
      this.originalPosition = null;
    },

    isOverlapping(rect1, rect2) {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },

    handleAnswer(event, index) {
      this.answer[index] = event;
    },

    submitSingleAnswer() {
      if (!this.currentQuestion) {
        console.warn("No current question available");
        return;
      }

      const currentQuestion =
        this.gameData.Questions[this.currentQuestionIndex];
      console.log("Current question:", currentQuestion);
      console.log("Current question type:", currentQuestion.Type);

      let isCorrect = false;

      if (currentQuestion.Type === "DefaultDragBox") {
        const dragBoxes = document.querySelectorAll(".ma3192__drag-box");
        console.log("Found drag boxes:", dragBoxes.length);

        if (dragBoxes.length === 0) {
          console.warn("No drag boxes found in DOM");
          return;
        }

        // 由於現在只顯示當前問題，所以拖拽框索引總是 0
        const dragBoxIndex = 0;

        console.log("Drag box index:", dragBoxIndex);

        if (dragBoxIndex < dragBoxes.length && dragBoxes[dragBoxIndex]) {
          const draggedText = dragBoxes[dragBoxIndex].textContent.trim();
          const answer = currentQuestion.Data.answer.trim();
          console.log("Dragged text:", draggedText);
          console.log("Expected answer:", answer);
          isCorrect = draggedText === answer;

          if (!isCorrect) {
            dragBoxes[dragBoxIndex].classList.add("ma3192__drag-box--wrong");
          }
        } else {
          console.warn("Drag box not found for current question");
          return;
        }
      } else {
        console.log(
          "Non-DefaultDragBox question, checking answer:",
          this.answer[this.currentQuestionIndex]
        );
        isCorrect = this.answer[this.currentQuestionIndex];
      }

      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex + 1}題答案`,
          `回答正確`,
          "正確",
        ]);
        if (this.currentQuestionIndex < this.questionData.length - 1) {
          this.nextable = true;
          this.nextQuestion();
        } else {
          this.nextable = false;
          this.$emit("next-question");
        }
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex + 1}題答案`,
          `回答錯誤`,
          "錯誤",
        ]);
      }
    },

    nextQuestion() {
      if (
        this.questionData &&
        this.currentQuestionIndex < this.questionData.length - 1
      ) {
        this.transitionName = "slide-left";
        this.currentQuestionIndex++;
      }
      this.nextable = false;
    },
  },
};
</script>

<style scoped lang="scss">
.ma3192 {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ma3192__form {
  width: 100%;
  flex: 1;
  min-height: 60%;
  overflow-y: auto;
}
.ma3192__schedule-table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.ma3192__schedule-table th,
.ma3192__schedule-table td {
  border: 1px solid #ccc;
  padding: 4px;
  text-align: center;
}

.ma3192__schedule-table th {
  background-color: #f0f0f0;
}

.ma3192__schedule-table__time-col {
  width: 200px;
}

.ma3192__schedule-table__cell {
  cursor: move;
  user-select: none;
  position: relative;
  text-align: center;
}

.ma3192__schedule-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.ma3192__schedule-table tr:hover {
  background-color: #f5f5f5;
}

.diagonal-header,
.diagonal-container,
.diagonal-line,
.diagonal-top,
.diagonal-bottom {
  display: none;
}

.ma3192__schedule-table__cell--draggable {
  cursor: move;
  user-select: none;
  position: relative;
}

.ma3192__schedule-table__cell--draggable:active {
  opacity: 0.7;
}

.ma3192__schedule-table__cell--draggable.dragging {
  background: rgba(255, 255, 255, 0.829);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 0;
  pointer-events: none;
  position: fixed !important;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ma3192__question {
  font-size: 1.5rem;
  white-space: pre-line;
  display: block;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.ma3192__question-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ma3192__question-text {
  font-size: 1.5rem;
}

.ma3192__drag-box {
  display: inline-block;
  min-width: 100px;
  min-height: 40px;
  border: 2px solid black;
  border-radius: 10px;
  background-color: #f8f8f8;
  margin-left: 10px;
  vertical-align: middle;
}

.ma3192__drag-box--wrong {
  background-color: #ffebee;
  border-color: #ffcdd2;
}

.function-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.ma3192__submit-btn {
  max-width: 200px;
  font-size: 1.5rem;
  border: none;
  background-color: $submit-btn-bg;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 10px;
  margin: 10px;
}

.ma3192__submit-btn:hover {
  background-color: #d3d3d3;
}

.vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background: #f7f7a1;
  font-weight: bold;
  font-size: 18px;
}

.ma3192__station-table th,
.ma3192__station-table td {
  width: 100px;
  white-space: nowrap;
}

.ma3192__station-table td {
  width: 100px;
  cursor: move;
  user-select: none;
}

.ma3192__station-table td.station {
  font-weight: bold;
  background-color: #f7f7a1;
}

// 過渡動畫樣式
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
  width: 100%;
}

.slide-left-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave,
.slide-right-enter-to,
.slide-right-leave {
  transform: translateX(0%);
}
</style>
