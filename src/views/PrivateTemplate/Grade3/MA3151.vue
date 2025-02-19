<template>
  <div class="MA3151__container">
    <p class="question-text">{{ GameData.questionDescription }}</p>
    <div class="question-section">
      <InteractiveFractionVisual
        :Data="GameData.question"
        :ID="ID"
        class="question-visual"
        @replyAnswer="handleAnswer(0, $event)"
      />
    </div>

    <div class="answer-section">
      <div class="answer-row">
        <template v-if="answerType === 'both' || answerType === 'fraction'">
          <div class="answer-item">
            <span>用分數表示：</span>
            <FractionForAnswer
              :Data="GameData.answer.fraction"
              :ID="ID"
              class="fraction-answer"
              @replyAnswer="handleAnswer(1, $event)"
            />
            <span class="answer-suffix">{{ GameData.answer.suffix }}</span>
          </div>
        </template>

        <template v-if="answerType === 'both' || answerType === 'decimal'">
          <div class="answer-item">
            <span>用小數表示：</span>
            <NumberIncrementor
              :Data="GameData.answer.decimal"
              :ID="ID"
              @replyAnswer="handleAnswer(2, $event)"
            />
            <span class="answer-suffix">{{ GameData.answer.suffix }}</span>
          </div>
        </template>
      </div>

      <button class="submit-btn" @click="submitAnswer">送出答案</button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { getGameStaticAssets } from "@/utilitys/get_assets.js"; // Feel free to change your the method to get assets.

export default {
  name: "FractionGame",
  components: {
    InteractiveFractionVisual: defineAsyncComponent(() =>
      import("@/components/InteractiveFractionVisual.vue")
    ),
    NumberIncrementor: defineAsyncComponent(() =>
      import("@/components/NumberIncrementor.vue")
    ),
    FractionForAnswer: defineAsyncComponent(() =>
      import("@/components/FractionForAnswer.vue")
    ),
  },
  props: {
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
    ID: {
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
      return this.GameData.answerType || "fraction"; // 可能的值：'fraction', 'decimal', 'both'
    },
  },
  created() {
    this.initializeQuestion();
  },
  mounted() {
    // Your mounted hook here
  },
  methods: {
    initializeQuestion() {
      // 從 GameData 初始化當前題目
      this.currentQuestion = {
        numerator: this.GameData.numerator,
        denominator: this.GameData.denominator,
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
      if (!this.GameData.question.DisplayOnly) {
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
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
}
</style>
