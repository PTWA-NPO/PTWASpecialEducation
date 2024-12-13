<template>
  <div class="MA3142__container">
    <!-- <component :is="componentName" :Data="componentsData" :ID="ID" @replyAnswer="replyAnswerFunc"/> -->
    <TextOnly></TextOnly>
    <ImageContainer></ImageContainer>
    <Scale :Data="componentsData" :ID="ID"></Scale>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import { getGameStaticAssets } from "@/utilitys/get_assets.js"; // Feel free to change your the method to get assets.
import { GetComponents } from "@/utilitys/get-components.js";
export default {
  name: "MA3142",
  components: {
    // Import your components here, use defineAsyncComponent for lazy loading
    Scale: GetComponents("Scale"),
    ImageContainer: GetComponents("ImageContainer"),
    TextOnly: GetComponents("TextOnly"),
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
