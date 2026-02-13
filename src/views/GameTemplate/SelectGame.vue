<template>
  <div class="outter-container">
    <div class="head-container">
      <p style="font-weight: bold">
        {{ gameConfig.GlobalTitle }}
      </p>
    </div>
    <div class="down-container">
      <div
        v-if="gameData.SlotComponents !== undefined"
        class="component-container"
      >
        <component
          :is="SlotComponent"
          :game-id="gameId"
          :component-config="SlotData"
        />
      </div>
      <div
        v-if="gameData.SlotComponents !== undefined"
        class="container__right"
      >
        <div class="info__card">
          <p>{{ gameData.Question_Text }}</p>
        </div>
        <div class="select-button__group">
          <button
            v-for="i in question"
            :key="i"
            type="button"
            :class="{ 'button--onclick': Select[i] }"
            @click="SelectItem(i)"
          >
            {{ i }}
          </button>
        </div>
      </div>
      <div v-else class="container__buttom">
        <div class="info__card">
          <p class="h2">
            {{ gameData.Question_Text }}
          </p>
        </div>
        <div class="right--container">
          <div class="select-button__group">
            <button
              v-for="i in question"
              :key="i"
              type="button"
              :class="{ 'button--onclick': Select[i] }"
              @click="SelectItem(i)"
            >
              {{ i }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import { getComponents } from "@/utilitys/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/utilitys/mitt.js";
export default {
  name: "SelectGame",
  components: {
    ImageContainer: getComponents("ImageContainer"),
    DragImages: getComponents("DragImages"),
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
      imageUrl: "",
      question: [],
      SlotComponent: null,
      Answer: null,
      Select: [],
    };
  },
  created() {
    for (const i in this.gameData.Question) {
      this.question.push(this.gameData.Question[i]);
      this.Select.push(false);
    }
    this.imageUrl = getGameAssets(this.gameId, this.gameData.img);
    if (this.gameData.SlotComponents !== undefined) {
      const SlotComponentData = this.gameData.SlotComponents[0];
      this.SlotData = SlotComponentData.Data;
      this.SlotComponent = SlotComponentData.Name;
    }
    console.log(this.imageUrl);
    emitter.on("submitAnswer", this.CheckAnswer);
  },
  mounted() {
    // let selection = document.getElementsByClassName('selection')[0];
    // selection.style.width = '100%';
    // selection.flexDirection = 'row';
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.CheckAnswer);
  },
  methods: {
    SelectItem(index) {
      for (const i in this.Select) {
        this.Select[i] = false;
      }
      this.Select[index] = true;
      this.Answer = index;
    },
    CheckAnswer() {
      const answer = this.Answer;
      if (answer === this.gameData.Answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.gameData.Answer, answer, "正確"]);
        this.$emit("next-question");
        console.log("check answer : True");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.gameData.Answer, answer, "錯誤"]);
        console.log("check answer : False");
      }
    },
  },
};
</script>
<style scoped lang="scss">
.outter-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $gap--medium;
  padding: 0 $gap--medium;
  width: 100%;
  height: 100%;
  .head-container {
    @extend .container-basic;
    display: flex;
    align-items: center;
    width: 100%;
    height: 20%;
    background-color: $primary-color;
    font-size: $text-large;
    padding: $gap--small;
    p {
      margin: auto 0 auto;
    }
  }
  .down-container {
    height: 70%;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    gap: $gap--medium;
    padding: $gap--medium;
    .select-button__group {
      height: 55%;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: $gap--small;
      button {
        @extend .button-basic;
        border: none;
        background-color: $primary-btn-bg;
        height: 25%;
        font-size: $text-small;
      }
    }
    .component-container {
      width: 35%;
      // 適用於ImageContainer 這個 component
      :deep(.image-container) {
        img {
          border-radius: 15px;
        }
      }
    }
    .container__right {
      width: 50%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: $gap--medium;
      button {
        @extend .button-basic;
        border-radius: 15px;
        border: none;
        font-size: $text-small;
      }
      .info__card {
        height: 30%;
        @extend .container-basic;
        background-color: $info-color;
        padding: $gap--small;
        font-size: $text-medium;
        text-align: center;
        display: flex;
        justify-content: center;
        white-space: pre-wrap;
        p {
          margin: auto 0 auto;
        }
      }
      .button--submit {
        @extend .button--animation;
        background-color: $submit-color;
        height: 15%;
        &:hover {
          transform: scale($transform-scale);
        }
      }
    }
    .container__buttom {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
      height: 100%;
      .info__card {
        width: 40%;
        @extend .container-basic;
        background-color: $info-color;
        padding: $gap--small;
        font-size: $text-medium;
        text-align: center;
        display: flex;
        justify-content: center;
        p {
          margin: auto 0 auto;
        }
      }
      .right--container {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: $gap--medium;
        .select-button__group {
          height: 80%;
        }
      }
      .button--submit {
        @extend .button--animation;
        background-color: $submit-color;
        height: 15%;
        &:hover {
          transform: scale($transform-scale);
        }
      }
    }
  }
}
.button--onsubmit {
  animation: blink 1s linear infinite;
}
@keyframes blink {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}
.button--onclick {
  background-color: $primary-btn-hover-bg !important;
  scale: 1.03;
}
</style>
