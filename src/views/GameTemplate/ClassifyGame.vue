<template>
  <div class="custom-container">
    <div class="custom-container__header">
      <p class="custom-container__question">
        {{ questionText }}
      </p>
      <button
        type="button"
        class="custom-container__submit-btn"
        @click="checkAnswer()"
      >
        送出答案
      </button>
    </div>
    <div class="custom-container__answer-area answer-area">
      <div class="answer-area__drag">
        <p class="answer-area__title">{{ GameData.InitBox }}</p>
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
                :Data="element['Data']"
                :ID="ID"
              />
            </div>
          </template>
        </draggable>
      </div>
      <div class="answer-area__drop">
        <div
          v-for="(items, index) in GameData.Answer"
          class="drop-area__container"
        >
          <p class="drop-area__title">{{ items.GroupName }}</p>
          <draggable
            :list="groupedItems[index]"
            item-key="Tag"
            :sort="false"
            group="SelectItem"
            class="drop-area__list"
          >
            <template #item="{ element }">
              <div class="drop-area__item">
                <component
                  :is="element['Name']"
                  :Data="element['Data']"
                  :ID="ID"
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
import { getComponents } from "@/utilitys/get_components";
export default {
  name: "ClassifyGame",
  components: {
    draggable,
    CardWithButton,
    TextOnly: getComponents("TextOnly"),
    ImageContainer: getComponents("ImageContainer"),
    Clock: getComponents("Clock"),
    Water: getComponents("Water"),
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
      questionText: this.GameData.Text,
      GroupID: 0,
      groupedItems: this.GameData.Answer.map(() => []),
      draggableItems: this.GameData.Question,
    };
  },
  created() {},
  methods: {
    checkAnswer() {
      for (let groupIndex in this.groupedItems) {
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
        this.GameData.Answer[index].Items.length
      );
    },

    countCorrectItems(index) {
      return this.groupedItems[index].reduce((matchingItemCount, item) => {
        return this.GameData.Answer[index].Items.includes(item.Tag)
          ? matchingItemCount + 1
          : matchingItemCount;
      }, 0);
    },

    handleIncorrectAnswer(index) {
      this.$emit("play-effect", "WrongSound");

      this.$emit("add-record", [
        this.groupedItems[index],
        this.GameData.Answer[index].Items,
        "錯誤",
      ]);
    },

    handleCorrectAnswer() {
      this.$emit("add-record", [
        this.groupedItems,
        this.GameData.Answer,
        "正確",
      ]);
      this.$emit("play-effect", "CorrectSound");
    },
    isGroupContentCorrect(groupIndex) {
      const correctItems = this.GameData.Answer[groupIndex].Items;
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
  &--title {
    font-size: 2rem;
    margin: 0;
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
    background-color: #faf3ed;
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
    }
  }
}
</style>
