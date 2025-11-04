<template>
  <div class="MA3151__container">
    <p class="question-text">
      <FractionText :text="gameData.questionDescription" :game-id="gameId" />
    </p>
    <div class="question-section">
      <InteractiveFractionVisual
        :component-config="gameData.question"
        :game-id="gameId"
        class="question-visual"
        @reply-answer="handleAnswer(0, $event)"
      />
    </div>

    <div class="answer-section">
      <div class="answer-row">
        <template v-if="answerType === 'both' || answerType === 'fraction'">
          <div class="answer-item">
            <span>用分數表示：</span>
            <FractionForAnswer
              :component-config="gameData.answer.fraction"
              :game-id="gameId"
              class="fraction-answer"
              @reply-answer="handleAnswer(1, $event)"
            />
            <span class="answer-suffix">{{ gameData.answer.suffix }}</span>
          </div>
        </template>

        <template v-if="answerType === 'both' || answerType === 'decimal'">
          <div class="answer-item">
            <span>用小數表示：</span>
            <NumberIncrementor
              :component-config="gameData.answer.decimal"
              :game-id="gameId"
              @reply-answer="handleAnswer(2, $event)"
            />
            <span class="answer-suffix">{{ gameData.answer.suffix }}</span>
          </div>
        </template>
      </div>

      <!-- <button class="submit-btn" @click="submitAnswer">送出答案</button> -->
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "FractionGame",
  components: {
    InteractiveFractionVisual: defineAsyncComponent(
      () => import("@/components/InteractiveFractionVisual.vue")
    ),
    NumberIncrementor: defineAsyncComponent(
      () => import("@/components/NumberIncrementor.vue")
    ),
    FractionForAnswer: defineAsyncComponent(
      () => import("@/components/FractionForAnswer.vue")
    ),
    FractionText: defineAsyncComponent(
      () => import("@/components/FractionText.vue")
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
  emits: ["add-record", "next-question", "play-effect"],
  data() {
    return {
      currentQuestion: {
        numerator: 0,
        denominator: 0,
      },
      userAnswer: {
        question: false,
        fraction: false,
        decimal: false,
      },
    };
  },
  computed: {
    answerType() {
      return this.gameData.answerType || "fraction"; // 可能的值：'fraction', 'decimal', 'both'
    },
  },
  created() {
    this.initializeQuestion();
    emitter.on("submitAnswer", this.submitAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitAnswer);
  },
  methods: {
    initializeQuestion() {
      // 從 gameData 初始化當前題目
      this.currentQuestion = {
        numerator: this.gameData.numerator,
        denominator: this.gameData.denominator,
      };
    },
    handleAnswer(answerType, answer) {
      console.log(answerType, answer);
      if (answerType === 0) {
        this.userAnswer.question = answer;
      } else if (answerType === 1) {
        this.userAnswer.fraction = answer;
      } else if (answerType === 2) {
        this.userAnswer.decimal = answer;
      }
    },
    submitAnswer() {
      const isCorrect = this.checkAnswer();

      this.$emit("add-record", [
        "不支援顯示",
        "不支援顯示",
        isCorrect ? "正確" : "錯誤",
      ]);
      this.$emit("play-effect", isCorrect ? "CorrectSound" : "WrongSound");
      isCorrect ? this.$emit("next-question") : null;
    },
    checkAnswer() {
      switch (this.answerType) {
        case "fraction":
          return this.userAnswer.fraction && this.checkQuestion();
        case "decimal":
          return this.userAnswer.decimal && this.checkQuestion();
        case "both":
          return (
            this.userAnswer.fraction &&
            this.userAnswer.decimal &&
            this.checkQuestion()
          );
      }
    },
    checkQuestion() {
      if (!this.gameData.question.DisplayOnly) {
        return this.userAnswer.question;
      }
      return true;
    },
  },
};
</script>

<style scoped lang="scss">
.MA3151__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.question-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: $gap--tiny;
}

.question-text {
  font-size: $text-large;
  text-align: center;
  margin-bottom: 0;
}

.question-visual {
  max-width: 300px;
}

.answer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap--tiny;
  width: 100%;
}

.answer-row {
  max-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: $gap--small;
}

.answer-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  span {
    font-size: 1.25rem;
    color: #333;
    white-space: nowrap;
  }
}

.answer-suffix {
  margin-left: 0.5rem;
}

.submit-btn {
  padding: 0.5rem 2rem;
  background-color: $submit-color;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
}
</style>
