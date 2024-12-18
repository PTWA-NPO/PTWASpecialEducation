<template>
  <div class="game">
    <div class="game__target-section">
      <h1 class="game__title">
        {{ GameData.title }}
      </h1>
      <draggable
        class="game__drop-area"
        :list="answerList"
        :group="dragGroup"
        item-key="dragItemId"
        @end="stopTrashMode"
      >
        <template #item="{ element }">
          <component
            :is="element.name"
            :ID="ID"
            :Data="element.Data"
            @touchstart="startTrashMode"
            @mousedown="startTrashMode"
          />
        </template>
      </draggable>
    </div>

    <div class="game__action-section">
      <div class="game__quation">
        <component :is="slotComponent" :Data="slotData" :ID="ID" />
      </div>

      <draggable
        v-show="!isTrashMode"
        :list="dragList"
        :group="dragGroupForClone"
        class="game__drag-area"
        item-key="dragItemId"
        :sort="false"
        @end="stopTrashMode"
      >
        <template #item="{ element }">
          <div>
            <!-- 這裡的div刪了就沒辦法將錢拖曳到drop-area -->
            <component :is="element.name" :Data="element.Data" />
          </div>
        </template>
      </draggable>
      <!-- eslint-disable vue/no-unused-vars -->
      <draggable
        v-show="isTrashMode"
        ref="deleteArea"
        :group="dragGroupForDelete"
        class="game__delete-area--trash-mode"
        item-key="dragItemId"
        @add="stopTrashMode"
      >
        <template #item="{ element }">
          <!-- Empty content for delete area -->
        </template>
      </draggable>

      <button class="game__submit-button" @click="handleSubmit">
        送出答案
      </button>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { getComponents } from "@/utilitys/get-components.js";
import { getSystemAssets } from "@/utilitys/get_assets.js";

export default {
  components: {
    draggable,
    TextOnly: getComponents("TextOnly"),
    ImageContainer: getComponents("ImageContainer"),
    MoneyDisplay: getComponents("MoneyDisplay"),
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
  emits: ["add-record", "play-effect", "next-question", "WrongSound"],
  data() {
    return {
      dragList: [],
      answerList: [],
      isTrashMode: false,
      slotComponent: "",
      slotData: null,
      dragGroup: { name: "money", pull: true, put: true },
      dragGroupForClone: { name: "money", pull: "clone", put: false },
      dragGroupForDelete: { name: "money", pull: false, put: true },
      trashBin: getSystemAssets("delete.png", "icon"),
    };
  },
  created() {
    this.init();
    this.slotComponent = this.GameData.upperComponent.Name;
    this.slotData = this.GameData.upperComponent.Data;
  },
  mounted() {
    this.$refs.deleteArea.$el.style.backgroundImage = `url(${this.GameConfig.trashBin})`;
  },
  methods: {
    init() {
      const componentName = "MoneyDisplay";
      let denominationAvailability = this.GameData.Items;
      let availableDenominations = Object.keys(denominationAvailability)
        .filter((key) => denominationAvailability[key] === "true")
        .map(Number);
      this.dragList = availableDenominations.map((item, index) => ({
        name: componentName,
        Data: { denomination: item },
        dragItemId: `denomination-${index}`,
      }));
    },
    handleSubmit() {
      const correctAnswer = this.GameData.amount;
      const userAnswer = this.sumMoney();
      let isAnswerRight = this.checkAnswer(correctAnswer, userAnswer);
      if (isAnswerRight) {
        this.$emit("next-question", true);
      } else {
        this.$emit("play-effect", "WrongSound");
      }
      this.addRecord(correctAnswer, userAnswer, isAnswerRight);
    },
    checkAnswer(correctAnswer, userAnswer) {
      return userAnswer === correctAnswer;
    },
    sumMoney() {
      return this.answerList.reduce(
        (total, item) => total + item.Data.denomination,
        0
      );
    },
    startTrashMode() {
      this.isTrashMode = true;
    },
    stopTrashMode() {
      this.isTrashMode = false;
    },
    addRecord(correctAnswer, userAnswer, isAnswerRight) {
      const result = isAnswerRight ? "正確" : "錯誤";
      this.$emit("add-record", [correctAnswer, userAnswer, result]);
    },
  },
};
</script>

<style scoped lang="scss">
.game-section {
  display: flex;
  flex-direction: column;
  gap: $gap--tiny;
}

.game {
  display: flex;
  justify-content: space-between;
  gap: $gap--small;
}

.game__target-section {
  @extend .game-section;
  width: 70%;
}

.game__action-section {
  @extend .game-section;
  width: 28%;
}

.game__target-section > *,
.game__action-section > * {
  border: $border--normal solid #000;
  border-radius: $border-radius;
}

.game__title {
  padding: 0.5rem;
  margin: 0;
  font-size: $text-large;
}

.game__drop-area {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(6, 9vh);
  gap: 0.5rem;
  padding: $padding--small;
}

.game__drag-area {
  height: 45vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 9vh);
  gap: 0.5rem;
  padding: $padding--small;
}

.game__quation {
  height: 20vh;
}

.game__delete-area--trash-mode {
  display: block;
  height: 45vh;
  padding: $padding--small;
  background-color: red;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 30%;
}

.game__submit-button {
  height: 2.5rem;
}
</style>
