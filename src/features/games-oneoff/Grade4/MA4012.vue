<template>
  <div class="ma4012-layout">
    <!-- 左側面板 -->
    <div class="left-panel">
      <!-- 左上：數字板 -->
      <div class="top-left-box box-with-border">
        <NumberBoard :component-config="numberBoardConfig" />
      </div>

      <!-- 左下：音檔與提示 -->
      <div class="bottom-left-box box-with-border">
        <div class="sound-icon-wrapper" @click="playSound">
          <svg
            class="sound-icon"
            viewBox="0 0 24 24"
            width="32"
            height="32"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path fill="currentColor" d="M11 5L6 9H2v6h4l5 4V5z"></path>

            <path
              d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
            ></path>
          </svg>
        </div>
        <div class="hint-box">
          <span>點擊會出現正確讀音。</span>
        </div>
      </div>
    </div>

    <!-- 中間箭頭 -->
    <div class="arrow-section">
      <span class="arrow-icon">➔</span>
    </div>

    <!-- 右側面板 -->
    <div class="right-panel">
      <!-- 右側：拖曳填空板 -->
      <div class="right-box box-with-border">
        <DraggableNumberBoard
          :component-config="threeRowConfig"
          @reply-answer="handleAnswer"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NumberBoard from "@/components/NumberBoard.vue";
import DraggableNumberBoard from "@/components/DraggableNumberBoard.vue";
import { ReadText } from "@/lib/readtext.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "MA4012",
  components: {
    NumberBoard,
    DraggableNumberBoard,
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
  },
  emits: ["play-effect", "next-question"],
  data() {
    return {
      numberBoardConfig: this.gameData.numberBoardConfig,
      threeRowConfig: this.gameData.threeRowConfig,
      componentsReplyAnswer: false,
    };
  },
  created() {
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    playSound() {
      ReadText(this.gameData.numberBoardConfig.Number);
    },
    handleAnswer(isCorrect) {
      this.componentsReplyAnswer = isCorrect;
    },
    checkAnswer() {
      if (this.componentsReplyAnswer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.ma4012-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 100%;
  height: 100%;
  padding: 40px;
  box-sizing: border-box;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 320px;
}

/*.box-with-border {
  background-color: #fff;
  border: 3px solid #1a365d;
  border-radius: 4px;
}*/

.top-left-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 20px;
}

.bottom-left-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  min-height: 150px;
  padding: 30px;
}

.sound-icon-wrapper {
  background-color: #fcd34d; /* 黃色 */
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 2px solid #333;
  transition: transform 0.1s;
  flex-shrink: 0;

  &:active {
    transform: scale(0.95);
  }

  .sound-icon {
    color: #333;
    margin-right: -4px;
  }
}

.hint-box {
  border: 2px solid #333;
  padding: 10px 15px;
  color: #e68d37;
  font-weight: bold;
  font-size: 1.1rem;
}

.arrow-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 4rem;
  color: #f59e0b; /* 橘黃色箭頭 */
  font-weight: bold;
  line-height: 1;
}

.right-panel {
  flex: 1;
  max-width: 650px;
}

.right-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 370px;
  padding: 40px;
}
</style>
