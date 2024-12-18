<template>
  <!-- <img class="tech-modal__content" :src="mediaSrc" /> -->
  <Modal @close="closeModal">
    <div class="tech-modal__container">
      <div class="tech-modal__title">
        <h1>教學影片</h1>
      </div>
      <div class="tech-modal__media">
        <video v-if="isVideo" controls class="tech-modal__content">
          <source :src="mediaSrc" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <img v-else class="tech-modal__content" :src="mediaSrc" />
      </div>
      <div class="tech-modal__footer">
        <button class="button-close" @click="closeModal">關閉</button>
      </div>
    </div>
  </Modal>
</template>

<script>
import {
  getDefaultHintAssets,
  getGameAssets,
  getSystemAssets,
} from "@/utilitys/get_assets.js";
import gameStore from "@/stores/game";
import { mapWritableState } from "pinia";
import Modal from "@/components/game-system/Modal.vue";
export default {
  name: "TechVideo",
  components: {
    Modal,
  },
  props: {
    mediaData: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  data() {
    return {
      isVideo: false,
      mediaSrc: "",
    };
  },
  computed: {
    ...mapWritableState(gameStore, ["gameID", "gameType"]),
  },
  mounted() {
    // if mediaData is not given, use default tech video, if both are not available, load 404 image
    if (this.mediaData == undefined) {
      let defaultTechVideo = this.checkDefaultMediaAvailability();
      if (defaultTechVideo == "") {
        this.load404Image();
        this.isVideo = false;
      } else {
        this.mediaSrc = defaultTechVideo;
        this.isVideo = this.checkGivenMediaType(this.mediaSrc) === "video";
      }
    } else {
      let userGivenTechVideo = this.checkUserGivenMediaAvailability();
      if (userGivenTechVideo == "") {
        this.load404Image();
        this.isVideo = false;
      } else {
        this.mediaSrc = userGivenTechVideo;
        this.isVideo = this.checkGivenMediaType(this.mediaSrc) === "video";
      }
    }
  },
  methods: {
    checkDefaultMediaAvailability() {
      const defaultTechVideo = getDefaultHintAssets(`${this.gameType}.gif`);
      if (defaultTechVideo.includes("undefined")) {
        return "";
      } else {
        return defaultTechVideo;
      }
    },
    checkUserGivenMediaAvailability() {
      const userGivenTechVideo = getGameAssets(this.mediaData);
      if (userGivenTechVideo.includes("undefined")) {
        return "";
      } else {
        return userGivenTechVideo;
      }
    },
    checkGivenMediaType(src) {
      if (src.includes(".mp4")) {
        return "video";
      } else {
        return "image";
      }
    },
    load404Image() {
      this.mediaSrc = getSystemAssets("image404width.gif", "general");
    },
    closeModal() {
      this.$emit("close");
      // console.log("close");
    },
  },
};
</script>

<style scoped lang="scss">
.tech-video {
  max-width: 100%;
  margin: 0 auto;
}
video {
  width: 100%;
  height: auto;
}
.tech-modal__container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  .tech-modal__footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .button-close {
    padding: 0.5rem;
    @extend .button-basic;
    border: none;
    background-color: $error-color;
  }
  .tech-modal__title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 1rem;
    align-self: flex-start;
  }
  img {
    max-height: 60vh;
    max-width: auto;
  }
}
</style>
