<template>
  <div class="game">
    <div class="question-and-answer">
      <h1 class="question__description">
        <FractionText
          :text="questionDescription"
          :game-id="gameId"
        ></FractionText>
      </h1>
    </div>
    <div class="check-calculation">
      <DragFraction
        :component-config="checkCalculationData"
        :game-id="gameId"
        class="check-calculation-components"
      ></DragFraction>
      <div class="calculation-container">
        <div class="question__math-expression">
          <FractionDisplay
            :component-config="questionLeftTerm"
            :game-id="gameId"
            class="math-expression__fraction"
          ></FractionDisplay>
          <span
            class="question__math-symbol"
            :class="{ clickable: mode === 'application' }"
            @click="toggleOperation"
          >
            {{
              mode === "application"
                ? userOperation === " "
                  ? "?"
                  : userOperation
                : operation
            }}
          </span>
          <FractionDisplay
            :component-config="questionRightTerm"
            :game-id="gameId"
            class="math-expression__fraction"
          ></FractionDisplay>
          <span class="question__math-symbol">&#61;</span>
          <FractionForAnswer
            ref="fractionsComponent"
            :component-config="answerData"
            :game-id="gameId"
            @record-answer="handleRecordAnswer"
            @reply-answer="handleValidation"
          ></FractionForAnswer>
        </div>
        <!-- <button class="check-answer-btn" @click="triggerValidation">
          送出答案
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import FractionForAnswer from "@/components/FractionForAnswer.vue";
import FractionText from "@/components/FractionText.vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "FractionArithmetic",
  components: {
    FractionDisplay: defineAsyncComponent(
      () => import("@/components/FractionDisplay.vue")
    ),
    DragFraction: defineAsyncComponent(
      () => import("@/components/DragFraction.vue")
    ),
    FractionForAnswer,
    FractionText,
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
    const isApplication = !!this.gameData.answer?.operation;
    return {
      questionDescription: this.gameData.question.description,
      questionLeftTerm: this.gameData.question.leftTerm,
      questionRightTerm: this.gameData.question.rightTerm,
      operation: this.gameData.question.operationType,
      checkCalculationData: this.gameData.acheckCalculationData,
      answerData: this.gameData.answer,
      isAnswerRight: false,
      mode: isApplication ? "application" : "arithmetic",
      userOperation: isApplication
        ? " " // 一開始是空格
        : this.gameData.question.operationType,
    };
  },
  created() {
    emitter.on("submitAnswer", this.triggerValidation);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.triggerValidation);
  },
  methods: {
    handleValidation(result) {
      this.isAnswerRight = result;
    },
    toggleOperation() {
      if (this.mode === "application") {
        this.userOperation = this.userOperation === "+" ? "-" : "+";
      }
    },
    triggerValidation() {
      this.$emit("add-record", this.recordedAnswer);

      // 新增：應用題要比對 operation
      let isCorrect = this.isAnswerRight;
      if (this.mode === "application") {
        isCorrect =
          isCorrect && this.userOperation === this.gameData.answer.operation;
      }

      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question", true);
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
    handleRecordAnswer(record) {
      this.recordedAnswer = record; // 保存最新的答案記錄
    },
  },
};
</script>

<style scoped lang="scss">
.game {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.question-and-answer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20%;
  gap: $gap--small;
}

.question__math-expression {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  gap: $gap--tiny;
  @extend .game-section--border;
}

.question__math-symbol {
  font-size: 2.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.question__description {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $gap--small;
  font-size: $text-medium;
  margin: 0;
  @extend .game-section--border;
  height: 100%;
  line-height: 1.3;
}

.calculation-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  width: 100%;
}

.check-calculation {
  display: flex;
  gap: $gap--small;
  height: 80%;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.game-section--border {
  border: $border--normal solid #000;
  border-radius: $border-radius;
}

.check-calculation-components {
  flex: 3;
}

.check-answer-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  background-color: $submit-color;
}

.question__math-symbol.clickable {
  cursor: pointer;
  color: #1976d2;
  transition: color 0.2s;
  border: 2px solid #000;
  border-radius: 8px;
}
</style>
