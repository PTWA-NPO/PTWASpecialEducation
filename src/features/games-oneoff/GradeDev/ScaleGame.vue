<template>
  <div class="gameContainer">
    <div class="gameTitle">
      <h2>{{ gameData.question }}</h2>
    </div>
    <div class="gameArea">
      <div class="gameImage">
        <img :src="questionImg" />
      </div>
      <div class="scaleArea">
        <div class="scaleContainer">
          <div class="scale">
            <scale-pointer
              :game-id="gameId"
              :component-config="scaleData"
              @reply-answer="getAnswer"
            />
          </div>
        </div>
        <div class="btnContainer">
          <button @click="checkAnswer">
            <h3>確認答案</h3>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getGameAssets } from "@/lib/get-assets.js";
import { defineAsyncComponent } from "vue";
export default {
  components: {
    ScalePointer: defineAsyncComponent(
      () => import("@/components/ScalePointer.vue")
    ),
  },

  props: {
    gameId: {
      type: String,
      required: true,
    },
    gameData: {
      type: Object,
      required: true,
    },
  },

  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      scaleData: {},
      questionImg: null,
      answer: 0,
    };
  },

  mounted() {
    this.questionImg = getGameAssets(this.gameId, this.gameData.imageSrc);
    this.initializeScale();
  },

  methods: {
    initializeScale() {
      if (this.gameData.customOptions.scaleBG === null)
        this.scaleData.customScaleSrc = null;
      else this.scaleData.customScaleSrc = this.gameData.customOptions.scaleBG;
    },
    getAnswer(ans) {
      this.answer = ans;
    },
    checkAnswer() {
      if (this.answer === this.gameData.answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.gameData.answer, this.answer, "正確"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.gameData.answer, this.answer, "錯誤"]);
      }
    },
  },
};
</script>
<style scoped>
.gameContainer {
  width: 100%;
  height: 100%;
}
.gameTitle {
  display: flex;
  align-items: center;
  border: 2px solid black;
  border-radius: 25px;
  width: 98%;
  height: 10%;
  margin: 1%;
  padding-left: 1%;
}
.gameArea {
  width: 100%;
  height: 85%;
  display: flex;
}
.gameImage {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid black;
  border-radius: 25px;
  width: 46%;
  margin: 1%;
  padding: 2%;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scaleArea {
  width: 50%;
  margin: 1%;
}
.scaleContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid black;
  border-radius: 25px;
  width: 100%;
  height: 88%;
  margin-bottom: 1%;
  padding: 2%;
}
.scale {
  height: 100%;
  aspect-ratio: 1;
}
.btnContainer {
  border: 2px solid black;
  border-radius: 25px;
  width: 100%;
  height: 10%;
  margin-top: 2%;
  display: flex;
  align-items: center;
  justify-content: center;
}
button {
  width: 100%;
  height: 100%;
  border: none;
  background: none;
}
</style>
