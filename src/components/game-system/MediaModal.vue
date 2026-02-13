<template>
  <div
    v-if="showMediaModal"
    class="mediaModal-overlay"
    @click.self="closeMediaModal"
  >
    <div class="mediaModal-container">
      <div class="mediaModal-header">
        <h1 class="mediaModal-title">
          {{ modalTitle }}
        </h1>
      </div>
      <div class="mediaModal-body">
        <p class="mediaModal-content">
          {{ modalContent }}
        </p>
        <video
          v-if="mediaType === 'video'"
          :src="mediaSrc"
          controls
          autoplay
          class="media-content"
        />
        <img
          v-else-if="mediaType === 'image'"
          :src="mediaSrc"
          class="media-content"
        />
        <img v-else :src="notFoundSrc" class="media-content" />
      </div>
      <div class="mediaModal-footer">
        <button type="button" @click="closeMediaModal">我知道了!</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
export default {
  props: {
    showMediaModal: {
      type: Boolean,
      required: true,
    },
    modalTitle: {
      type: String,
      required: true,
    },
    modalContent: {
      type: String,
      required: true,
    },
    mediaSrc: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      required: true,
    },
  },
  emits: ["closeModal"],
  data() {
    return {
      notFoundSrc: getSystemAssets("404.png", "icon"),
    };
  },
  methods: {
    closeMediaModal() {
      this.$emit("closeModal");
    },
  },
};
</script>

<style scoped>
.mediaModal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.mediaModal-container {
  background: #fff;
  border-radius: 10px;
  width: 80%;
  height: 90%;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.mediaModal-header {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.mediaModal-title {
  font-size: 2rem;
  text-align: start;
  margin: 0;
}

.mediaModal-body {
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-grow: 1;
}

.mediaModal-footer {
  display: flex;
  justify-content: center;
  width: 100%;
}

.media-content {
  max-width: 100%;
  max-height: 100%;
  min-width: 300px;
  min-height: 200px;
  object-fit: contain;
  flex-grow: 1;
}

button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #5a6268;
}

img.media-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mediaModal-content {
  margin: 0;
  font-size: 1.5rem;
}
</style>
