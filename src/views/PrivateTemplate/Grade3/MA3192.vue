<template>
  <div ref="container" class="ma3192">
    <div class="ma3192__form">
      <table class="ma3192__schedule-table">
        <template v-if="GameData.Level == 1">
          <thead class="ma3192__station-table">
            <tr v-for="(row, rowIndex) in stationData" :key="rowIndex">
              <th v-if="rowIndex === 0" rowspan="8">搭乘區間</th>
              <td v-for="(cell, cellIndex) in row.cells" :key="cellIndex">
                {{ cell }}
              </td>
            </tr>
          </thead>
        </template>
        <template v-if="GameData.Level == 2">
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
        <template v-if="GameData.Level == 3">
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
    <div
      v-for="(question, index) in questionData"
      :key="index"
      class="ma3192__question"
    >
      <template v-if="question.Type == 'DefaultDragBox'">
        <div>
          {{ question.Text }}
          <div class="ma3192__drag-box"></div>
        </div>
      </template>
      <component
        :is="question.Type"
        v-else
        :Data="question.Data"
        :ID="ID"
        @replyAnswer="handleAnswer($event, index)"
      />
    </div>
    <button class="ma3192__submit-btn" @click="checkAnswer">送出答案</button>
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
  Markdown: defineAsyncComponent(() => import("@/components/Markdown.vue")),
};

export default {
  name: "MA3192",
  components: COMPONENTS,

  props: {
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],

  data() {
    return {
      updateKey: 0,
      formData: [],
      formDataConcat: [],
      formStyle: [],
      questionData: [],
      selectedElement: null,
      isDragging: false,
      dragPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      answer: [],
      originalPosition: null,
      cloneElement: null,
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

  async mounted() {
    this.setQuestionData();
  },

  beforeUnmount() {
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
      this.questionData = this.GameData.Questions.map((question) => ({
        Text: question.Text,
        Type: question.Type,
        Data: question.Data,
      }));
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
        rect: rect,
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

      dragBoxes.forEach((dragBox, index) => {
        const boxRect = dragBox.getBoundingClientRect();
        if (this.isOverlapping(draggedRect, boxRect)) {
          this.handleDragBoxDrop(dragBox, index);
        }
      });
    },

    handleDragBoxDrop(dragBox, index) {
      const draggedText = this.originalPosition.element.textContent.trim();
      dragBox.textContent = draggedText;
      dragBox.style.justifyContent = "center";
      dragBox.style.alignItems = "center";
      dragBox.classList.remove("ma3192__drag-box--wrong");

      const defaultDragBoxQuestions = this.questionData
        .map((q, i) => ({ type: q.Type, index: i }))
        .filter((q) => q.type === "DefaultDragBox");

      if (defaultDragBoxQuestions[index]) {
        const questionIndex = defaultDragBoxQuestions[index].index;
        const answer =
          this.GameData.Questions[questionIndex].Data.answer.trim();
        this.answer[questionIndex] = draggedText === answer;
      }
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

    checkAnswer() {
      let isCorrect = true;
      for (let i = 0; i < this.questionData.length; i++) {
        if (!this.answer[i]) {
          isCorrect = false;
          if (this.questionData[i].Type === "DefaultDragBox") {
            const dragBoxes = document.querySelectorAll(".ma3192__drag-box");
            const defaultDragBoxQuestions = this.questionData
              .map((q, idx) => ({ type: q.Type, index: idx }))
              .filter((q) => q.type === "DefaultDragBox");

            const dragBoxIndex = defaultDragBoxQuestions.findIndex(
              (q) => q.index === i
            );
            if (dragBoxIndex !== -1) {
              dragBoxes[dragBoxIndex].classList.add("ma3192__drag-box--wrong");
            }
          }
        }
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "錯誤"]);
        emitter.emit("checkAnswer");
      }
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
  max-height: 50%;
}
.ma3192__schedule-table {
  width: 100%;
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

.ma3192__submit-btn {
  max-width: 200px;
  font-size: 1.5rem;
  border: none;
  background-color: $submit-btn-bg;
  cursor: pointer;
  padding: 0 10px;
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
</style>
