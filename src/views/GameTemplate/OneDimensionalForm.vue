<template>
  <div ref="container" class="container">
    <div v-if="gameData.FormTitle" class="title">
      <component
        :is="gameData.FormTitle.Type"
        :component-config="gameData.FormTitle.Data"
        :game-id="gameId"
      />
    </div>
    <div :key="updateKey" class="form">
      <div v-for="(column, index) in formData" :key="index" class="column">
        <div v-if="column.Title" class="title">
          <component
            :is="column.Title.Type"
            :component-config="column.Title.Data"
            :game-id="gameId"
          />
        </div>
        <div class="formElements" :style="formStyle[index]">
          <div
            v-for="(element, elementIndex) in formDataConcat[index]"
            :key="elementIndex"
            :style="getDragStyle(index, elementIndex)"
            @mousedown="handleStart($event, index, elementIndex)"
            @mousemove="handleMove"
            @mouseup="handleEnd"
            @touchstart.prevent="handleStart($event, index, elementIndex)"
            @touchmove.prevent="handleMove"
            @touchend="handleEnd"
          >
            <component
              :is="element.Type"
              :component-config="element.Data"
              :game-id="gameId"
              @copy.prevent
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(question, index) in questionData"
      :key="index"
      class="question"
    >
      <div>{{ question.Text }}</div>
      <div class="questionContent">
        <div v-if="question.Type === 'DefaultDragBox'" class="defaultDragBox" />
        <component
          :is="question.Type"
          v-else
          :component-config="question.Data"
          :game-id="gameId"
          @reply-answer="handleAnswer($event, index)"
        />
      </div>
    </div>
    <button class="submitBtn" @click="checkAnswer">提交答案</button>
  </div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import { defineAsyncComponent } from "vue";
import fetchJson from "@/utilitys/fetch-json";
export default {
  components: {
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    NumberIncrementor: defineAsyncComponent(
      () => import("@/components/NumberIncrementor.vue")
    ),
  },

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
    };
  },

  async mounted() {
    this.formData = await fetchJson(
      getGameAssets("Dev02_OneDimensionalForm", "Forms.json")
    );
    this.formData = this.formData.data.AllForms[this.gameData.Form];
    this.setFormContent();
    this.setFormStyle();
    this.setQuestionData();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.formStyle = [];
      this.questionStyle = {};
      this.setFormStyle();
    },
    setFormContent() {
      for (const column in this.formData) {
        let columnData = [];
        for (const row in this.formData[column].Elements) {
          columnData = columnData.concat(this.formData[column].Elements[row]);
        }
        this.formDataConcat.push(columnData);
      }
    },
    setFormStyle() {
      const rowHeight = this.setRowHeight();
      for (const column in this.formData) {
        const columnAmount = this.formData[column].Elements[0].length;
        const formStyle = {
          gridTemplateColumns:
            "repeat(" + columnAmount + ", fit-content(100%))",
          gridAutoRows: rowHeight + "%",
        };
        this.formStyle.push(formStyle);
      }
    },
    setRowHeight() {
      let maxRow = 0;
      for (const column in this.formData) {
        if (this.formData[column].Elements.length > maxRow) {
          maxRow = this.formData[column].Elements.length;
        }
      }
      return 100 / maxRow;
    },
    setQuestionData() {
      for (const question of this.gameData.Questions) {
        this.questionData.push({
          Text: question.Text,
          Type: question.Type,
          Data: question.Data,
        });
      }
    },
    handleStart(event, columnIndex, elementIndex) {
      if (this.formDataConcat[columnIndex][elementIndex].Draggable) {
        event.preventDefault();
        this.isDragging = true;
        this.selectedElement = { columnIndex, elementIndex };

        let pos;
        if (event.type === "touchstart") {
          pos = event.touches[0];
        } else {
          pos = event;
        }
        this.startPosition = { x: pos.clientX, y: pos.clientY };
        this.dragPosition = { x: 0, y: 0 };
      }
    },

    handleMove(event) {
      if (!this.isDragging) return;

      let pos;
      if (event.type === "touchmove") {
        pos = event.touches[0];
      } else {
        pos = event;
      }
      this.dragPosition = {
        x: pos.clientX - this.startPosition.x,
        y: pos.clientY - this.startPosition.y,
      };
    },

    handleEnd(event) {
      if (!this.isDragging) return;

      const dragBoxes = document.querySelectorAll(".questionContent");

      const draggedElement = event.target;
      const draggedRect = draggedElement.getBoundingClientRect();

      for (let boxIndex = 0; boxIndex < dragBoxes.length; boxIndex++) {
        if (this.gameData.Questions[boxIndex].Type === "DefaultDragBox") {
          const box = dragBoxes[boxIndex];
          const boxRect = box.getBoundingClientRect();
          if (this.isOverlapping(draggedRect, boxRect)) {
            this.handleDragBox(boxIndex);
            break;
          }
        }
      }

      this.isDragging = false;
      this.selectedElement = null;
      this.dragPosition = { x: 0, y: 0 };
    },

    isOverlapping(rect1, rect2) {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },

    getDragStyle(columnIndex, elementIndex) {
      if (
        this.selectedElement?.columnIndex === columnIndex &&
        this.selectedElement?.elementIndex === elementIndex
      ) {
        return {
          transform: `translate(${this.dragPosition.x}px, ${this.dragPosition.y}px)`,
          transition: this.isDragging ? "none" : "transform 0.3s",
          zIndex: this.isDragging ? "1" : "auto",
        };
      }
      return {};
    },
    handleAnswer(event, index) {
      this.answer[index] = event;
    },
    handleDragBox(index) {
      const draggedElement =
        this.formDataConcat[this.selectedElement.columnIndex][
          this.selectedElement.elementIndex
        ];
      this.questionData[index].Type = draggedElement.Type;
      this.questionData[index].Data = draggedElement.Data;
      this.updateKey++;
      switch (this.questionData[index].Type) {
        case "ImageContainer":
          this.answer[index] =
            draggedElement.Data.Src ===
            this.gameData.Questions[index].Data.answer;
          break;
        case "TextOnly":
          this.answer[index] =
            draggedElement.Data.Text ===
            this.gameData.Questions[index].Data.answer;
          break;
      }
    },
    checkAnswer() {
      let isCorrect = true;
      for (let i = 0; i < this.questionData.length; i++) {
        if (!this.answer[i]) {
          isCorrect = false;
        }
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", "錯誤"]);
      }
    },
  },
};
</script>

<style lang="css" scoped>
.container {
  height: 100%;
  width: 100%;
}
.form {
  height: 50%;
  width: 100%;
  display: flex;
  background-color: lightblue;
  padding-bottom: 10px;
}
.column {
  flex: 1;
  padding-left: 5px;
  padding-right: 5px;
  display: block;
  justify-items: center;
}
.title {
  padding: 5px;
  background-color: lightblue;
}
.formElements {
  font-size: 2rem;
  display: grid;
  gap: 5px;
  height: 80%;
  width: fit-content;
}
.question {
  height: 10%;
  font-size: 1.5rem;
  padding: 10px;
  align-items: center;
  display: flex;
}
.questionContent {
  height: 100%;
  width: fit-content;
  margin-left: 5px;
}
.defaultDragBox {
  height: 100%;
  aspect-ratio: 1/1;
  border: 2px solid black;
  align-items: center;
  display: flex;
}
.submitBtn {
  font-size: 1.5rem;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  &:hover {
    background-color: darken(lightgray, 10%);
  }
}
</style>
