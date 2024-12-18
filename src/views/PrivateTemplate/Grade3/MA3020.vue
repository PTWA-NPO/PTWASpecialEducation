<template>
  <div>
    <p id="Hello" class="h1">
      fffffffff
    </p>
    this is a private moduel sample
    <button @click="sound">
      Play Sound
    </button>
    {{ GameData }}
    {{ GameConfig }}
    {{ id }}
  </div>
</template>

<script>
import { getTheamsAssets } from "@/utilitys/get_assets.js";
export default {
  name: "MA3020",
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
  emits: {
    "play-effect": null,
  },
  data() {
    return {
      // Your data properties go here
    };
  },
  mounted() {
    try {
      if (this.GameConfig.Theam) {
        import(getTheamsAssets(this.GameConfig.Theam));
      }
    } catch {
      console.log("Using Default Theam");
    }
  },
  methods: {
    sound() {
      this.$emit("play-effect", "CorrectSound");
    },
  },
};
</script>

<style scoped lang="scss">
#Hello {
  color: pink;
}
</style>
