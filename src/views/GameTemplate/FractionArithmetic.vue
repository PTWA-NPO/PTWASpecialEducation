<template>
  <div class="game">
    <div class="question-and-answer">
      <h1 class="question__description">{{ questionDescription }}</h1>
      <div class="question__math-expression">
        <FractionDisplay
          :Data="questionLeftTerm"
          class="math-expression__fraction"
        ></FractionDisplay>
        <span class="question__math-symbol">{{ operation }}</span>
        <FractionDisplay
          :Data="questionRightTerm"
          class="math-expression__fraction"
        ></FractionDisplay>
        <span class="question__math-symbol">&#61;</span>
        <FractionForAnswer
          ref="fractionsComponent"
          :Data="answerData"
          @validation="handleValidation"
          @recordAnswer="handleRecordAnswer"
        ></FractionForAnswer>
      </div>
    </div>
    <div class="check-calculation">
      <DragFraction
        :Data="checkCalculationData"
        class="check-calculation-components"
      ></DragFraction>
      <button class="check-answer-btn" @click="triggerValidation">
        送出答案
      </button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import FractionForAnswer from "@/components/FractionForAnswer.vue";

export default {
  name: "FractionArithmetic",
  components: {
    FractionDisplay: defineAsyncComponent(() =>
      import("@/components/FractionDisplay.vue")
    ),
    DragFraction: defineAsyncComponent(() =>
      import("@/components/DragFraction.vue")
    ),
    FractionForAnswer,
  },
  props: {
    GameData: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      recordedAnswer: null,
      questionDescription: this.GameData.question.description,
      questionLeftTerm: this.GameData.question.leftTerm,
      questionRightTerm: this.GameData.question.rightTerm,
      operation: this.GameData.question.operationType,
      checkCalculationData: this.GameData.acheckCalculationData,
      answerData: this.GameData.answer,
      isAnswerRight: false,
      questionType: this.GameData.question.questionType,
    };
  },
  methods: {
    handleValidation(result) {
      this.isAnswerRight = result;
    },
    triggerValidation() {
      this.$emit("add-record", this.recordedAnswer);
      if (this.isAnswerRight) {
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
  height: 15vh;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 20%;
  gap: $gap--small;
}

.question__math-expression {
  flex: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0.5rem;
  gap: $gap--small;
  @extend .game-section--border;
}

.question__math-symbol {
  font-size: 5rem;
}

.question__description {
  flex: 2;
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
  width: 70%;
}

.check-answer-btn {
  height: 100%;
  width: 25%;
  border: none;
  background-color: #e4c9b6;
}
</style>
