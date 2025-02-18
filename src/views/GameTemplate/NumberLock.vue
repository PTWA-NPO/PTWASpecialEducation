<template>
  <div class="outter-container">
    <div class="left-column">
      <div v-if="GameConfig.layout.top" class="game-area--top game-area">
        <component
          :is="GameData.topComponent.Name"
          :Data="GameData.topComponent.Data"
          :ID="ID"
          @replyAnswer="topReply"
        ></component>
      </div>
      <div v-if="GameConfig.layout.down" class="game-area--down game-area">
        <component
          :is="GameData.downComponent.Name"
          :Data="GameData.downComponent.Data"
          :ID="ID"
          @replyAnswer="downReply"
        ></component>
      </div>
    </div>
    <div class="right-column">
      <div v-if="ShowPad && GameConfig.layout.pad" class="number-pad">
        <VirtualNumPad
          @virtualpadinputInput="Input"
          @virtualpadinputDelete="Delete"
          @virtualpadinput-pop="Pop"
        />
      </div>
      <button class="button--submit" @click="CheckAnswer">檢查答案</button>
    </div>
    {{ NowSelect }}
  </div>
</template>

<script>
import VirtualNumPad from "@/components/VirtualNumPadInput.vue";
import { defineAsyncComponent } from "vue";
import { getSlotComponentAssets } from "@/utilitys/get_assets.js";
export default {
  name: "NumberLock",
  components: {
    VirtualNumPad,
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    Fractions: defineAsyncComponent(() => import("@/components/Fractions.vue")),
    Markdown: defineAsyncComponent(() => import("@/components/Markdown.vue")),
    NumberLine: defineAsyncComponent(() =>
      import("@/components/NumberLine.vue")
    ),
    NumberLineWithBlank: defineAsyncComponent(() =>
      import("@/components/NumberLineWithBlank.vue")
    ),
    DragOnNumberLine: defineAsyncComponent(() =>
      import("@/components/DragOnNumberLine.vue")
    ),
    ImageContainer: defineAsyncComponent(() =>
      import("@/components/ImageContainer.vue")
    ),
    InteractiveFractionVisual: defineAsyncComponent(() =>
      import("@/components/InteractiveFractionVisual.vue")
    ),
    NumberIncrementor: defineAsyncComponent(() =>
      import("@/components/NumberIncrementor.vue")
    ),
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
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      NowSelect: null,
      ShowPad: false,
      topComponentsAnswer: false,
      downComponentsAnswer: false,
      // GameData: {
      //   topComponent: {
      //     Name: "TextOnly",
      //     Data: {
      //       Text: "Hello",
      //     },
      //   },
      //   NumberPadAutoDisappear: false,
      //   downComponent: {
      //     Name: "Markdown",
      //     Data: {
      //       Render: `
      //                       > 123432
      //                       # Header 1
      //                       ## Header 2
      //                       ### Header 3
      //                       **Bold Text**
      //                       - List 1
      //                       $i$ $i$ Input Box
      //                       $i$ Input Box
      //                       $t$ tab
      //                       $s$ space
      //                       $n$ new line
      //                   `,
      //       Answers: ["1", "2", "3"],
      //     },
      //   },
      // },
      // GameConfig: {
      //   NumberPadAutoDisappear: false,
      //   layout: {
      //     top: true,
      //     down: true,
      //     pad: false,
      //   },
      //   checkAnswer: {
      //     top: false,
      //     down: true,
      //   },
      // },
      // GameData: {
      //   topComponent: {
      //     Name: "TextOnly",
      //     Data: {
      //       Text: "有一隻小鴨停在數線1的位置。小鴨向右移動6格，會停在哪一個數字上呢?",
      //     },
      //   },
      //   NumberPadAutoDisappear: false,
      //   downComponent: {
      //     Name: "DragOnNumberLine",
      //     Data: {
      //       spacing: 1,
      //       max: 15,
      //       min: 0,
      //       init_pos: 1,
      //       image: "S_1.png",
      //       finalPosition: 7,
      //     },
      //   },
      // },
    };
  },
  computed: {
    Arrow() {
      return getSlotComponentAssets("NumberLineV2", "ArrowRight.svg"); //FIXME
    },
  },
  created() {
    let NewArr = [];
    let cnt = 0;
    for (var i in this.GameData.Data) {
      NewArr.push(this.GameData.Data[i]);
      // Initial the ComponentAnswer
      if (this.GameData.Data[i].Blank == true) {
        this.ComponentsAnswers[cnt] = false;
      }
      cnt++;
      if (i != this.GameData.Data.length - 1) {
        NewArr.push({
          Arrow: true,
        });
        cnt++;
      }
    }
    this.FinalData = NewArr;
  },
  mounted() {
    if (this.GameConfig.NumberPadAutoDisappear == false) {
      this.SlidAnimation("in");
      this.ShowPad = true;
    }
    document.addEventListener("click", this.NowClick);
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
      if (this.GameConfig.layout.pad == false) return;
      if (document.activeElement.tagName == "INPUT") {
        this.SlidAnimation("in");
        this.ShowPad = true;
        this.NowSelect = document.activeElement;
      } else if (document.activeElement.tagName == "BUTTON") {
        this.NowSelect.focus();
        this.ShowPad = true;
      } else {
        if (this.GameConfig.NumberPadAutoDisappear != false) {
          this.ShowPad = false;
          this.SlidAnimation("out");
        }
      }
    },
    SlidAnimation(action) {
      if (this.GameConfig.layout.pad == false) return;
      if (this.GameConfig.NumberPadAutoDisappear != false) {
        let OutterContainer =
          document.getElementsByClassName("OutterContainer")[0];
        let GameWindows = document.getElementsByClassName("GameWindows")[0];
        if (action == "in") {
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
        this.GameConfig.layout.top == false ||
        this.GameConfig.checkAnswer.top == false
      ) {
        this.topComponentsAnswer = true;
      }
      if (
        this.GameConfig.layout.down == false ||
        this.GameConfig.checkAnswer.down == false
      ) {
        this.downComponentsAnswer = true;
      }

      let ans = this.topComponentsAnswer && this.downComponentsAnswer;
      console.log(ans);

      if (ans == true) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `正確`]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `錯誤`]);
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* Your component-specific styles go here */
.outter-container {
  width: 100%;
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  border: solid;
  max-height: 80vh;
}
.left-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $gap--small;
  .game-area {
    max-height: 40vh;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: $border-radius;
    background-color: #f0f0f0;
  }
}
.right-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $gap--small;
  background-color: $primary-color;
  border-radius: $border-radius;
  padding: $gap--small;
  .number-pad {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .button--submit {
    width: 100%;
    height: 100%;
    min-height: 50px;
    border-radius: $border-radius;
    border: none;
    font-size: $text-medium;
    &:hover {
      transition: 0.3s;
      transform: scale(1.05);
    }
  }
}
</style>
