<template>
  <div class="outter-container">
    <div v-if="GameData.headQuestion" class="head-container">
      <p>{{ GameData.headQuestion }}</p>
    </div>
    <div class="word-problem">
      <div class="left-container">
        <Markdown
          class="markdown"
          :Data="markdownData"
          @reply-answer="markdownAnswer"
        />
        <button class="submit" @click="checkAnswer">檢查答案</button>
      </div>
      <div class="right-container">
        <Calculator :Data="calculatorData" @reply-answer="calculatorAnswer" />
      </div>
    </div>
  </div>
</template>
<script>
import Calculator from "@/components/Calculator.vue";
import Markdown from "@/components/Markdown.vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "WordProblemWithCalculator",
  components: {
    Calculator,
    Markdown,
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
      // GameData: {
      //   calculator: {
      //     Unit: "Volume",
      //     CarryAmount: 1,
      //     CustomeUnit: null,
      //     NumberAmount: 4,
      //     decimalPoint: 0,
      //     Preset: {
      //       Number: ["1200", "1300"],
      //       Symbol: "+",
      //     },
      //     Answer: {
      //       Carry: [],
      //       Answer: "2500",
      //       Number: ["1200", "1300"],
      //       Symbol: "+",
      //     },
      //   },
      //   markdown: {
      //     Render: `# 請回答以下問題: $n$ 1公升 200毫升+1公升300毫升= $n$ $i$公升 $i$ 毫升`,
      //     Answer: [2, 500],
      //   },
      // },
      calculatorData: {
        Unit: "Volume",
        CarryAmount: 1,
        CustomeUnit: null,
        NumberAmount: 4,
        decimalPoint: 0,
        Preset: {
          Number: ["1200", "1300"],
          Symbol: "+",
        },
        Answer: {
          Carry: [],
          Answer: "2500",
          Number: ["1200", "1300"],
          Symbol: "+",
        },
      },
      markdownData: {
        Render: `# 請回答以下問題: $n$ 1公升 200毫升+1公升300毫升= $n$ $i$公升 $i$ 毫升`,
        Answer: [2, 500],
      },
      markdownAnswerStatus: false,
      calculatorAnswerStatus: false,
    };
  },
  computed: {
    // Add your computed properties here
  },
  created() {
    this.calculatorData = this.GameData.calculator;
    this.markdownData = this.GameData.markdown;
  },
  mounted() {
    // Lifecycle hook when component is mounted
  },
  methods: {
    checkAnswer() {
      if (this.GameConfig.calculatorVerify == false)
        this.calculatorAnswerStatus = true;
      if (this.GameConfig.markdownVerify == false)
        this.markdownAnswerStatus = true;

      emitter.emit("checkAnswer");
      if (this.markdownAnswerStatus && this.calculatorAnswerStatus) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["答案全對", "", "正確"]);
        this.$emit("next-question");
      } else if (
        this.markdownAnswerStatus == false &&
        this.calculatorAnswerStatus == false
      ) {
        this.$emit("add-record", ["答案全錯", "", "錯誤"]);
        this.$emit("play-effect", "WrongSound");
      } else if (this.calculatorAnswerStatus == false) {
        this.$emit("add-record", ["計算機答案錯誤", "", "錯誤"]);
        this.$emit("play-effect", "WrongSound");
      } else if (this.markdownAnswerStatus == false) {
        this.$emit("add-record", ["填空部分出現錯誤", "", "錯誤"]);
        this.$emit("play-effect", "WrongSound");
      }
    },
    calculatorAnswer(answer) {
      this.calculatorAnswerStatus = answer;
    },
    markdownAnswer(answer) {
      console.log(answer);
      this.markdownAnswerStatus = answer;
    },
  },
};
</script>
<style scoped lang="scss">
.outter-container {
  display: flex;
  flex-direction: column;
  gap: $gap--medium;
}
.head-container {
  @extend .container-basic;
  display: flex;
  background-color: $primary-color;
  padding: $gap--small;
  font-size: $text-large;
}
.word-problem {
  display: flex;
  justify-content: center;
  gap: $gap--medium;
  flex-direction: row;
  .right-container {
    width: 40%;
  }
  .left-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 40%;
    .markdown {
      width: 100%;
    }
    width: 50%;
    .submit {
      @extend .button-basic;
      width: 100%;
      border: none;
      min-height: 50px;
      background-color: $submit-color;
      &:hover {
        @extend .button--animation;
        background-color: $submit-color;
      }
    }
  }
}
</style>
