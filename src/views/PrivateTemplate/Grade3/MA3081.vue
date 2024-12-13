<template>
  <div class="container">
    <div class="question-area">
      {{ GameData.Question }}
    </div>
    <div class="game-area">
      <WaterScrollable
        :Data="GameData.waterContainer"
        @update-m-l="recordAnswer"
      />
      <button class="submit-btn" @click="checkAnswer">檢查答案</button>
    </div>
  </div>
</template>
<script>
import WaterScrollable from "@/components/WaterScrollable.vue";
export default {
  name: "MA3031",
  components: {
    WaterScrollable,
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
  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      // Add your component data here
      replyAnswerCache: "",
    };
  },
  methods: {
    recordAnswer(answer) {
      this.replyAnswerCache = answer;
    },
    checkAnswer() {
      if (this.replyAnswerCache === this.GameData.answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
        this.$emit("add-record", [
          this.GameData.answer,
          this.replyAnswerCache,
          "正確",
        ]);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.answer,
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
