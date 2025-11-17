<template>
  <div class="custom-container">
    <div class="custom-container__header">
      <p class="custom-container__question">
        {{ questionText }}
      </p>
      <!-- <button
        type="button"
        class="custom-container__submit-btn"
        @click="checkAnswer()"
      >
        送出答案
      </button> -->
    </div>
    <div class="custom-container__answer-area answer-area">
      <div class="answer-area__drag">
        <p class="answer-area__title">{{ gameData.InitBox }}</p>
        <draggable
          :list="draggableItems"
          item-key="Tag"
          :sort="false"
          group="SelectItem"
          class="answer-area__drag--list"
        >
          <template #item="{ element }">
            <div class="answer-area__drag--item">
              <component
                :is="element['Name']"
                :component-config="element['Data']"
                :game-id="gameId"
              />
            </div>
          </template>
        </draggable>
      </div>
      <div class="answer-area__drop">
        <div
          v-for="(items, index) in gameData.Answer"
          :key="index"
          class="drop-area__container"
        >
          <p class="answer-area__title">{{ items.GroupName }}</p>
          <draggable
            :list="groupedItems[index]"
            item-key="Tag"
            :sort="false"
            group="SelectItem"
            class="drop-area__list"
          >
            <template #item="{ element }">
              <div
                class="drop-area__item"
                :class="{
                  'incorrect-item': incorrectItems.includes(element.Tag),
                }"
              >
                <component
                  :is="element['Name']"
                  :component-config="element['Data']"
                  :game-id="gameId"
                />
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import CardWithButton from "@/components/CardWithButton.vue";
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "ClassifyGame",
  components: {
    draggable,
    CardWithButton,
    TextOnly: getComponents("TextOnly"),
    ImageContainer: getComponents("ImageContainer"),
    AnalogClock: getComponents("AnalogClock"),
    Water: getComponents("Water"),
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
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      questionText: this.gameData.Text,
      groupedItems: this.gameData.Answer.map(() => []),
      draggableItems: [],
      incorrectItems: [],
    };
  },
  watch: {
    gameData: {
      handler() {
        this.initializeItems();
      },
      deep: true,
    },
  },
  created() {
    this.initializeItems();
    emitter.on("submitAnswer", this.checkAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.checkAnswer);
  },
  methods: {
    initializeItems() {
      this.draggableItems = [...this.gameData.Question];
      this.groupedItems = this.gameData.Answer.map(() => []);
    },
    checkAnswer() {
      for (const groupIndex in this.groupedItems) {
        if (!this.isGroupSizeCorrect(groupIndex)) {
          this.handleIncorrectAnswer(groupIndex);
          return;
        }

        if (!this.isGroupContentCorrect(groupIndex)) {
          this.handleIncorrectAnswer(groupIndex);
          return;
        }
      }
      this.handleCorrectAnswer();
      this.$emit("next-question");
    },

    isGroupSizeCorrect(index) {
      return (
        this.groupedItems[index].length ===
        this.gameData.Answer[index].Items.length
      );
    },

    handleIncorrectAnswer(index) {
      this.$emit("play-effect", "WrongSound");

      // 找出所有群組中的錯誤項目
      const allIncorrectItems = [];
      this.groupedItems.forEach((group, groupIndex) => {
        const incorrectItems = group.filter(
          (item) => !this.gameData.Answer[groupIndex].Items.includes(item.Tag)
        );
        allIncorrectItems.push(...incorrectItems.map((item) => item.Tag));
      });
      this.incorrectItems = allIncorrectItems;

      this.$emit("add-record", [
        this.groupedItems[index],
        this.gameData.Answer[index].Items,
        "錯誤",
      ]);
    },

    handleCorrectAnswer() {
      this.incorrectItems = [];
      this.$emit("add-record", [
        this.groupedItems,
        this.gameData.Answer,
        "正確",
      ]);
      this.$emit("play-effect", "CorrectSound");
    },
    isGroupContentCorrect(groupIndex) {
      const correctItems = this.gameData.Answer[groupIndex].Items;
      return this.groupedItems[groupIndex].every((item) =>
        correctItems.includes(item.Tag)
      );
    },
  },
};
</script>
<style scoped lang="scss">
.custom-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: start;
  width: 100%;
  height: 100%;
  &__header {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    width: 100%;
  }
  &__answer-area {
    display: flex;
    gap: 1rem;
    width: 100%;
    height: 65vh;
  }

  &__question {
    flex: 3;
    border: solid 1px #aaa;
    border-radius: 15px;
    padding: 0.5rem;
    align-self: stretch;
    font-size: 2rem;
    margin: 0;
  }
  &__submit-btn {
    flex: 1;
    height: 100%;
    border: none;
    background-color: $submit-color;
    align-self: flex-end;
    width: 10rem;
  }
}

.answer-area {
  &__drag {
    flex: 1;
    border: solid 1px;
    border-radius: 15px;
    padding: 1rem;

    &--list {
      @extend .drag-section;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, 1fr);
      border: solid 3px red;
    }

    &--item {
      cursor: pointer;
    }
  }

  &__title {
    font-size: 2rem;
    margin: 0;
  }

  &__drop {
    flex: 3;
    border: solid 1px;
    border-radius: 15px;
    display: flex;
    flex-direction: row;
    padding: 1rem;
    gap: 1rem;

    .drop-area__container {
      flex: 1;

      .drop-area__list {
        @extend .drag-section;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(6, 1fr);
        border: solid 3px blue;
      }
    }
  }

  .drag-section {
    height: 90%;
    padding: 0.5rem;
    display: grid;
    border-radius: 15px;
    gap: 0.5rem;

    .drop-area__item {
      cursor: pointer;
      display: flex;
      justify-content: center;
      transition: border-color 0.3s ease;

      &.incorrect-item {
        border: 3px solid red;
        border-radius: 10px;
        padding: 0.5rem;
      }
    }
  }
}
</style>
