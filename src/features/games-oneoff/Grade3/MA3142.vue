<template>
  <div class="MA3142__container">
    <!-- <component :is="componentName" :Data="componentsData" :gameId="gameId" @replyAnswer="replyAnswerFunc"/> -->
    <ImageContainer
      class="MA3142__question-img"
      :component-config="imgData"
      :game-id="gameId"
    ></ImageContainer>
    <TextOnly
      class="MA3142__question-description"
      :component-config="textData"
      :game-id="gameId"
    ></TextOnly>
    <Scale
      class="MA3142__scale"
      :component-config="scaleData"
      :game-id="gameId"
      @reply-answer="userAnswerUpdate"
    ></Scale>
    <!-- <button class="submit-btn" @click="submitAnswer">送出答案</button> -->
  </div>
</template>
<script>
import { getComponents } from "@/utilitys/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "MA3142",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    Scale: getComponents("ScalePointer"),
    ImageContainer: getComponents("ImageContainer"),
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
      textData: this.gameData.TextData,
      imgData: this.gameData.ImageData,
      scaleData: this.gameData.ScaleData,
      userAnswer: null,
      correctAnswer: this.gameData.Answer,
    };
  },
  created() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    // Your methods here
    userAnswerUpdate(userAnswer) {
      this.userAnswer = userAnswer;
    },
    checkAnswer() {
      const isCorrect = this.userAnswer === this.correctAnswer;
      this.$emit("play-effect", isCorrect ? "CorrectSound" : "WrongSound");
      this.$emit("add-record", [
        this.correctAnswer,
        this.userAnswer,
        isCorrect ? "正確" : "錯誤",
      ]);

      if (isCorrect) {
        this.$emit("next-question");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.MA3142 {
  &__container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $gap--tiny;
    align-items: center;
  }
  &__question-img {
    flex: 1;
    max-height: 25%;
  }
  &__question-description {
    flex: 0.5;
  }
  &__scale {
    flex: 4;
    min-width: 40%;
    max-width: 400px;
  }
  &__submit {
    position: absolute;
    bottom: 5vh;
    right: 5vw;
    width: 10rem;
    height: 5rem;
    background-color: $submit-color;
    border: none;
  }
}
</style>
