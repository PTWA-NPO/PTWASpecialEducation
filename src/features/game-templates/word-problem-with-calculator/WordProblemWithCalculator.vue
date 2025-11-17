<template>
  <div class="outter-container">
    <div v-if="gameData.headQuestion" class="head-container">
      <p>{{ gameData.headQuestion }}</p>
    </div>
    <div class="word-problem">
      <div class="left-container">
        <ImageContainer
          v-if="gameData.image"
          :game-id="gameId"
          :component-config="gameData.image"
        />
        <MarkdownRenderer
          class="markdown"
          :component-config="markdownData"
          :game-id="gameId"
          @reply-answer="markdownAnswer"
        />
      </div>
      <div class="right-container">
        <div class="calculator-container">
          <component
            :is="gameConfig.calculator"
            class="calculator"
            :component-config="calculatorData"
            :game-id="gameId"
            @reply-answer="calculatorAnswer"
          />
        </div>

        <!-- <button class="submit" @click="checkAnswer">檢查答案</button> -->
      </div>
    </div>
  </div>
</template>
<script>
import { getComponents } from "@/lib/get-components.js";
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "WordProblemWithCalculator",
  components: {
    MarkdownRenderer: getComponents("MarkdownRenderer"),
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    CalculationBoard: defineAsyncComponent(
      () => import("@/components/CalculationBoard.vue")
    ),
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameConfig: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
  },
  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      // gameData: {
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
    this.calculatorData = this.gameData.calculator;
    this.markdownData = this.gameData.markdown;
    emitter.on("submitAnswer", this.checkAnswer);
  },
  mounted() {
    // Lifecycle hook when component is mounted
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    checkAnswer() {
      if (!this.gameConfig.calculatorVerify) this.calculatorAnswerStatus = true;
      if (!this.gameConfig.markdownVerify) this.markdownAnswerStatus = true;

      emitter.emit("checkAnswer");
      if (this.markdownAnswerStatus && this.calculatorAnswerStatus) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["答案全對", "", "正確"]);
        this.$emit("next-question");
      } else if (
        this.markdownAnswerStatus === false &&
        this.calculatorAnswerStatus === false
      ) {
        this.$emit("add-record", ["答案全錯", "", "錯誤"]);
        this.$emit("play-effect", "WrongSound");
      } else if (this.calculatorAnswerStatus === false) {
        this.$emit("add-record", ["計算機答案錯誤", "", "錯誤"]);
        this.$emit("play-effect", "WrongSound");
      } else if (this.markdownAnswerStatus === false) {
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
}

.head-container {
  @extend .container-basic;
  display: flex;
  background-color: $primary-color;
  padding: $padding--small;
  font-size: $text-medium;
  width: 100%;
}

.word-problem {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  padding: 0 $padding--small;
  display: flex;
  justify-content: center;
  gap: $gap--small;
  flex-direction: row;
  .right-container {
    width: 30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: $gap--small;
    .calculator-container {
      flex: 1 1 0%;
      min-height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    .submit {
      @extend .button-basic;
      width: 100%;
      height: 50px;
      min-height: 50px;
      max-height: 80px;
      border: none;
      background-color: $submit-color;
    }
  }
  .left-container {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $gap--small;
    .markdown {
      width: 100%;
      max-height: 200px;
    }
    .image-container {
      flex: 1;
      width: 100%;
    }
  }
}
p {
  margin: 0;
  padding: 0;
}
</style>
