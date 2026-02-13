<template>
  <div class="container">
    <div class="question-area">
      {{ gameData.Question }}
    </div>
    <div class="game-area">
      <WaterScrollable
        :component-config="gameData.waterContainer"
        @update-m-l="recordAnswer"
      />
      <!-- <button class="submit-btn" @click="checkAnswer">送出答案</button> -->
    </div>
  </div>
</template>
<script>
import WaterScrollable from "@/components/WaterScrollable.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "MA3031",
  components: {
    WaterScrollable,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
  },
  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      // Add your component data here
      replyAnswerCache: "",
    };
  },
  created() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    recordAnswer(answer) {
      this.replyAnswerCache = answer;
    },
    checkAnswer() {
      if (this.replyAnswerCache === this.gameData.answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
        this.$emit("add-record", [
          this.gameData.answer,
          this.replyAnswerCache,
          "正確",
        ]);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.answer,
          this.replyAnswerCache,
          "錯誤",
        ]);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: $gap--medium;
  grid-template-rows: 1fr 5fr;
  height: 100%;
  .question-area {
    @extend .container-basic;
    padding: $gap--small;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    background-color: $info-color;
  }
  .game-area {
    @extend .container-basic;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $gap--medium;
    button {
      @extend .button-basic;
      border: none;
      width: 100%;
      height: 50%;
      font-size: 1.5rem;
      background-color: $submit-color;
    }
    button:hover {
      transform: scale($transform-scale);
      transition: $transition-time;
    }
  }
}
</style>
