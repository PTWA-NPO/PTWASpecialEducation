<template>
  <div class="outter-container">
    <!-- <div class="container-top"> -->
    <div class="container-title title">
      <p class="title__text">
        {{ gameData.Title }}
      </p>
    </div>
    <!-- <draggable
            class="drag-container"
            :group="{ name: 'items', pull: ()=> true, put: false }"
        ></draggable>
    </div> -->
    <div class="game-index">
      <div class="box-tar">
        <draggable
          class="drag-container box"
          :list="tarList"
          item-key="ID"
          group="items"
        >
          <template #item="{ element }">
            <component
              :is="element.Name"
              :component-config="element.Data"
              :game-id="gameId"
              class="list-group-item"
              @click="deleteItem(index)"
            />
          </template>
        </draggable>
      </div>
      <div class="box-source">
        <div class="box question">
          <p v-for="(question, index) in gameData.Questions" :key="index">
            {{ question }}
          </p>
        </div>
        <div class="source box">
          <draggable
            :key="sourceList.key"
            class="item-container"
            :list="sourceList"
            :group="{ name: 'items', pull: 'clone', put: true }"
            :sort="false"
            item-key="ID"
            @change="init"
          >
            <template #item="{ element }">
              <component
                :is="element.Name"
                :component-config="element.Data"
                :game-id="gameId"
                class="list-group-item"
              />
            </template>
          </draggable>
        </div>
        <button class="button-basic tool-container" @click="checkAnswer()">
          檢查答案
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import ImageContainer from "@/components/ImageContainer.vue";
export default {
  name: "CopyItem",
  components: {
    draggable,
    ImageContainer,
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
  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      // Your data properties go here
      // id: 'Dev0105',
      // gameData: {
      //     Title: "123456",
      //     Questions: [
      //         "請放入五個糖果"
      //     ],
      //     Items: [{
      //         Name: "ImageContainer",
      //         Amount: 3,
      //         Data: {
      //             Src: "sugar.png",
      //             Alt: "糖果照片",
      //         }
      //     },{
      //         Name: "ImageContainer",
      //         Amount: 3,
      //         Data: {
      //             Src: "apple.png",
      //             Alt: "糖果照片",
      //         }
      //     }]
      // },
      tarList: [],
      sourceList: [],
    };
  },
  created() {
    // Code to run when the component is created goes here
    this.init();
  },
  mounted() {
    // Code to run when the component is mounted goes here
  },
  methods: {
    // Your methods go here
    init() {
      this.sourceList = [];
      for (const i in this.gameData.Items) {
        const item = this.gameData.Items[i];
        this.sourceList.push({
          Name: item.Name,
          Data: item.Data,
          ID: this.gameId,
          item: i,
        });
      }
    },
    deleteItem(item) {
      this.tarList = this.tarList.filter((element) => {
        return element.ID !== item.ID;
      });
    },
    checkAnswer() {
      const stack = {};
      let isTrue = true;
      for (const i in this.tarList) {
        if (stack[this.tarList[i].item] === undefined) {
          stack[this.tarList[i].item] = 1;
        } else {
          stack[this.tarList[i].item] += 1;
        }
      }
      for (const i in this.gameData.Items) {
        if (
          stack[i] === undefined ||
          stack[i] !== this.gameData.Items[i].Amount
        ) {
          isTrue = false;
        }
      }
      if (isTrue) {
        this.$emit("next-question");
        this.$emit("play-effect", "CorrectSound");
      } else {
        this.$emit("play-effect", "WrongSound");
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* Your component-specific styles go here */
.outter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 78vh;
  .title {
    background-color: $info-color;
  }
  .game-index {
    height: 100%;
    display: flex;
    gap: 1rem;
    .box-tar {
      flex: 2;
      gap: 1rem;
      height: 60vh;
    }
    .box-source {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      .question {
        flex: 2;
        border: $border--normal solid #000;
        padding: $padding--small;
        font-size: $text-small;
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        p {
          font-size: $text-medium;
        }
      }
      .source {
        flex: 3;
        max-height: 30vh;
        border: $border--normal solid #000;
        padding: 1rem;
        .item-container {
          padding: $padding--small;
          display: flex;
          flex-direction: row;
          justify-content: center;
          gap: 1rem;
          height: 100%;
          width: 100%;
        }
      }
      .tool-container {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        padding: $padding--small;
        font-size: $text-medium;
        background-color: $submit-color;
      }
      .tool-container:hover {
        scale: 1.05;
        transition: 0.5s;
      }
    }
  }
  .drag-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 9vh);
    gap: 1rem;
    padding: $padding--small;
    width: 100%;
    height: 100%;
  }
}
.box {
  @extend .container-basic;
}
</style>
