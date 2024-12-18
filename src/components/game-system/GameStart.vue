<template>
  <div v-if="Status == 'NotStart'" class="game-start container">
    <div class="upper-container">
      <h1>{{ GameName }}</h1>
      <div class="card">
        <p v-if="introType == 'PlainText'">
          {{ ShowContent }}
        </p>
        <p v-else>無介紹文字</p>
      </div>
    </div>
    <div class="buttons">
      <button
        class="action-button"
        @click="
          startGame();
          makeReadText('', '', (stop = true));
        "
      >
        <img :src="startGameIconSrc" />
        開始遊戲
      </button>
      <button
        class="action-button"
        @click="makeReadText(GameName, ShowContent)"
      >
        <img src="" />
        朗讀
      </button>
      <button class="action-button" @click="openTeachingMediaModal">
        <img :src="tutorialVideoIconSrc" />
        教學影片
      </button>
    </div>
  </div>
</template>

<script>
import * as Read from "@/utilitys/readtext.js";
import { getSystemAssets } from "@/utilitys/get_assets.js";
export default {
  name: "GameStart",
  props: {
    GameName: {
      type: String,
      required: true,
    },
    intro: {
      type: Object,
      required: true,
    },
    Status: {
      type: String,
      required: true,
    },
  },
  emits: ["restart", "openTeachingModal", "startGame"],
  data() {
    return {
      nameofThisComponent: "GameStartandOver Component said:",
      introType: "",
      startGameIconSrc: getSystemAssets("start-game.png", "game_images"),
      readAloudIconSrc: getSystemAssets("read-aloud.png", "game_images"),
      tutorialVideoIconSrc: getSystemAssets(
        "tutorial-video.png",
        "game_images"
      ),
    };
  },
  mounted() {
    Read.InitReadProccess();
    this.initIntroType();
  },
  methods: {
    initIntroType() {
      if (this.intro != undefined) {
        if (this.intro.Type == "Html") {
          this.introType = "Html";
          this.ShowContent = this.intro.Content;
        } else if (this.intro.Type == "PlainText") {
          this.introType = "PlainText";
          this.ShowContent = this.intro.Content;
        } else {
          this.introType = "undefined";
        }
      } else {
        this.introType = "undefined";
      }
    },
    makeReadText(title, description, stop = false) {
      let text = `標題:${title}。說明:${description}。`;
      Read.ReadText(text, stop);
    },
    startGame() {
      this.$emit("startGame");
    },
    openTeachingMediaModal() {
      this.$emit("openTeachingModal");
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  .upper-container {
    width: 70%;
    h1 {
      font-size: $text-large;
      margin-bottom: 1rem;
    }
    .card {
      padding: $padding--medium;
      border-radius: 5px;
      background-color: $info-color;
      border: none;
      p {
        font-size: $text-medium;
        margin: auto 0 auto;
      }
    }
  }
  .buttons {
    width: 70%;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
    .action-button {
      @extend .button--animation;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      gap: 15px;
      background-color: $success-color;
      font-size: $text-small;
      cursor: pointer;
      img {
        height: 80%;
        max-width: 40px;
        max-height: 40px;
      }
    }
  }
}
</style>
