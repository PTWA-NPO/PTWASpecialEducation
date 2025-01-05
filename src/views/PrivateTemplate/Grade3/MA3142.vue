<template>
  <div class="MA3142__container">
    <!-- <component :is="componentName" :Data="componentsData" :ID="ID" @replyAnswer="replyAnswerFunc"/> -->
    <ImageContainer
      class="MA3142__question-img"
      :Data="imgData"
      :ID="ID"
    ></ImageContainer>
    <TextOnly
      class="MA3142__question-description"
      :Data="textData"
      :ID="ID"
    ></TextOnly>
    <Scale
      class="MA3142__scale"
      :Data="scaleData"
      :ID="ID"
      @replyAnswer="userAnswerUpdate"
    ></Scale>
    <button class="MA3142__submit" @click="checkAnswer">送出答案</button>
  </div>
</template>
<script>
import { getComponents } from "@/utilitys/get-components.js";
export default {
  name: "MA3142",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    Scale: getComponents("Scale"),
    ImageContainer: getComponents("ImageContainer"),
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
      textData: this.GameData.TextData,
      imgData: this.GameData.ImageData,
      scaleData: this.GameData.ScaleData,
      userAnswer: null,
      correctAnswer: this.GameData.Answer,
    };
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
    flex: 2;
    max-height: 30%;
  }
  &__question-description {
    flex: 1;
  }
  &__scale {
    flex: 3;
    min-width: 30%;
    max-width: 300px;
  }
  &__submit {
    position: absolute;
    bottom: 5vh;
    right: 5vw;
    width: 10rem;
    height: 5rem;
    background-color: #a6a6a6;
    border: none;
  }
}
</style>
