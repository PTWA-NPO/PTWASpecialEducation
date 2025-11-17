<template>
  <div class="YOUR-SLOT-COMPONENT-NAME__container"></div>
</template>

<script>
import { getGameAssets } from "@/utilitys/get_assets.js"; // Feel free to change your the method to get assets.
export default {
  name: "SlotComponentTemplate",
  components: {
    // Import your components here, you can use defineAsyncComponent for lazy loading
    // If you pretty sure that the component will be used in the template, you can import it here
  },
  props: {
    Data: {
      type: String,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      componentConfig: {},
    };
  },
  computed: {
    // Your computed properties here
  },
  created() {
    this.componentConfig = this.Data;
  },
  mounted() {
    // Your mounted hook here
  },
  methods: {
    // Your methods here
  },
};
</script>

<style lang="scss" scoped>
/* Add your styles here */
</style>
