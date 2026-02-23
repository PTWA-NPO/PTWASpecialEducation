<template>
  <div class="compare-game">
    <div class="compare-game__header">
      <p
        v-if="gameData.QuestionText && gameData.QuestionText !== ''"
        class="h1 compare-game__title"
      >
        {{ gameData.QuestionText }}
      </p>
      <p
        v-if="gameData.Description && gameData.Description !== ''"
        class="h2 compare-game__subtitle"
      >
        {{ gameData.Description }}
      </p>
    </div>
    <hr />
    <div class="compare-game__question-area">
      <div
        v-for="(item, index) in gameData.Datas"
        :key="index"
        class="compare-game__question-container"
      >
        <section class="compare-game__question-row">
          <div
            class="compare-game__card compare-game__card--left"
            :class="{
              'compare-game__card--wrong':
                isSubmitted && slotComponentAnswers[index][0] === false,
            }"
          >
            <component
              :is="item[0].Name"
              :component-config="item[0].Data"
              :game-id="gameId"
              @reply-answer="handleSlotComponentReply(index, 0, $event)"
            />
          </div>
          <div class="compare-game__symbol-wrapper">
            <draggable
              :list="userSymbolAnswer[index]"
              group="Symbols"
              :sort="false"
              item-key="name"
              class="compare-game__drop-zone"
              :class="{
                'compare-game__drop-zone--wrong':
                  isSubmitted && userAnswer[index] === false,
              }"
              @change="onDragChange(index)"
              @add="onDrop"
            >
              <template #item="{ element }">
                <div class="compare-game__symbol-card">
                  <p class="compare-game__symbol-text">
                    {{ element.Text }}
                  </p>
                </div>
              </template>
            </draggable>
          </div>
          <div
            class="compare-game__card compare-game__card--right"
            :class="{
              'compare-game__card--wrong':
                isSubmitted && slotComponentAnswers[index][1] === false,
            }"
          >
            <component
              :is="item[1].Name"
              :component-config="item[1].Data"
              :game-id="gameId"
              @reply-answer="handleSlotComponentReply(index, 1, $event)"
            />
          </div>
        </section>
      </div>
    </div>
    <section v-if="gameData.Answer" class="compare-game__footer">
      <div class="compare-game__options-container">
        <draggable
          :list="symbolList"
          :sort="false"
          item-key="name"
          :group="{ name: 'Symbols', pull: 'clone', put: false }"
          class="compare-game__options-list"
        >
          <template #item="{ element }">
            <div class="compare-game__option-item compare-game__symbol-card">
              <p class="compare-game__symbol-text">
                {{ element.Text }}
              </p>
            </div>
          </template>
        </draggable>
      </div>
    </section>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { defineAsyncComponent } from "vue";
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";

