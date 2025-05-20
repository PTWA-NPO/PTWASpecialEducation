<template>
  <div class="outter-container">
    <div v-if="GameData.headQuestion" class="head-container">
      <p>{{ GameData.headQuestion }}</p>
    </div>
    <div class="word-problem">
      <div class="left-container">
        <ImageContainer v-if="GameData.image" :ID="ID" :Data="GameData.image" />
        <Markdown
          class="markdown"
          :Data="markdownData"
          :ID="ID"
          @reply-answer="markdownAnswer"
        />
      </div>
      <div class="right-container">
        <component
          :is="GameConfig.calculator"
          :Data="calculatorData"
          :ID="ID"
          @reply-answer="calculatorAnswer"
        />
        <button class="submit" @click="checkAnswer">檢查答案</button>
      </div>
    </div>
  </div>
</template>
<script>
import { getComponents } from "@/utilitys/get-components.js";
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "WordProblemWithCalculator",
  components: {
    Calculator: getComponents("Calculator"),
    Markdown: getComponents("Markdown"),
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    DecimalCalculator: defineAsyncComponent(
      () => import("@/components/DecimalCalculator.vue")
    ),
    Division: defineAsyncComponent(() => import("@/components/Division.vue")),
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
      if (!this.GameConfig.calculatorVerify) this.calculatorAnswerStatus = true;
      if (!this.GameConfig.markdownVerify) this.markdownAnswerStatus = true;

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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $gap--small;
  justify-content: center;
  align-items: center;
}

.head-container {
  @extend .container-basic;
  display: flex;
  background-color: $primary-color;
  padding: 0 $padding--small;
  font-size: $text-medium;
  width: 100%;
  height: 20%;
}

.word-problem {
  height: 80%;
  width: 100%;
  padding: 0 $padding--small;
  display: flex;
  justify-content: center;
  gap: $gap--small;
  flex-direction: row;
  .right-container {
    width: 40%;
    display: flex;
    flex-direction: column;
    gap: $gap--small;
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
  .left-container {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $gap--small;
    width: 40%;
    height: 100%;
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
