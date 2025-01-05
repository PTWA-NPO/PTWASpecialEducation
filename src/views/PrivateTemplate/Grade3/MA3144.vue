<template>
  <div class="MA3144__container">
    <TextOnly :Data="GameData.QuestionDescription" :ID="ID" />
    <p class="MA3144__hint">
      {{ GameData.HintText }}
    </p>
    <div class="MA3144__answer">
      <p class="MA3144__answer-text">{{ GameData.Question }}</p>
      <span class="MA3144__equals-sign">&#61;</span>
      <div
        v-for="(format, index) in GameData.answerFormat"
        :key="index"
        class="MA3144__input-group"
      >
        <NumberIncrementor
          :Data="format.Data"
          :ID="ID"
          @numberChanged="(value) => handleNumberChange(value, format.unit)"
        ></NumberIncrementor>
        <span class="MA3144__unit">{{ format.unit }}</span>
      </div>
    </div>
    <button class="MA3144__submit-btn" @click="checkAnswer">送出答案</button>
  </div>
</template>
<script>
import { getComponents } from "@/utilitys/get-components.js";
export default {
  name: "MA3144",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    NumberIncrementor: getComponents("NumberIncrementor"),
    TextOnly: getComponents("TextOnly"),
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
      // Your data here
      numberData: {
        digitCount: 2,
      },
      userAnswer: {
        kg: 0,
        g: 0,
      },
    };
  },
  computed: {
    // Your computed properties here
  },
  created() {
    // Your created hook here
  },
  mounted() {
    // Your mounted hook here
  },
  methods: {
    // Your methods here
    handleNumberChange(value, unit) {
      this.userAnswer[unit] = value;
    },
    formatAnswer(answer) {
      let result = "";
      if (answer.kg !== undefined && answer.kg !== 0) {
        result += `${answer.kg}公斤`;
      }
      if (answer.g !== undefined && answer.g !== 0) {
        result += `${answer.g}公克`;
      }
      return result;
    },
    checkAnswer() {
      const correctAnswer = this.GameData.correctAnswer;
      const correctAnswerStr = this.formatAnswer(correctAnswer);
      const userAnswerStr = this.formatAnswer(this.userAnswer);
      const isCorrect = this.isAnswerCorrect(correctAnswer);

      this.emitResult(correctAnswerStr, userAnswerStr, isCorrect);
    },
    isAnswerCorrect(correctAnswer) {
      return Object.keys(correctAnswer).every(
        (unit) => this.userAnswer[unit] === correctAnswer[unit]
      );
    },
    emitResult(correctAnswerStr, userAnswerStr, isCorrect) {
      const result = isCorrect ? "正確" : "錯誤";
      const soundEffect = isCorrect ? "CorrectSound" : "WrongSound";

      this.$emit("add-record", [correctAnswerStr, userAnswerStr, result]);
      this.$emit("play-effect", soundEffect);

      if (isCorrect) {
        this.$emit("next-question");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.MA3144 {
  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $gap--medium;
  }

  &__hint {
    margin: 0;
    font-size: $text-medium;
    color: #666;
  }

  &__answer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-large;
    gap: $gap--small;
  }

  &__answer-text {
    margin: 0;
  }

  &__input-group {
    display: flex;
    align-items: center;
    gap: $gap--small;
  }

  &__submit-btn {
    height: 120px;
    width: 200px;
    border-radius: 10px;
    background-color: #567c8d;
    color: #f5efe8;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: darken(#567c8d, 10%);
    }
  }
}
</style>
