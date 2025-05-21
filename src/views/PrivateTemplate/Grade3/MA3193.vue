<template>
  <div class="MA3193__container">
    <!-- <component :is="componentName" :Data="componentsData" :ID="ID" @replyAnswer="replyAnswerFunc" /> -->
    <div class="question-info">
      <div
        class="img-container"
        :style="{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }"
      >
        <template v-if="images">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="draggable-image"
            :style="{
              backgroundImage: `url(${image.url})`,
              width: getImageSize(image.size?.width),
              height: getImageSize(image.size?.height),
              left: getPosition(image.position?.x),
              top: getPosition(image.position?.y),
            }"
            @mousedown="handleStart($event, index)"
            @touchstart.prevent="handleStart($event, index)"
          ></div>
        </template>
      </div>
      <table class="answer-table">
        <tr v-for="(row, rowIndex) in formAnswer" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :rowspan="cell.rowspan"
            :colspan="cell.colspan"
          >
            <template v-if="cell.text">{{ cell.text }}</template>
            <input
              v-else
              type="text"
              :value="cell.userAnswer"
              readonly
              @click="showNumPad($event, rowIndex, cellIndex)"
            />
          </td>
        </tr>
      </table>
    </div>
    <FloatNumPad
      v-if="showNumpad"
      :Data="numpadPosition"
      @buttonClicked="handleNumPadInput"
    />
    <div class="interaction-zone">
      <div
        v-for="(question, index) in questionData"
        :key="index"
        class="question"
      >
        <template v-if="question.Type == 'DefaultDragBox'">
          <div>
            {{ question.Text }}
            <div class="drag-box"></div>
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
    </div>
    <button class="submit-button" @click="checkAnswer">送出答案</button>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
// import { getGameStaticAssets } from "@/utilitys/get_assets.js"; // Feel free to change your the method to get assets.
import { getGameAssets } from "@/utilitys/get_assets.js";
import FloatNumPad from "@/components/FloatNumPad.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";

