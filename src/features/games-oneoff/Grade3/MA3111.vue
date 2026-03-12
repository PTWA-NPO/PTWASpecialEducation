<template>
  <div class="game">
    <div class="game__question-area">
      <h1 class="game__question-description">{{ questionDescription }}</h1>
    </div>
    <div class="game__interaction-area">
      <FractionForAnswer
        :component-config="inputFractionConfig"
        class="game__fraction-input"
        @reply-answer="handleInputAnswer"
      ></FractionForAnswer>
      <DragFraction
        :component-config="configFraction"
        :game-id="gameId"
        class="game__answer-area"
        @reply-answer="handleDragAnswer"
        @record-answer="handleRecordAnswer"
      ></DragFraction>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  components: {
    DragFraction: defineAsyncComponent(
      () => import("@/components/DragFraction.vue")
    ),
    FractionForAnswer: defineAsyncComponent(
      () => import("@/components/FractionForAnswer.vue")
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
  emits: ["add-record", "play-effect", "next-question"],
  data() {
    return {
      inputFractionConfig: this.gameData.question.fraction,
      configFraction: this.gameData.answerData,
      isInputCorrect: false,
      isDragCorrect: false,
      questionDescription: this.gameData.question.description,
    };
  },
  mounted() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    handleInputAnswer(isCorrect) {
      this.isInputCorrect = isCorrect;
    },
    handleDragAnswer(isCorrect) {
      this.isDragCorrect = isCorrect;
    },
    checkAnswer() {
      if (this.recordedAnswer) {
        this.$emit("add-record", this.recordedAnswer);
      }

      // Check if both the fraction input and the drag fraction are correct
      if (this.isInputCorrect && this.isDragCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question", true);
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
    handleRecordAnswer(record) {
      this.recordedAnswer = record;
    },
  },
};
</script>

<style scoped lang="scss">
.game {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
  justify-content: space-between;
}

.game__question-area {
  display: flex;
  height: 15%;
  padding: $padding--small;
  align-items: center;
  @extend .game-section--border;
}

.game__question-description {
  font-size: $text-large;
  margin: 0;
}

.game__interaction-area {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  height: 80%;
  width: 100%;
}

.game__fraction-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  height: 100%;
  padding: $padding--small;
}

.game__fraction-display {
  flex: 0 0 auto;
}

.game__fraction-input {
  max-height: 150px;
  width: 20% !important;
  flex: 0 0 20%;
}

.game-section--border {
  border: $border--normal solid #000;
  border-radius: $border-radius;
}

.game__answer-area {
  flex: 1;
}
</style>
