<template>
  <div class="outter-container">
    <div class="title">
      <a>{{ GameData.questionText }}</a>
    </div>
    <div class="game-area">
      <div class="left-component">
        <MoneyGenerator class="money-generator" :Data="moneyGeneratorData" />
        <Markdown
          class="markdown"
          :Data="markdownData"
          @reply-answer="markdownReplyAnswer"
        />
      </div>
      <div class="right-component">
        <NumberBoardInput
          class="number-board"
          :Data="numberInputData"
          @reply-answer="numberBoardReply"
        />
        <VirtualNumPad
          @virtualpadinputInputt="push"
          @virtualpadinputDelete="clear"
          @virtualpadinput-pop="pop"
        />
        <button class="btn-submit" @click="checkAnswer">檢查答案</button>
        <button class="btn-submit" @click="openScratchSheet">開啟畫筆</button>
      </div>
    </div>
  </div>
</template>

<script>
import MoneyGenerator from "@/components/MoneyGenerator.vue";
import VirtualNumPad from "@/components/VirtualNumPadInput.vue";
import Markdown from "@/components/Markdown.vue";
import NumberBoardInput from "@/components/NumberBoardInput.vue";
import { now } from "@vueuse/core";

export default {
  name: "MA3013",
  components: {
    MoneyGenerator,
    VirtualNumPad,
    Markdown,
    NumberBoardInput,
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
    this.markdownData.Render = this.GameData.markdownIndex;
    this.numberInputData.Number = this.GameData.answer;
    this.markdownData.Answer = this.GameData.markdownInputIndex;
    // 如果答案不是四位數，則補齊
    this.answerArr = this.GameData.moneyBoard;
    let diff = 4 - this.answerArr.length;
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
  },
  mounted() {
    // Lifecycle hook when the component is mounted
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
      if (document.activeElement.tagName == "INPUT") {
        this.nowSelect = document.activeElement;
      } else if (document.activeElement.tagName == "BUTTON") {
        this.NowSelect.focus();
      }
    },
    clear() {
      let activeElement = this.nowSelect;
      if (activeElement) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;
        activeElement.value = "";
        activeElement.selectionStart = activeElement.selectionEnd = start - 1;
        const event = new Event("input", { bubbles: true });
        activeElement.dispatchEvent(event);
      }
    },
    pop() {
      let activeElement = this.nowSelect;
      if (activeElement) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;
        activeElement.value = value.slice(0, start) + value.slice(end);
        activeElement.selectionStart = activeElement.selectionEnd = start;
        const event = new Event("input", { bubbles: true });
        activeElement.dispatchEvent(event);
      }
    },
    push(ch) {
      let activeElement = this.nowSelect;
      activeElement.focus();
      if (activeElement) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;
        activeElement.value = activeElement.value + ch;
        activeElement.selectionStart = activeElement.selectionEnd = start + 1;
        const event = new Event("input", { bubbles: true });
        activeElement.dispatchEvent(event);
      }
    },
    checkAnswer() {
      if (this.BoardReply && this.markdownReply) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援", "不支援", "錯誤"]);
      }
    },
    openScratchSheet() {
      this.$emit("scratchSheet");
    },
  },
};
</script>

<style scoped lang="scss">
.outter-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    @extend .container-basic;
    padding: $gap--small;
    width: 100%;
    background-color: $primary-color;
    font-size: 2em;
    margin: 10px;
  }
  .left-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $gap--small;
    width: 70%;
    .money-generator {
      width: 100%;
      border-radius: $border-radius;
      padding: $gap--small;
      background-color: $sub-color;
    }
    :deep(input) {
      max-width: 100px;
    }
  }
  .right-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $gap--small;
    width: 40%;
    .number-board {
      width: 40%;
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
    width: 70%;
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
}
</style>
