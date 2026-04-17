<template>
  <div class="bar-chart-game">
    <div v-if="gameData.FormTitle" class="bar-chart-game__title">
      <component
        :is="gameData.FormTitle.Type"
        :component-config="gameData.FormTitle.Data"
        :game-id="gameId"
      />
    </div>
    <div
      v-for="(question, index) in questions"
      :key="index"
      class="bar-chart-game__question"
    >
      <div v-if="question.Description" class="bar-chart-game__question-text">
        {{ question.Description }}
      </div>
      <div class="bar-chart-game__question-content">
        <component
          :is="question.ChartType"
          :component-config="question.ChartData"
          :game-id="gameId"
          @reply-answer="handleChartAnswer(index, $event)"
        />
        <div v-if="question.QuestionType" class="bar-chart-game__side-content">
          <SimpleTable
            v-if="question.QuestionType === 'Table'"
            :component-config="question.QuestionData"
          />
          <MarkdownRenderer
            v-else-if="question.QuestionType === 'TextQuestion'"
            :component-config="question.QuestionData"
            @reply-answer="handleBelowAnswer(index, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "BarChartGame",
  components: {
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    DynamicBarChart: defineAsyncComponent(
      () => import("@/components/DynamicBarChart.vue")
    ),
    SimpleTable: defineAsyncComponent(() => import("@/components/SimpleTable.vue")),
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
      answers: [],
    };
  },
  computed: {
    questions() {
      return Array.isArray(this.gameData.Questions) ? this.gameData.Questions : [];
    },
  },
  created() {
    this.answers = this.questions.map((question) => ({
      top: false,
      bottom:
        !question.QuestionType || question.QuestionType === "Table"
          ? true
          : false,
    }));
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    handleChartAnswer(index, isCorrect) {
      const current = this.answers[index] || { top: false, bottom: true };
      this.answers.splice(index, 1, {
        ...current,
        top: Boolean(isCorrect),
      });
    },
    handleBelowAnswer(index, isCorrect) {
      const current = this.answers[index] || { top: false, bottom: false };
      this.answers.splice(index, 1, {
        ...current,
        bottom: Boolean(isCorrect),
      });
    },
    checkAnswer() {
      const pass = this.answers.length
        ? this.answers.every((item) => item.top && item.bottom)
        : true;
      this.$emit("play-effect", pass ? "CorrectSound" : "WrongSound");
      this.$emit("add-record", ["不支援", "不支援", pass ? "正確" : "錯誤"]);
      if (pass) this.$emit("next-question");
    },
  },
};
</script>

<style scoped>
.bar-chart-game {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 8px 16px;
  box-sizing: border-box;
}
.bar-chart-game__title {
  width: 100%;
  display: flex;
  justify-content: center;
}
.bar-chart-game__question {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bar-chart-game__question-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
}
.bar-chart-game__question-text {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 16px;
}
.bar-chart-game__side-content {
  margin-top: 0;
  width: auto;
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
}
:deep(.dynamic-bar-chart) {
  width: auto;
  flex: 0 0 auto;
  align-items: center;
}
:deep(.dynamic-bar-chart .chart-area) {
  justify-content: center;
}
</style>
