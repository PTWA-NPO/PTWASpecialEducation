<template>
  <div class="game-card__container" @click="enterGame">
    <div class="id-container">
      {{ gameInfo.id }}
    </div>
    <div class="image-outter">
      <img
        :src="imageSrc"
        class="image--container"
        :alt="`${gameInfo.id}的介紹圖片`"
      >
    </div>
    <div class="card-info">
      <div class="info--top">
        <p class="title">
          {{ gameInfo.name }}
        </p>
        <a
          class="btn btn-primary mx-2"
          @click="MakeReadText(item.Name, item.Description)"
        ><i class="bi bi-volume-up-fill" /></a>
      </div>
      <p class="description">
        {{ gameInfo.description }}
      </p>
    </div>
  </div>
</template>
<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
export default {
  name: "QuestionCard",
  props: {
    gameInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ["readText", "enterGame"],
  data() {
    return {
      image404: getSystemAssets("image404width.gif", "general"),
      imageSrc: undefined,
    };
  },
  created() {
    console.log(this.image404);
    if (!this.gameInfo.imgSrc || this.gameInfo.imgSrc.includes("undefined")) {
      this.imageSrc = this.image404;
    } else {
      this.imageSrc = this.gameInfo.imgSrc;
    }
  },
  methods: {
    readText(event) {
      //   event.stopPropagation();
      this.$emit("readText", this.gameInfo.name, this.gameInfo.description);
    },
    enterGame() {
      this.$emit("enterGame");
    },
  },
};
</script>
<style scoped lang="scss">
.id-container {
  background-color: $info-color;
  align-self: start;
  padding: 5px;
  @extend .container-basic;
  height: 30px;
}
.game-card__container {
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding: 10px;
  gap: $gap--small;
  transition: all 0.3s;
  cursor: pointer;
}
.info--top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: $text-medium;
    text-decoration: underline;
    font-weight: 600;
    color: $hyperlink-color;
  }
}

@media screen and (min-width: 800px) and (max-width: 1200px) and (min-height: 800px) and (max-height: 1200px) {
  .image-outter {
    height: 140px;
  }
}
.image-outter {
  width: 100%;
  .image--container {
    width: 100%;
    max-height: 230px;
    object-fit: contain;
  }
}
</style>