export default {
  name: "MA3193",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    Markdown: defineAsyncComponent(() => import("@/components/Markdown.vue")),
    FloatNumPad,
  },
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
  emits: ["add-record", "next-question", "play-effect"],
  data() {
    return {
      images: this.GameData.images || [],
      backgroundImage: this.GameData.background
        ? getGameAssets("MA3193", this.GameData.background.src)
        : null,
      isDragging: false,
      selectedImage: null,
      dragOffset: { x: 0, y: 0 },
      questionData: [],
      cloneElement: null,
      answer: [],
      showNumpad: false,
      numpadPosition: { top: 0, left: 0 },
      currentInput: {
        rowIndex: null,
        cellIndex: null,
      },
      containerSize: {
        width: 0,
        height: 0,
      },
      formAnswer: this.GameData.Answerform.map((row) =>
        row.map((cell) => ({
          ...cell,
          text: cell.text || null,
          userAnswer: cell.text ? cell.text : "",
          answer: cell.answer ? cell.answer : cell.text,
          rowspan: cell.rowspan || 1,
          colspan: cell.colspan || 1,
          isValid: cell.text ? true : false,
        }))
      ),
    };
  },
  computed: {
    // 移除所有計算屬性，因為現在都是手動輸入
  },
  created() {
    // Your created hook here
  },
  mounted() {
    document.addEventListener("mousemove", this.handleMove);
    document.addEventListener("mouseup", this.handleEnd);
    document.addEventListener("touchmove", this.handleMove);
    document.addEventListener("touchend", this.handleEnd);

    if (this.images && Array.isArray(this.images)) {
      this.images.forEach((image) => {
        image.url = getGameAssets("MA3193", image.src);
      });
    }

    this.setQuestionData();
    this.answer = new Array(this.questionData.length).fill(false);
    this.updateContainerSize();
    window.addEventListener("resize", this.updateContainerSize);
  },
  beforeUnmount() {
    document.removeEventListener("mousemove", this.handleMove);
    document.removeEventListener("mouseup", this.handleEnd);
    document.removeEventListener("touchmove", this.handleMove);
    document.removeEventListener("touchend", this.handleEnd);
    window.removeEventListener("resize", this.updateContainerSize);
  },
  methods: {
    updateContainerSize() {
      const container = document.querySelector(".img-container");
      if (container) {
        this.containerSize = {
          width: container.clientWidth,
          height: container.clientHeight,
        };
      }
    },
    getImageSize(size) {
      if (!size) return "15%";
      // 如果 size 是數字，將其轉換為百分比
      if (typeof size === "number") {
        return `${size}%`;
      }
      return size;
    },
    getPosition(pos) {
      if (pos === undefined) return "0%";
      // 如果 pos 是數字，將其轉換為百分比
      if (typeof pos === "number") {
        return `${pos}%`;
      }
      return pos;
    },
    setQuestionData() {
      this.questionData = this.GameData.Questions.map((question) => ({
        Text: question.Text,
        Type: question.Type,
        Data: question.Data,
      }));
      this.answer = new Array(this.questionData.length).fill(false);
    },
    toNumber(val) {
      return Number(val) || 0;
    },
    handleStart(event, index) {
      this.isDragging = true;
      this.selectedImage = index;

      const pos = event.type === "touchstart" ? event.touches[0] : event;
      const rect = event.target.getBoundingClientRect();

      this.dragOffset = {
        x: pos.clientX - rect.left,
        y: pos.clientY - rect.top,
      };

      // 創建拖曳時的克隆元素
      this.cloneElement = event.target.cloneNode(true);
      this.cloneElement.classList.add("dragging");
      Object.assign(this.cloneElement.style, {
        position: "fixed",
        zIndex: "1000",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: "none",
      });
      document.body.appendChild(this.cloneElement);
    },

    handleMove(event) {
      if (!this.isDragging || this.selectedImage === null) return;

      const pos = event.type === "touchmove" ? event.touches[0] : event;

      // 更新克隆元素的位置
      if (this.cloneElement) {
        this.cloneElement.style.left = `${pos.clientX - this.dragOffset.x}px`;
        this.cloneElement.style.top = `${pos.clientY - this.dragOffset.y}px`;
      }
    },

    handleEnd() {
      if (!this.isDragging) return;

      // 檢查是否拖曳到 drag-box
      const dragBoxes = document.querySelectorAll(".drag-box");
      const draggedRect = this.cloneElement.getBoundingClientRect();

      dragBoxes.forEach((dragBox, index) => {
        const boxRect = dragBox.getBoundingClientRect();
        if (this.isOverlapping(draggedRect, boxRect)) {
          this.handleDragBoxDrop(dragBox, index);
        }
      });

      // 清理克隆元素
      if (this.cloneElement) {
        document.body.removeChild(this.cloneElement);
        this.cloneElement = null;
      }

      this.isDragging = false;
      this.selectedImage = null;
    },

    isOverlapping(rect1, rect2) {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },

    handleDragBoxDrop(dragBox, index) {
      this.removeWrongAnswer();
      const draggedImage = this.images[this.selectedImage];
      dragBox.style.backgroundImage = `url(${draggedImage.url})`;
      dragBox.style.backgroundSize = "contain";
      dragBox.style.backgroundPosition = "center";
      dragBox.style.backgroundRepeat = "no-repeat";

      const defaultDragBoxQuestions = this.questionData
        .map((q, i) => ({ type: q.Type, index: i }))
        .filter((q) => q.type === "DefaultDragBox");

      if (defaultDragBoxQuestions[index]) {
        const questionIndex = defaultDragBoxQuestions[index].index;
        const answer = this.GameData.Questions[questionIndex].Data.answer;
        const isCorrect = draggedImage.src === answer;
        this.answer[questionIndex] = isCorrect;
      }
    },
    showNumPad(event, rowIndex, cellIndex) {
      const rect = event.target.getBoundingClientRect();
      this.numpadPosition = {
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX,
      };
      this.currentInput = {
        rowIndex,
        cellIndex,
      };
      this.showNumpad = true;
    },
    handleNumPadInput(value) {
      if (value === "關閉") {
        this.showNumpad = false;
        return;
      }
      if (value === "清除") {
        this.formAnswer[this.currentInput.rowIndex][
          this.currentInput.cellIndex
        ].userAnswer = "";
        return;
      }

      let currentCell =
        this.formAnswer[this.currentInput.rowIndex][this.currentInput.cellIndex]
          .userAnswer;
      if (currentCell.length < 3) {
        currentCell += value;
        this.formAnswer[this.currentInput.rowIndex][
          this.currentInput.cellIndex
        ].userAnswer = currentCell;
      }
    },
    validateFormAnswer() {
      // 驗證每一行的總和
      this.formAnswer.forEach((row) => {
        row.forEach((cell) => {
          cell.isValid = cell.userAnswer === cell.answer;
        });
      });

      const allValid = this.formAnswer.every((row) =>
        row.every((cell) => cell.isValid !== false)
      );
      return allValid;
    },
    validateQuestionAnswer() {
      return this.answer.every((answer) => answer);
    },
    checkAnswer() {
      const isValid =
        this.validateFormAnswer() && this.validateQuestionAnswer();
      if (isValid) {
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "錯誤"]);
        this.markingWrongAnswer();
        // 檢查所有 DefaultDragBox 的答案
      }
    },
    removeWrongAnswer() {
      const dragBoxes = document.querySelectorAll(".drag-box");
      dragBoxes.forEach((dragBox) => {
        dragBox.classList.remove("drag-box--wrong");
      });
    },
    markingWrongAnswer() {
      const dragBoxes = document.querySelectorAll(".drag-box");
      const defaultDragBoxQuestions = this.questionData
        .map((q, i) => ({ type: q.Type, index: i }))
        .filter((q) => q.type === "DefaultDragBox");

      defaultDragBoxQuestions.forEach((question, index) => {
        const dragBox = dragBoxes[index];
        if (dragBox && !this.answer[question.index]) {
          dragBox.classList.add("drag-box--wrong");
        }
      });
      emitter.emit("checkAnswer");
    },
    handleAnswer(value, index) {
      this.answer[index] = value;
    },
  },
};
</script>

