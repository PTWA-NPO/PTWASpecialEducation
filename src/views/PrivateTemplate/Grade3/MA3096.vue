<template>
  <div class="compare-game">
    <div class="compare-game__header">
      <p
        v-if="gameData.QuestionText && gameData.QuestionText != ''"
        class="compare-game__title h1"
      >
        {{ gameData.QuestionText }}
      </p>
      <p
        v-if="gameData.Description && gameData.Description != ''"
        class="compare-game__subtitle h2"
      >
        {{ gameData.Description }}
      </p>
    </div>
    <div class="compare-game__question-area">
      <!-- 第一行：上面兩個元件 -->
      <component
        :is="gameData.Datas[0].Name"
        class="compare-game__card"
        :class="{
          'compare-game__card--wrong': answered[0] === false,
          'compare-game__card--correct': answered[0] === true,
        }"
        :Data="gameData.Datas[0].Data"
        :ID="id"
        @reply-answer="handleSlotComponentReply(0, $event)"
      />

      <div class="compare-game__symbol-container"></div>

      <component
        :is="gameData.Datas[1].Name"
        class="compare-game__card"
        :class="{
          'compare-game__card--wrong': answered[1] === false,
          'compare-game__card--correct': answered[1] === true,
        }"
        :Data="gameData.Datas[1].Data"
        :ID="id"
        @reply-answer="handleSlotComponentReply(1, $event)"
      />

      <div
        class="compare-game__card"
        :class="{
          'compare-game__card--wrong': answered[2] === false,
          'compare-game__card--correct': answered[2] === true,
        }"
      >
        <component
          :is="gameData.Datas[2].Name"
          :Data="gameData.Datas[2].Data"
          :ID="id"
        />
        <p class="compare-game__card--suffix">{{ gameData.Datas[2].Suffix }}</p>
      </div>

      <div class="compare-game__symbol-container">
        <draggable
          :list="userAnswer"
          group="Symbols"
          :sort="false"
          item-key="name"
          class="compare-game__symbol"
        >
          <template #item="{ element }">
            <div class="compare-game__option clickable">
              <p class="h1">{{ element.Text }}</p>
            </div>
          </template>
        </draggable>
      </div>

      <div
        class="compare-game__card"
        :class="{
          'compare-game__card--wrong': answered[3] === false,
          'compare-game__card--correct': answered[3] === true,
        }"
      >
        <component
          :is="gameData.Datas[3].Name"
          :Data="gameData.Datas[3].Data"
          :ID="id"
        />
        <p class="compare-game__card--suffix">{{ gameData.Datas[3].Suffix }}</p>
      </div>
    </div>
    <section class="compare-game__option-bar">
      <div class="compare-game__option-container">
        <draggable
          :list="symbols"
          :sort="false"
          item-key="name"
          :group="{ name: 'Symbols', pull: 'clone', put: false }"
          class="compare-game__options"
        >
          <template #item="{ element }">
            <div class="compare-game__option-item clickable">
              <p class="h1">
                {{ element.Text }}
              </p>
            </div>
          </template>
        </draggable>
      </div>
      <button class="compare-game__check-button" @click="checkAllAnswers">
        檢查答案
      </button>
    </section>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { defineAsyncComponent } from "vue";
export default {
  name: "CompareGame",
  components: {
    draggable,
    FractionDisplay: defineAsyncComponent(
      () => import("@/components/FractionDisplay.vue")
    ),
    FillImages: defineAsyncComponent(
      () => import("@/components/FillImages.vue")
    ),
    InteractiveFractionVisual: defineAsyncComponent(
      () => import("@/components/InteractiveFractionVisual.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
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
      selectedGroup: 0,
      totalQuestions: null,
      answered: [],
      userAnswer: [],
      imageDatas: [],
      symbols: [],
      slotComponentAnswers: ["", ""], // Two SubComponents
      compareSymbols: [
        {
          tag: "Big",
          Text: ">",
        },
        {
          tag: "Small",
          Text: "<",
        },
        {
          tag: "Equal",
          Text: "=",
        },
      ],
    };
  },
  computed: {
    gameData() {
      return this.GameData;
    },
    gameConfig() {
      return this.GameConfig;
    },
    id() {
      return this.ID;
    },
  },
  created() {
    this.initializeGame();
  },
  methods: {
    initializeGame() {
      this.symbols = this.compareSymbols;
    },
    checkAllAnswers() {
      let allCorrect = true;
      const userAnswer = this.userAnswer[0]?.tag;
      const correctAnswer = this.gameData.Answer;
      console.log(correctAnswer, userAnswer);
      if (correctAnswer !== userAnswer) {
        allCorrect = false;
        console.log("錯誤");
      }

      if (!this.slotComponentAnswers.every((answer) => answer === true)) {
        allCorrect = false;
      }

      if (!allCorrect) {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援", "不支援", "錯誤"]);
      } else {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援", "不支援", "正確"]);
        this.$emit("next-question");
      }
    },
    clearAllData() {
      for (let i = 0; i < 2; i++) {
        this.answers[i] = [];
        this.answered[i] = null;
      }
      this.slotComponentAnswers = ["", ""];
    },
    handleSlotComponentReply(index, answer) {
      this.slotComponentAnswers[index] = answer;
    },
  },
};
</script>

<style scoped lang="scss">
.compare-game {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $gap--small;
  width: 100%;
  max-height: 100%;
  max-width: 100%;

  &__header {
    flex: 1;
    width: 100%;
    padding-left: $gap--small;
  }

  &__title {
    font-size: 2rem;
  }

  &__subtitle {
    font-size: 1.5rem;
    margin: 0;
  }

  &__question-area {
    width: 100%;
    height: 70%;
    max-height: 70%;
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    grid-template-rows: 2fr 1fr;
    gap: $gap--small;
    padding: $gap--small;
    overflow: hidden;
  }

  &__card {
    width: 100%;
    height: 100%;
    border: solid 3px #aaa;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $gap--small;
    padding: 1rem;
    box-sizing: border-box;
    overflow: hidden;

    &--wrong {
      background-color: #cc0627c6;
    }

    &--correct {
      background-color: rgba(255, 255, 255, 1);
    }

    &--suffix {
      font-size: 1.5rem;
      white-space: nowrap;
    }
  }

  &__symbol-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__symbol {
    width: 7rem;
    height: 5rem;
    border: solid 3px #aaa;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  &__option {
    background-color: #fff;
  }

  &__option-bar {
    flex: 1;
    width: 100%;
    height: 10%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 0 2rem;
    gap: 2rem;
  }

  &__option-container {
    width: 60%;
    margin: 0 2rem;
  }

  &__options {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: $gap--small;
  }

  &__option-item {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  &__check-button {
    padding: 1rem;
    width: 40%;
    background-color: #3a86ff;
    border: none;
    border-radius: 12px;
    font-size: x-large;
  }
}

.clickable {
  cursor: pointer;
  border: solid 2px #aaa;
  border-radius: 12px;
  width: 5rem;
  text-align: center;
}

:deep(.number-board-container) {
  height: 70%;
  width: 90%;
  font-size: 1.2rem;
}
</style>
