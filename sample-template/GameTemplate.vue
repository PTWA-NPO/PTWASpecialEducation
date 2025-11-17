<template>
  <div class="YOUR-GAME-NAME__container">
    <!-- <component :is="componentName" :Data="componentsData" :ID="ID" @replyAnswer="replyAnswerFunc" /> -->
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import { getGameStaticAssets } from "@/utilitys/get_assets.js"; // Feel free to change your the method to get assets.
export default {
  name: "YourGameName",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
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
  emits: ["add-record", "next-question", "play-effect"],
  data() {
    return {
      // Your data here
    };
  },
  computed: {
    // Your computed properties here
  },
  created() {
    // Your created hook here
  },
  mounted() {
    // Your mounted hook here
  },
  methods: {
    // Your methods here
  },
};
</script>

<style scoped lang="scss"></style>