<style scoped lang="scss">
.MA3193__container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: center;
  font-size: $text-medium;
  gap: $gap--small;
}

.img-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.draggable-image {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: move;
  user-select: none;
  transition: transform 0.1s ease;
}

.draggable-image:active {
  transform: scale(1.05);
  z-index: 1000;
}

.dragging {
  opacity: 0.8;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.drag-box {
  display: inline-block;
  min-width: 100px;
  min-height: 40px;
  border: 2px solid black;
  border-radius: 10px;
  background-color: #f8f8f8;
  margin-left: 10px;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.drag-box:hover {
  border-color: #666;
  background-color: #f0f0f0;
}

.drag-box--wrong {
  background-color: #ffebee;
  border-color: #ffcdd2;
}

.answer-table {
  flex: 1;
  border-collapse: collapse;
  border: 1px solid #000;
  padding: 0;
  font-size: $text-small;
  text-align: center;
  width: 100%;
  height: 100%;
  table-layout: fixed;
  td {
    border: 1px solid #000;
    text-align: center;
    align-items: center;
  }

  input {
    border: none;
    outline: none;
    height: 100%;
    width: 100%;
    text-align: center;
    background: transparent;

    &.invalid {
      color: $error-color;
      background-color: rgba($error-color, 0.1);
    }
  }
}
.question-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40%;
  width: 100%;
  gap: $gap--small;
}

.interaction-zone {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50%;
  width: 100%;
}

.submit-button {
  width: 200px;
  height: 50px;
  background-color: $submit-color;
  color: #fff;
}
</style>
