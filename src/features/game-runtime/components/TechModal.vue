<template>
  <!-- <img class="tech-modal__content" :src="mediaSrc" /> -->
  <base-modal @close="closeModal">
    <div class="tech-modal__container">
      <div class="tech-modal__title">
        <h1 v-if="modalPurpose === 'hint'">{{ customTitle || "提示" }}</h1>
        <h1 v-else-if="modalPurpose === 'passMedia'">
          {{ customTitle || "說明" }}
        </h1>
        <h1 v-else>{{ customTitle || "教學影片" }}</h1>
      </div>
      <div class="tech-modal__media">
        <template v-if="isComponent">
          <component
            :is="mediaData.component.Name"
            :component-config="mediaData.component.Data"
            :game-id="gameId"
          />
        </template>
        <template v-else>
          <video v-if="isVideo" controls class="tech-modal__content">
            <source :src="mediaSrc" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <img v-else class="tech-modal__content" :src="mediaSrc" />
        </template>
      </div>
      <div class="tech-modal__footer">
        <button class="button-close" @click="closeModal">關閉</button>
      </div>
    </div>
  </base-modal>
</template>

<script>
import {
  getDefaultHintAssets,
  getGameAssets,
  getSystemAssets,
} from "@/lib/get-assets.js";
import gameStore from "@/features/game-runtime/model/game-store.js";
import { mapWritableState } from "pinia";
import BaseModal from "./BaseModal.vue";
import { basicComponents } from "@/lib/basicComponentsRegistry.js";

export default {
  name: "TechVideo",
  components: {
    BaseModal,
    ...basicComponents,
  },
  props: {
    mediaData: {
      type: [String, Object],
      required: false,
      default: undefined,
    },
    gameId: {
      type: String,
      required: true,
    },
    modalPurpose: {
      type: String,
      default: "intro",
    },
  },
  emits: ["close"],
  data() {
    return {
      isVideo: false,
      mediaSrc: "",
      isComponent: false,
    };
  },
  computed: {
    ...mapWritableState(gameStore, ["gameType"]),
    customTitle() {
      if (this.isComponent && this.mediaData && this.mediaData.title) {
        return this.mediaData.title;
      }
      return null;
    },
  },
  mounted() {
    console.log(this.gameId, this.mediaData);
    if (
      this.mediaData &&
      typeof this.mediaData === "object" &&
      this.mediaData.type === "component"
    ) {
      this.isComponent = true;
      return;
    }

    // if mediaData is not given, use default tech video, if both are not available, load 404 image
    if (this.mediaData === undefined) {
      const defaultTechVideo = this.checkDefaultMediaAvailability();
      if (defaultTechVideo === "") {
        this.load404Image();
        this.isVideo = false;
      } else {
        this.mediaSrc = defaultTechVideo;
        this.isVideo = this.checkGivenMediaType(this.mediaSrc) === "video";
      }
    } else {
      const userGivenTechVideo = this.checkUserGivenMediaAvailability();
      if (userGivenTechVideo === "") {
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
      const userGivenTechVideo = getGameAssets(this.gameId, this.mediaData);
      console.log(userGivenTechVideo);
      if (userGivenTechVideo.includes("undefined")) {
        return "";
      } else {
        return userGivenTechVideo;
      }
    },
    checkGivenMediaType(src) {
      console.log(src);
      if (src.includes(".mp4")) {
        return "video";
      } else {
        return "image";
      }
    },
    load404Image() {
      this.mediaSrc = getSystemAssets("404-not-found.png", "general");
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
  max-width: 800px;
  height: auto;
  max-height: 100%;
  object-fit: contain;
}
.tech-modal__container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  width: 80vw;
  height: 80vh;
  max-width: 1000px;
  max-height: 800px;
  .tech-modal__footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
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
    flex-shrink: 0;
  }
  .tech-modal__media {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex: 1;
    min-height: 0;
    margin: 0 auto;
    overflow-y: auto;
    overflow-x: hidden;
  }
  img {
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}
</style>
