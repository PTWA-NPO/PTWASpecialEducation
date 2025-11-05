<template>
  <div class="game-card__container">
    <div class="id-container">
      {{ gameInfo.id }}
    </div>
    <div class="image-outter">
      <img
        :src="imageSrc"
        class="image--container"
        :alt="`${gameInfo.id}的介紹圖片`"
      />
    </div>
    <div class="card-info">
      <div class="info--top">
        <p class="title">
          {{ gameInfo.Name }}
        </p>
        <a class="btn btn-primary mx-2"><i class="bi bi-volume-up-fill" /></a>
      </div>
      <p class="description">
        {{ gameInfo.Description }}
      </p>
    </div>
  </div>
</template>
<script>
import { getSystemAssets } from "@/lib/get-assets.js";
export default {
  name: "QuestionCard",
  props: {
    gameInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      image404: getSystemAssets("404-not-found.png", "general"),
      imageSrc: undefined,
    };
  },
  created() {
    if (!this.gameInfo.Img || this.gameInfo.Img.includes("undefined")) {
      this.imageSrc = this.image404;
    } else {
      this.imageSrc = this.gameInfo.Img;
    }
  },
  methods: {},
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
  display: flex;
  align-items: center;
  justify-content: center;
  .image--container {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>


