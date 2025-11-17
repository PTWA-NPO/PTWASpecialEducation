<template>
  <div class="game">
    <div class="game__question-area">
      <h1 class="game__question-description">{{ questionDescription }}</h1>
    </div>
    <div class="game__interaction-area">
      <div class="game__fraction-panel">
        <FractionDisplay
          :component-config="questionFraction"
          :game-id="gameId"
          class="game__fraction-display"
        ></FractionDisplay>
        <FractionChart
          :component-config="chartData"
          :game-id="gameId"
          class="game__chart-container"
          @mounted="calculateChartSize"
        ></FractionChart>
        <button class="game__check-answer-btn" @click="checkAnswer">
          送出答案
        </button>
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
import FractionChart from "@/components/FractionChart.vue";
export default {
  components: {
    FractionChart,
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
      chartWidth: 0,
      chartHeight: 0,
      isAnswerCorrect: false,
      questionDescription: this.gameData.question.description,
      questionFraction: this.gameData.question.fraction,
      chartData: {
        shape: this.gameData.answerData.shape,
        numerator: this.gameData.answerData.answer.numerator, // 分子
        denominator: this.gameData.answerData.answer.denominator, // 分母
      },
    };
  },
  computed: {},
  methods: {
    drag(answer) {
      this.isAnswerCorrect = answer;
    },
    calculateChartSize() {
      const fractionChart = this.$refs.fractionChart;
      if (fractionChart) {
        this.chartWidth = fractionChart.offsetWidth * 0.85 || 150; // 確保有預設值
        this.chartHeight = fractionChart.offsetHeight * 0.85 || 150; // 確保有預設值
      } else {
        console.error("FractionChart not found!");
      }
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
  flex: 2;
}

.game__chart-container {
  flex: 3;
  justify-content: center;
  align-items: center;
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
