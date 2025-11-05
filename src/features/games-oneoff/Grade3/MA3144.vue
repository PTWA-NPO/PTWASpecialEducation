<template>
  <div class="MA3144__container">
    <TextOnly
      :component-config="gameData.QuestionDescription"
      :game-id="gameId"
    />
    <p class="MA3144__hint">
      {{ gameData.HintText }}
    </p>
    <div class="MA3144__answer">
      <p class="MA3144__answer-text">{{ gameData.Question }}</p>
      <span class="MA3144__equals-sign">&#61;</span>
      <div
        v-for="(format, index) in gameData.answerFormat"
        :key="index"
        class="MA3144__input-group"
      >
        <NumberIncrementor
          :component-config="format.Data"
          :game-id="gameId"
          @number-changed="(value) => handleNumberChange(value, format.unit)"
          @reply-answer="
            (isCorrect) => handleReplyAnswer(isCorrect, format.unit)
          "
        ></NumberIncrementor>
        <span class="MA3144__unit">{{ format.unit }}</span>
      </div>
    </div>
    <!-- <button class="submit-btn" @click="submitAnswer">送出答案</button> -->
  </div>
</template>
<script>
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "MA3144",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    NumberIncrementor: getComponents("NumberIncrementor"),
    TextOnly: getComponents("TextOnly"),
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
      // Your data here
      userAnswer: {
        kg: 0,
        g: 0,
      },
      unitCorrect: {},
    };
  },
  computed: {
    // Your computed properties here
  },
  created() {
    // Your created hook here
    emitter.on("submitAnswer", this.submitAnswer);
  },
  mounted() {
    // Your mounted hook here
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitAnswer);
  },
  methods: {
    // Your methods here
    handleNumberChange(value, unit) {
      this.userAnswer[unit] = value;
    },
    handleReplyAnswer(isCorrect, unit) {
      this.unitCorrect[unit] = isCorrect;
      console.log(this.unitCorrect);
    },
    submitAnswer() {
      const requiredUnits = this.gameData.answerFormat.length;
      const correctUnits = Object.keys(this.unitCorrect).length;
      const allCorrect =
        correctUnits === requiredUnits &&
        Object.values(this.unitCorrect).every(Boolean);

      const correctAnswer = this.gameData.correctAnswer;
      const correctAnswerStr = this.formatAnswer(correctAnswer);
      const userAnswerStr = this.formatAnswer(this.userAnswer);
      this.emitResult(correctAnswerStr, userAnswerStr, allCorrect);
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
    emitResult(correctAnswerStr, userAnswerStr, isCorrect) {
      const result = isCorrect ? "正確" : "錯誤";
      const soundEffect = isCorrect ? "CorrectSound" : "WrongSound";

      this.$emit("add-record", [correctAnswerStr, userAnswerStr, result]);
      this.$emit("play-effect", soundEffect);

      if (isCorrect) {
        this.$emit("next-question");
      } else {
        emitter.emit("checkAnswer");
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
    background-color: $submit-color;
    color: #f5efe8;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: darken(#567c8d, 10%);
    }
  }
}
</style>
