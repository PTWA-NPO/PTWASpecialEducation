<template>
  <div class="digital-clock" />
</template>
<script>
import { getSlotComponentAssets } from "@/utilitys/get_assets.js";
export default {
  name: "DigitalClock",
  data() {
    return {
      // Data properties will go here
      imgSrc: "",
    };
  },
  created() {},
  mounted() {
    // Code to run when the component is created goes here
    this.imgSrc = getSlotComponentAssets("DigitalClock", "clock_bg.png");
    console.log(this.imgSrc);
  },
};
</script>
<style scoped lang="scss">
.digital-clock {
  // background-image: url("http://localhost:5173/PTWASpecialEducation/src/assets/SlotComponentData/DigitalClock/clock_bg.png");
}
</style>
