<template>
  <div class="outter-container">
    <div class="left-column">
      <div v-if="gameData.questionText" class="text-area">
        {{ gameData.questionText }}
      </div>
      <div v-if="gameConfig.layout.top" class="game-area--top game-area">
        <component
          :is="gameData.topComponent.Name"
          :component-config="gameData.topComponent.Data"
          :game-id="gameId"
          @reply-answer="topReply"
        ></component>
      </div>
      <div v-if="gameData.middleText" class="text-area">
        {{ gameData.middleText }}
      </div>
      <div v-if="gameConfig.layout.down" class="game-area--down game-area">
        <component
          :is="gameData.downComponent.Name"
          :component-config="gameData.downComponent.Data"
          :game-id="gameId"
          @reply-answer="downReply"
        ></component>
      </div>
    </div>
    {{ NowSelect }}
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "NumberLock",
  components: {
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    MarkdownRenderer: defineAsyncComponent(
      () => import("@/components/MarkdownRenderer.vue")
    ),
    NumberLine: defineAsyncComponent(
      () => import("@/components/NumberLine.vue")
    ),
    NumberLineWithBlank: defineAsyncComponent(
      () => import("@/components/NumberLineWithBlank.vue")
    ),
    DragOnNumberLine: defineAsyncComponent(
      () => import("@/components/DragOnNumberLine.vue")
    ),
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    InteractiveMathEquation: defineAsyncComponent(
      () => import("@/components/InteractiveMathEquation.vue")
    ),
    RepeatImage: defineAsyncComponent(
      () => import("@/components/RepeatImage.vue")
    ),
    DragImages: defineAsyncComponent(
      () => import("@/components/DragImages.vue")
    ),
    NumberBoard: defineAsyncComponent(
      () => import("@/components/NumberBoard.vue")
    ),
    FractionForAnswer: defineAsyncComponent(
      () => import("@/components/FractionForAnswer.vue")
    ),
    NumberLineVisualizer: defineAsyncComponent(
      () => import("@/components/NumberLineVisualizer.vue")
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
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      NowSelect: null,
      ShowPad: false,
      topComponentsAnswer: false,
      downComponentsAnswer: false,
    };
  },
  computed: {},
  created() {
    const NewArr = [];
    let cnt = 0;
    for (const i in this.gameData.Data) {
      NewArr.push(this.gameData.Data[i]);
      // Initial the ComponentAnswer
      if (this.gameData.Data[i].Blank === true) {
        this.ComponentsAnswers[cnt] = false;
      }
      cnt++;
      if (i !== this.gameData.Data.length - 1) {
        NewArr.push({
          Arrow: true,
        });
        cnt++;
      }
    }
    this.FinalData = NewArr;
    emitter.on("submitAnswer", this.CheckAnswer);
  },
  mounted() {
    if (this.gameConfig.NumberPadAutoDisappear === false) {
      this.SlidAnimation("in");
      this.ShowPad = true;
    }
    document.addEventListener("click", this.NowClick);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.CheckAnswer);
  },
  methods: {
    downReply(result) {
      console.log(result);
      this.downComponentsAnswer = result;
    },
    topReply(result) {
      console.log(result);
      this.topComponentsAnswer = result;
    },
    NowClick() {
      if (this.gameConfig.layout.pad === false) return;
      if (document.activeElement.tagName === "INPUT") {
        this.SlidAnimation("in");
        this.ShowPad = true;
        this.NowSelect = document.activeElement;
      } else if (document.activeElement.tagName === "BUTTON") {
        this.NowSelect.focus();
        this.ShowPad = true;
      } else {
        if (this.gameConfig.NumberPadAutoDisappear !== false) {
          this.ShowPad = false;
          this.SlidAnimation("out");
        }
      }
    },
    SlidAnimation(action) {
      if (this.gameConfig.layout.pad === false) return;
      if (this.gameConfig.NumberPadAutoDisappear !== false) {
        const OutterContainer =
          document.getElementsByClassName("OutterContainer")[0];
        const GameWindows = document.getElementsByClassName("GameWindows")[0];
        if (action === "in") {
          OutterContainer.style.gridTemplateColumns = "4fr 1f";
          GameWindows.style.gridColumn = "1/2";
        } else {
          OutterContainer.style.gridTemplateColumns = "1fr";
          GameWindows.style.gridColumn = "1/2";
        }
      }
    },
    CheckAnswer() {
      console.log(this.topComponentsAnswer, this.downComponentsAnswer);
      if (
        this.gameConfig.layout.top === false ||
        this.gameConfig.checkAnswer.top === false
      ) {
        this.topComponentsAnswer = true;
      }
      if (
        this.gameConfig.layout.down === false ||
        this.gameConfig.checkAnswer.down === false
      ) {
        this.downComponentsAnswer = true;
      }

      const ans = this.topComponentsAnswer && this.downComponentsAnswer;

      if (ans === true) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `正確`]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `錯誤`]);
        emitter.emit("checkAnswer");
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* Your component-specific styles go here */
.outter-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 10px;
  border: solid;
  max-height: 79vh;
}
.left-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $gap--small;
  max-height: 100%;
  overflow-y: auto;

  .text-area {
    flex-shrink: 0;
    padding: $gap--tiny;
    background-color: #dfdfdf;
    border-radius: $border-radius;
    font-size: $text-medium;
    white-space: pre-wrap;
  }
  .game-area {
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: $border-radius;
    background-color: #f0f0f0;

    &--top {
      flex-shrink: 0;
    }

    &--down {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
