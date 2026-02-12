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
            class="grid-cell"
          >
            <div
              class="grid-cell-content"
              :style="getDragStyle(index, elementIndex)"
              :class="{
                'grid-cell-content--draggable':
                  formDataConcat[index][elementIndex].Draggable,
              }"
              @mousedown="handleStart($event, index, elementIndex)"
              @touchstart.prevent="handleStart($event, index, elementIndex)"
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
    </div>
    <transition :name="transitionName" mode="out-in">
      <div v-if="currentQuestion" :key="currentQuestionIndex" class="question">
        <template
          v-for="(part, index) in parseQuestion(currentQuestion.Text)"
          :key="index"
        >
          <div v-if="!part.isBox" class="question-text">
            {{ part.text }}
          </div>
          <template v-else>
            <!-- Check if slot exists before rendering to avoid errors -->
            <div
              v-if="
                currentQuestion.Slots && currentQuestion.Slots[part.slotIndex]
              "
              class="slot-wrapper"
              style="display: inline"
            >
              <div
                v-show="
                  currentQuestion.Slots[part.slotIndex].Type ===
                  'DefaultDragBox'
                "
                class="questionContent"
                :data-index="part.slotIndex"
              >
                <div class="defaultDragBox" />
              </div>
              <!-- Boxed answer component (if filled) -->
              <div
                v-if="
                  currentQuestion.Slots[part.slotIndex].Type !==
                  'DefaultDragBox'
                "
                class="answer-component"
                :class="{ bordered: checkOriginalType(currentQuestionIndex) }"
                :data-index="part.slotIndex"
              >
                <component
                  :is="currentQuestion.Slots[part.slotIndex].Type"
                  :key="updateKey"
                  :component-config="currentQuestion.Slots[part.slotIndex].Data"
                  :game-id="gameId"
                  @reply-answer="handleAnswer($event, currentQuestionIndex)"
                />
              </div>
            </div>
          </template>
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
import { getGameAssets } from "@/lib/get-assets.js";
import { defineAsyncComponent } from "vue";
import fetchJson from "@/lib/fetch-json";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  components: {
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
      currentQuestionIndex: 0,
      transitionName: "slide-right",
    };
  },

  computed: {
    currentQuestion() {
      return this.questionData[this.currentQuestionIndex];
    },
  },

  async mounted() {
    this.formData = await fetchJson(getGameAssets(this.gameId, "forms.json"));
    this.formData = this.formData.data.AllForms[this.gameData.Form];
    this.setFormContent();
    this.setFormStyle();
    this.setQuestionData();
    window.addEventListener("resize", this.handleResize);
  },

  created() {
    emitter.on("submitAnswer", this.checkAnswer);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    emitter.off("submitAnswer", this.checkAnswer);
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
        const slots = [];
        // Calculate number of slots based on $box$ occurrences
        if (question.Type === "DefaultDragBox" && question.Text) {
          const parts = question.Text.split("$box$");
          // If split gives N parts, we have N-1 boxes.
          // e.g. "A $box$ B" -> ["A ", " B"] (length 2) -> 1 box
          // "A $box$ B $box$ C" -> ["A ", " B ", " C"] (length 3) -> 2 boxes
          // Edge case: "$box$" -> ["", ""] -> 1 box
          const boxCount = parts.length - 1;
          for (let i = 0; i < boxCount; i++) {
            slots.push({
              Type: "DefaultDragBox",
              Data: null,
            });
          }
          // Fallback if no box found but type is DefaultDragBox (append mode legacy)
          if (boxCount === 0) {
            slots.push({ Type: "DefaultDragBox", Data: null });
          }
        } else {
          // For non-drag questions or empty text, maybe 1 slot?
          // Actually currently they just use data directly.
          // Let's init 1 slot just in case we unify logic later, but for now irrelevant.
          slots.push({ Type: question.Type, Data: question.Data });
        }

        this.questionData.push({
          Text: question.Text,
          Type: question.Type,
          Data: question.Data,
          Slots: slots,
        });
      }
    },
    parseQuestion(questionText) {
      if (!questionText) return [{ text: "", isBox: true, slotIndex: 0 }];

      const segments = [];
      const parts = questionText.split("$box$");
      // parts = ["Start ", " Middle ", " End"] for 2 boxes

      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          segments.push({ text: parts[i], isBox: false });
        }
        // Add a box after this part, UNLESS it's the very last part
        if (i < parts.length - 1) {
          segments.push({ text: "", isBox: true, slotIndex: i });
        }
      }

      // Legacy fallback: if no box was added (length 1 and no split), append one?
      // The split logic above handles standard text.
      // If "Hello" -> parts["Hello"], loop runs once, no box added.
      // But we want to support implicit box at end?
      // The original `splitQuestion` did: return [text, "$box$"] if no box found.
      // Let's replicate this: if segments has NO boxes, append one.
      const hasBox = segments.some((s) => s.isBox);
      if (!hasBox && questionText.indexOf("$box$") === -1) {
        segments.push({ text: "", isBox: true, slotIndex: 0 });
      }

      return segments;
    },
    handleStart(event, columnIndex, elementIndex) {
      if (this.formDataConcat[columnIndex][elementIndex].Draggable) {
        event.preventDefault();
        this.isDragging = true;
        this.selectedElement = { columnIndex, elementIndex };

        let pos;
        if (event.type === "touchstart") {
          pos = event.touches[0];
          window.addEventListener("touchmove", this.handleMove, {
            passive: false,
          });
          window.addEventListener("touchend", this.handleEnd);
        } else {
          pos = event;
          window.addEventListener("mousemove", this.handleMove);
          window.addEventListener("mouseup", this.handleEnd);
        }
        this.startPosition = { x: pos.clientX, y: pos.clientY };
        this.dragPosition = { x: 0, y: 0 };
      }
    },

    handleMove(event) {
      if (!this.isDragging) return;

      let pos;
      if (event.type === "touchmove") {
        event.preventDefault(); // Prevent scrolling on touch
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

      window.removeEventListener("mousemove", this.handleMove);
      window.removeEventListener("mouseup", this.handleEnd);
      window.removeEventListener("touchmove", this.handleMove);
      window.removeEventListener("touchend", this.handleEnd);

      const dragBoxes = document.querySelectorAll(
        ".questionContent, .answer-component"
      );

      // Using clientX/Y from changedTouches for touchend if available
      let clientX, clientY;
      if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      for (let boxIndex = 0; boxIndex < dragBoxes.length; boxIndex++) {
        const box = dragBoxes[boxIndex];
        const boxRect = box.getBoundingClientRect();

        // Check if cursor is over the box
        if (
          boxRect.width > 0 &&
          clientX >= boxRect.left &&
          clientX <= boxRect.right &&
          clientY >= boxRect.top &&
          clientY <= boxRect.bottom
        ) {
          // Only allow dropping if the original question type was DefaultDragBox
          if (this.checkOriginalType(this.currentQuestionIndex)) {
            const slotIndex = parseInt(box.dataset.index, 10);
            this.handleDragBox(this.currentQuestionIndex, slotIndex);
          }
          break;
        }
      }

      this.isDragging = false;
      this.selectedElement = null;
      this.dragPosition = { x: 0, y: 0 };
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
    handleDragBox(questionIndex, slotIndex = 0) {
      const draggedElement =
        this.formDataConcat[this.selectedElement.columnIndex][
          this.selectedElement.elementIndex
        ];

      // Update specific slot
      if (
        this.questionData[questionIndex].Slots &&
        this.questionData[questionIndex].Slots[slotIndex]
      ) {
        this.questionData[questionIndex].Slots[slotIndex].Type =
          draggedElement.Type;
        this.questionData[questionIndex].Slots[slotIndex].Data =
          draggedElement.Data;
      } else {
        // Fallback for non-slot questions
        this.questionData[questionIndex].Type = draggedElement.Type;
        this.questionData[questionIndex].Data = draggedElement.Data;
      }
      this.updateKey++;
    },
    checkAnswer() {
      // Logic: Compare current slots with expected answer.
      // Expected Answer in JSON is an array: "Answer": [ "Ans1", "Ans2" ]

      const qIndex = this.currentQuestionIndex;
      const question = this.gameData.Questions[qIndex];
      const slots = this.questionData[qIndex].Slots;

      // If it's a drag box type:
      if (this.checkOriginalType(qIndex)) {
        // Collect user answers from slots
        const userAnswers = slots.map((slot) => {
          if (slot.Type === "DefaultDragBox") return null;
          if (slot.Type === "ImageContainer") return slot.Data.Src;
          if (slot.Type === "TextOnly") return slot.Data.Text;
          return null;
        });

        // Compare with defined answers
        const expected = question.Data.answer;
        let isCorrect = false;

        if (Array.isArray(expected)) {
          // Strict match for all slots
          isCorrect = userAnswers.every((ans, i) => ans === expected[i]);
        } else {
          // Single answer string
          isCorrect = userAnswers[0] === expected;
        }

        if (isCorrect) {
          this.$emit("play-effect", "CorrectSound");
          this.$emit("add-record", [`第 ${qIndex + 1}題答案`, "正確", "正確"]);
          if (qIndex < this.questionData.length - 1) {
            this.nextQuestion();
          } else {
            this.$emit("next-question");
          }
        } else {
          this.$emit("play-effect", "WrongSound");
          this.$emit("add-record", [`第 ${qIndex + 1}題答案`, "錯誤", "錯誤"]);
        }
      } else {
        // Fallback for non-drag components
        if (this.answer[qIndex]) {
          // ... existing logic for non-drag components ...
          this.$emit("play-effect", "CorrectSound");
          this.$emit("add-record", [
            `第 ${this.currentQuestionIndex + 1}題答案`,
            "正確",
            "正確",
          ]);

          if (this.currentQuestionIndex < this.questionData.length - 1) {
            this.nextQuestion();
          } else {
            this.$emit("next-question");
          }
        } else {
          this.$emit("play-effect", "WrongSound");
          this.$emit("add-record", [
            `第 ${this.currentQuestionIndex + 1}題答案`,
            "錯誤",
            "錯誤",
          ]);
        }
      }
    },
    nextQuestion() {
      this.transitionName = "slide-left";
      this.currentQuestionIndex++;
    },
    checkOriginalType(index) {
      if (!this.gameData.Questions || !this.gameData.Questions[index])
        return false;
      return this.gameData.Questions[index].Type === "DefaultDragBox";
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.form {
  height: 50%;
  width: 100%;
  display: flex;
  background-color: lightblue;
}
.column {
  flex: 1;
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
  gap: 0;
  height: 80%;
  gap: 0;
  height: 80%;
  width: fit-content;
}
.grid-cell {
  border: 1px solid black;
  margin-top: -1px;
  margin-left: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
}
.grid-cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffd6e070;
  &--draggable {
    border: 1px dashed gray;
  }
}

.question {
  min-height: 10%;
  font-size: 1.5rem;
  padding: 10px;
  display: block; /* Use block for standard text flow */
  line-height: 1.8; /* Improve readability for mixed content */
}
.question-text {
  display: inline;
}
.questionContent {
  height: 100%;
  width: fit-content;
  margin-left: 5px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
}
.defaultDragBox {
  height: 100%;
  min-height: 40px;
  min-width: 40px;
  aspect-ratio: 1/1;
  border: 2px dashed black; /* Changed to dashed as requested */
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
.answer-component {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
}
.answer-component.bordered {
  border: 2px dashed black;
  min-width: 40px;
  min-height: 40px;
  padding: 2px;
}
</style>
