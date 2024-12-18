<template>
  <div class="outter-container">
    <div class="head-container">
      <p style="font-weight: bold">
        {{ GameConfig.GlobalTitle }}
      </p>
    </div>
    <div class="down-container">
      <div
        v-if="GameData.SlotComponents != undefined"
        class="component-container"
      >
        <component :is="SlotComponent" :ID="ID" :Data="SlotData" />
      </div>
      <div v-if="GameData.SlotComponents != undefined" class="container__right">
        <div class="info__card">
          <p>{{ GameData.Question_Text }}</p>
        </div>
        <div class="select-button__group">
          <button
            v-for="i in question"
            type="button"
            :class="{ 'button--onclick': Select[i] }"
            @click="SelectItem(i)"
          >
            {{ i }}
          </button>
        </div>
        <button
          type="button"
          class="button--submit"
          :class="{ 'button--onsubmit': Answer != null }"
          @click="CheckAnswer"
        >
          送出答案
        </button>
      </div>
      <div v-else class="container__buttom">
        <div class="info__card">
          <p class="h2">
            {{ GameData.Question_Text }}
          </p>
        </div>
        <div class="right--container">
          <div class="select-button__group">
            <button
              v-for="i in question"
              type="button"
              :class="{ 'button--onclick': Select[i] }"
              @click="SelectItem(i)"
            >
              {{ i }}
            </button>
            <hr />
            <button
              type="button"
              class="button--submit"
              :class="{ 'button--onsubmit': Answer != null }"
              @click="CheckAnswer"
            >
              送出答案
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
export default {
  name: "SelectGame",
  components: {
    ImageContainer: getComponents("ImageContainer"),
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
      imageUrl: "",
      question: [],
      SlotComponent: null,
      comp: null,
      Answer: null,
      Select: [],
    };
  },
  created() {
    for (var i in this.GameData.Question) {
      this.question.push(this.GameData.Question[i]);
      this.Select.push(false);
    }
    this.imageUrl = getGameAssets(this.ID, this.GameData.img);
    if (this.GameData.SlotComponents != undefined) {
      let SlotComponentData = this.GameData.SlotComponents[0];
      this.SlotData = SlotComponentData.Data;
      this.SlotComponent = SlotComponentData.Name;
    }
    console.log(this.imageUrl);
  },
  mounted() {
    // let selection = document.getElementsByClassName('selection')[0];
    // selection.style.width = '100%';
    // selection.flexDirection = 'row';
  },
  methods: {
    SelectItem(index) {
      for (var i in this.Select) {
        this.Select[i] = false;
      }
      this.Select[index] = true;
      this.Answer = index;
    },
    CheckAnswer() {
      let answer = this.Answer;
      if (answer == this.GameData.Answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.GameData.Answer, answer, "正確"]);
        this.$emit("next-question");
        console.log("check answer : True");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.GameData.Answer, answer, "錯誤"]);
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
