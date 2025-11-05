<template>
  <div class="game">
    <div class="game__question-area">
      <h1 class="game__question-description">{{ questionDescription }}</h1>
    </div>
    <div class="game__interaction-area">
      <div class="game__fraction-panel">
        <FractionDisplay
          :component-config="questionFraction"
          class="game__fraction-display"
        ></FractionDisplay>
        <!-- <button class="game__submit" @click="submit">送出答案</button> -->
      </div>
      <DragFraction
        :component-config="configFraction"
        :game-id="gameId"
        class="game__answer-area"
        @reply-answer="drag"
        @record-answer="handleRecordAnswer"
      ></DragFraction>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "MA3091",
  components: {
    FractionDisplay: defineAsyncComponent(
      () => import("@/components/FractionDisplay.vue")
    ),
    DragFraction: defineAsyncComponent(
      () => import("@/components/DragFraction.vue")
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
      configFraction: this.gameData.answerData,
      isAnswerCorrect: false,
      questionDescription: this.gameData.question.description,
      questionFraction: { Content: this.gameData.question.fraction },
    };
  },
  computed: {},
  created() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    drag(answer) {
      this.isAnswerCorrect = answer;
    },
    checkAnswer() {
      this.$emit("add-record", this.recordedAnswer);
      if (this.isAnswerCorrect) {
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
  align-items: center;
  height: 80%;
  width: 100%;
}

.game__fraction-panel {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 100%;
  padding: $padding--small;
}

.game__fraction-display {
  flex: 4;
}

.game__answer-area {
  width: 70%;
  height: 100%;
}

.game__check-answer-btn {
  flex: 1;
  border: none;
  background-color: $submit-color;
}

.game-section--border {
  border: $border--normal solid #000;
  border-radius: $border-radius;
}
</style>
