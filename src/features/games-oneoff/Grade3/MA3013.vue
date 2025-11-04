<template>
  <div class="outter-container">
    <div class="title">
      <a>{{ gameData.questionText }}</a>
    </div>
    <div class="game-area">
      <div class="left-component">
        <MoneyGenerator
          class="money-generator"
          :game-id="gameId"
          :component-config="moneyGeneratorData"
        />
        <MarkdownRenderer
          class="markdown"
          :game-id="gameId"
          :component-config="markdownData"
          @reply-answer="markdownReplyAnswer"
        />
      </div>
      <div class="right-component">
        <NumberBoard
          class="number-board"
          :component-config="numberInputData"
          @reply-answer="numberBoardReply"
        />
        <!-- <button class="btn-submit" @click="checkAnswer">送出答案</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import MoneyGenerator from "@/components/MoneyGenerator.vue";
import NumberBoard from "@/components/NumberBoard.vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "MA3013",
  components: {
    MoneyGenerator,
    MarkdownRenderer,
    NumberBoard,
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
  emits: ["play-effect", "next-question", "add-record", "scratchSheet"],
  data() {
    return {
      moneyGeneratorData: {},
      markdownData: {
        Render: undefined,
        Answer: [1, 3, 6, 1],
      },
      numberInputData: {
        Unit: ["千位", "百位", "十位", "個位"],
        Number: undefined,
        isInput: true,
      },
      BoardReply: undefined,
      markdownReply: undefined,
      answerArr: [],
      nowSelect: undefined,
    };
  },
  computed: {
    // Add your computed properties here
  },
  created() {
    this.markdownData.Render = this.gameData.markdownIndex;
    this.numberInputData.Number = this.gameData.answer;
    this.markdownData.Answer = this.gameData.markdownInputIndex;
    // 如果答案不是四位數，則補齊
    this.answerArr = this.gameData.moneyBoard;
    const diff = 4 - this.answerArr.length;
    for (let i = 0; i < diff; i++) {
      this.answerArr.unshift(0);
    }

    this.moneyGeneratorData = {
      Thousands: this.answerArr[0],
      FiveHundreds: 0,
      Hundreds: this.answerArr[1],
      Fifties: 0,
      Tens: this.answerArr[2],
      Fives: 0,
      Ones: this.answerArr[3],
    };
    document.addEventListener("click", this.nowClicked);
    emitter.on("submitAnswer", this.checkAnswer);
  },
  mounted() {
    // Lifecycle hook when the component is mounted
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    // Add your component methods here
    numberBoardReply(reply) {
      this.BoardReply = reply;
    },
    markdownReplyAnswer(reply) {
      this.markdownReply = reply;
    },
    nowClicked() {
      if (document.activeElement.tagName === "INPUT") {
        this.nowSelect = document.activeElement;
      } else if (
        document.activeElement.tagName === "BUTTON" &&
        this.nowSelect
      ) {
        this.nowSelect.focus();
      }
    },
    checkAnswer() {
      console.log(this.BoardReply, this.markdownReply);
      if (this.BoardReply && this.markdownReply) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援", "不支援", "錯誤"]);
        emitter.emit("checkAnswer");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.outter-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap--small;
  .title {
    flex: 1;
    @extend .container-basic;
    padding: $gap--small;
    width: 100%;
    background-color: $primary-color;
    font-size: 2em;
  }
  .left-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $gap--small;
    width: 70%;
    height: 100%;
    overflow: hidden;
    .markdown {
      flex: 1;
      min-height: 0;
    }
    .money-generator {
      flex: 3;
      width: 100%;
      min-height: 0;
      border-radius: $border-radius;
      padding: $padding--small;
      background-color: $sub-color;
      overflow: hidden;
    }
    :deep(input) {
      max-width: 100px;
    }
  }
  .right-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: $gap--small;
    width: 40%;
    .number-board {
      width: 100%;
      height: 100%;
      max-height: 200px;
    }
  }
  .markdown {
    width: 100%;
    border-radius: $border-radius;
    padding: $gap--small;
    background-color: $info-color;
  }
  .btn-submit {
    padding: $gap--small;
    width: 100%;
    border: none;
    border-radius: $border-radius;
    background-color: $submit-color;
    &:hover {
      transform: scale($transform-scale);
    }
  }
}
.game-area {
  display: flex;
  width: 100%;
  height: 80%;
  gap: $gap--small;
  overflow: hidden;
}
</style>