export default {
  name: "CompareGame",
  components: {
    draggable,
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    ImageWithText: defineAsyncComponent(
      () => import("@/components/ImageWithText.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    CoulorBarChart: getComponents("CoulorBarChart"),
    CircleChart: getComponents("CircleChart"),
    ImageTable: getComponents("ImageTable"),
    DrawImage: getComponents("DrawImage"),
    NumberBoard: getComponents("NumberBoard"),
    FractionDisplay: getComponents("FractionDisplay"),
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
      isSubmitted: false,
      selectedGroup: 0,
      userAnswer: [],
      userSymbolAnswer: [],
      slotComponentAnswers: [],
      symbolList: [
        {
          tag: "greater",
          Text: ">",
        },
        {
          tag: "less",
          Text: "<",
        },
        {
          tag: "equal",
          Text: "=",
        },
      ],
    };
  },
  created() {
    if (!this.gameData.Answer) {
      this.userSymbolAnswer = this.gameData.showSymbol.map((item) => {
        return [
          {
            tag: item,
            Text: item === "greater" ? ">" : item === "less" ? "<" : "=",
          },
        ];
      });
    }
    this.gameData.Datas.forEach((item) => {
      this.userAnswer.push(null);
      if (this.gameData.Answer) {
        this.userSymbolAnswer.push([]);
      }
      this.slotComponentAnswers.push(item.map((subItem) => !subItem.verify));
    });
    emitter.on("submitAnswer", this.submitAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitAnswer);
  },
  methods: {
    onDragChange(index) {
      this.selectedGroup = index;
    },
    onDrop(newVal) {
      this.isSubmitted = false;
      const tmp = this.userSymbolAnswer[this.selectedGroup][newVal.newIndex];
      this.userSymbolAnswer[this.selectedGroup] = [tmp];
      this.checkAnswerRealTime();
      if (this.gameConfig.CheckAnswerMode !== "OnFill") {
        this.userAnswer[this.selectedGroup] = null;
      }
    },
    checkAnswerRealTime() {
      if (this.gameConfig.CheckAnswerMode === "OnFill") {
        this.isSubmitted = true;
        if (
          this.checkSymbolMatch(
            this.gameData.Answer[this.selectedGroup],
            this.userSymbolAnswer[this.selectedGroup][0].tag
          )
        ) {
          this.$emit("play-effect", "CorrectSound");
          this.userAnswer[this.selectedGroup] = true;
        } else {
          this.userAnswer[this.selectedGroup] = false;
          this.$emit("play-effect", "WrongSound");
        }
        if (this.checkAllAnswered()) {
          // this.$emit('next-question');
        }
      }
    },
    checkAllAnswered() {
      for (const i in this.userAnswer) {
        if (this.userAnswer[i] === false || this.userAnswer[i] === null) {
          return false;
        }
      }
      return true;
    },
    submitAnswer() {
      this.isSubmitted = true;
      let check = true;
      if (this.gameData.Answer) {
        this.gameData.Answer.forEach((correctAnswer, i) => {
          // 檢查使用者是否有作答，避免 Crash
          const userAnsObj = this.userSymbolAnswer[i]?.[0];

          if (
            userAnsObj &&
            this.checkSymbolMatch(correctAnswer, userAnsObj.tag)
          ) {
            this.userAnswer[i] = true;
          } else {
            this.userAnswer[i] = false;
            check = false;
          }
        });
      }
      if (
        this.gameData.SlotComponentVerifycation &&
        !this.slotComponentAnswers.flat().every(Boolean)
      ) {
        check = false;
      }

      if (check === false) {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.Answer ? this.gameData.Answer[0] : "",
          this.userSymbolAnswer[0][0].tag,
          "錯誤",
        ]);
      } else {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.gameData.Answer ? this.gameData.Answer[0] : "",
          this.userSymbolAnswer[0][0].tag,
          "正確",
        ]);
        this.$emit("next-question");
      }
    },
    handleSlotComponentReply(rowIndex, colIndex, answer) {
      this.isSubmitted = false;
      this.slotComponentAnswers[rowIndex][colIndex] = answer;
    },
    checkSymbolMatch(answer, userTag) {
      if (!userTag) return false;
      const greater = ["Big", "more", "greater", ">"];
      const less = ["Small", "less", "<"];
      const equal = ["Equal", "equal", "="];

      if (greater.includes(answer) && greater.includes(userTag)) return true;
      if (less.includes(answer) && less.includes(userTag)) return true;
      if (equal.includes(answer) && equal.includes(userTag)) return true;

      return false;
    },
  },
};
</script>

<style scoped lang="scss">
.compare-game {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  &__header {
    width: 100%;
    padding-left: 2rem;
  }

  &__title {
    font-size: 2rem;
  }

  &__subtitle {
    font-size: 1.5rem;
  }

  &__question-area {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  &__question-container {
    flex: 1;
    max-height: 300px;
  }

  &__question-row {
    display: grid;
    grid-template-columns: 0.5fr 4fr 1fr 4fr 0.5fr;
    height: 100%;
  }

  &__card {
    border: solid 3px #aaa;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;

    component {
      width: 100%;
      height: 100%;
    }

    &--left {
      grid-column: 2/3;
    }

    &--right {
      grid-column: 4/5;
    }
    &--wrong {
      border: solid 5px #cc0627;
    }
  }

  &__symbol-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__drop-zone {
    grid-column: 3/4;
    margin: 2em;
    width: 7rem;
    height: 5rem;
    border: solid 3px #aaa;
    border-radius: 12px;
    border-color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1rem;
    &--wrong {
      background-color: #cc0627c6;
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 0 2rem;
    gap: 2rem;
  }

  &__options-container {
    width: 60%;
    margin: 0 2rem;
  }

  &__options-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }

  &__option-item {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    border: 3px solid #aaa;
    border-radius: 12px;
    background-color: #fff;
  }

  &__symbol-card {
    cursor: pointer;
    width: 5rem;
    text-align: center;
  }
  &__symbol-text {
    margin: 0;
    padding: 0;
    font-size: 3rem;
  }
}

:deep(.number-board-container) {
  height: 70%;
  width: 90%;
  font-size: 1.2rem;
}
</style>
