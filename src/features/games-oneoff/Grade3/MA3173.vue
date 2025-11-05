<template>
  <div class="MA3173__container">
    <div class="MA3173__question">
      <div class="MA3173__title">題目：{{ gameData.Question }}</div>
      <CalculationBoard
        class="MA3173__calculation-board"
        :component-config="questionData"
        :game-id="gameId"
      />
    </div>
    <div class="MA3173__verify-answer">
      <div class="MA3173__title">驗證區</div>
      <div class="calculation-board-wrapper">
        <template v-for="(item, index) in answerData" :key="index">
          <div class="MA3173__answer-board">
            <div v-if="answerData.length >= 2">
              <div v-if="index === 0" class="MA3173__text">先</div>
              <div v-else class="MA3173__text">後</div>
            </div>
            <CalculationBoard
              class="MA3173__calculation-board"
              :component-config="item"
              :game-id="gameId"
              @reply-answer="replyAnswerFunc(index, $event)"
            />
          </div>
        </template>
      </div>
    </div>
    <!-- <component :is="componentName" :Data="componentsData" :gameId="gameId" @replyAnswer="replyAnswerFunc" /> -->
  </div>
</template>
<script>
// import { defineAsyncComponent } from "vue";
// import { getGameStaticAssets } from "@/lib/get-assets.js"; // Feel free to change your the method to get assets.
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "MA3173",
  components: {
    CalculationBoard: getComponents("CalculationBoard"),
    // Import your components here, use defineAsyncComponent for lazy loading
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
      questionData: this.gameData.questionBoard,
      answerData: this.gameData.answerBoard,
      userAnswer: [],
    };
  },
  computed: {
    // Your computed properties here
  },
  created() {
    // Your created hook here
    emitter.on("submitAnswer", this.verifyAnswer);
  },
  mounted() {
    // Your mounted hook here
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.verifyAnswer);
  },
  methods: {
    // Your methods here
    verifyAnswer() {
      console.log(this.userAnswer);
      if (this.userAnswer.length !== this.answerData.length) return;
      if (this.userAnswer.every((item) => item === true)) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        emitter.emit("checkAnswer");
      }
    },
    replyAnswerFunc(index, answer) {
      console.log(index, answer);
      this.userAnswer[index] = answer;
    },
  },
};
</script>

<style scoped lang="scss">
.MA3173__container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: $gap--medium;
}

.MA3173__question {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.MA3173__verify-answer {
  height: 100%;
  flex: 2;
  display: flex;
  flex-direction: column;
}

.MA3173__title {
  font-size: 2rem;
  font-weight: bold;
}

.MA3173__text {
  font-size: 1.5rem;
}

.MA3173__calculation-board {
  width: 100%;
  height: 100%;
}

.calculation-board-wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap--medium;
}
.MA3173__calculation-board.empty {
  visibility: hidden; /* 不顯示但佔空間 */
}

.MA3173__answer-board {
  display: flex;
  flex-direction: column;
}
</style>
