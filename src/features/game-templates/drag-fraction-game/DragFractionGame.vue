<template>
  <div class="game">
    <div class="game__question-area">
      <h1 class="game__question-description">{{ questionDescription }}</h1>
    </div>
    <div class="game__interaction-area">
      <div class="game__side-panel">
        <component
          :is="sidePanelComponent"
          :component-config="sidePanelConfig"
          :game-id="gameId"
          @reply-answer="handleSidePanelAnswer"
        />
      </div>
      <DragFraction
        :component-config="answerData"
        :game-id="gameId"
        class="game__answer-area"
        @reply-answer="handleDragAnswer"
        @record-answer="handleRecordAnswer"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

const SIDE_PANEL_COMPONENTS = {
  FractionDisplay: defineAsyncComponent(
    () => import("@/components/FractionDisplay.vue")
  ),
  FractionForAnswer: defineAsyncComponent(
    () => import("@/components/FractionForAnswer.vue")
  ),
};

export default {
  name: "DragFractionGame",
  components: {
    DragFraction: defineAsyncComponent(
      () => import("@/components/DragFraction.vue")
    ),
    ...SIDE_PANEL_COMPONENTS,
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
    gameConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["add-record", "play-effect", "next-question"],
  data() {
    return {
      questionDescription: this.gameData.question.description,
      sidePanelComponent:
        this.gameData.question.sidePanel?.name || "FractionDisplay",
      sidePanelConfig: this.gameData.question.sidePanel?.data,
      answerData: this.gameData.answerData,
      // FractionDisplay has no answer to validate; default to true
      isSidePanelCorrect: !this.gameConfig.checkSidePanel,
      isDragCorrect: !this.gameConfig.checkDragAnswer,
    };
  },
  mounted() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    handleSidePanelAnswer(isCorrect) {
      this.isSidePanelCorrect = isCorrect;
    },
    handleDragAnswer(isCorrect) {
      this.isDragCorrect = isCorrect;
    },
    checkAnswer() {
      if (this.recordedAnswer) {
        this.$emit("add-record", this.recordedAnswer);
      }

      if (this.isSidePanelCorrect && this.isDragCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", this.recordedAnswer);
        this.$emit("next-question", true);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", this.recordedAnswer);
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
  overflow: hidden;
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
  flex: 1;
  width: 100%;
  min-height: 0;
}

.game__side-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25%;
  height: 100%;
  padding: $padding--small;
}

.game__answer-area {
  flex: 1;
  height: 100%;
}

.game-section--border {
  border: $border--normal solid #000;
  border-radius: $border-radius;
}
</style>
