<template>
  <div ref="Outter" class="Outter">
    <div class="cups-container">
      <canvas
        v-for="(_, index) in numberOfCups"
        :id="`cup-${index}`"
        :key="index"
        :ref="`Cup-${index}`"
      />
    </div>
  </div>
</template>

<script>
import { getSlotComponentAssets } from "@/lib/get-assets.js";
export default {
  name: "WaterDisplay",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      configs: {},
    };
  },
  computed: {
    numberOfCups() {
      if (!this.configs.Scale || !this.configs.Ml) return 1;
      return Math.ceil(this.configs.Ml / this.configs.Scale);
    },
    remainingMl() {
      if (!this.configs.Scale || !this.configs.Ml) return 0;
      return this.configs.Ml % this.configs.Scale;
    },
  },
  created() {
    this.configs = this.componentConfig;
  },
  mounted() {
    this.$nextTick(() => {
      this.drawCups();
    });
  },
  methods: {
    drawCups() {
      const Outter = this.$refs.Outter;
      const border = Math.min(Outter.clientWidth, Outter.clientHeight) - 10;
      const dpr = window.devicePixelRatio || 1;

      for (let i = 0; i < this.numberOfCups; i++) {
        const canvas = this.$refs[`Cup-${i}`][0];
        canvas.width = border * dpr;
        canvas.height = border * dpr;
        canvas.style.width = `${border}px`;
        canvas.style.height = `${border}px`;

        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);

        // Draw Cup
        const img = new Image();
        img.onload = () => {
          // 1. Draw the water fill
          const ml =
            i === this.numberOfCups - 1
              ? this.remainingMl === 0
                ? this.configs.Scale
                : this.remainingMl
              : this.configs.Scale;
          const [StartX, StartY, EndX, EndY] = this.ContDrawInfo(
            this.configs.Scale,
            ml,
            dpr
          );
          ctx.beginPath();
          ctx.rect(StartX, StartY, EndX, EndY);
          ctx.fillStyle = "#bde0fe";
          ctx.fill();

          // 2. Overlay the cup image (with transparency)
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            canvas.width / dpr,
            canvas.height / dpr
          );
        };
        img.src = getSlotComponentAssets("Water", `${this.configs.Scale}.png`);
      }
    },
    ContDrawInfo(Scale, ML, dpr) {
      let StartX = 0;
      let StartY = 0;
      let EndX = 0;
      let EndY = 0;
      const canvas = this.$refs[`Cup-${this.numberOfCups - 1}`][0];
      if (Scale === 1000) {
        StartX = (canvas.width / 15) * 2;
        EndX = (canvas.width / 15) * 11 + 2;
        StartY = (canvas.height / 12) * (10 - ML / 100 + 1);
        EndY = (canvas.height / 12) * (ML / 100) + 2;
      } else if (Scale === 250) {
        StartX = (canvas.width / 15) * 2;
        EndX = (canvas.width / 15) * 11 + 2;
        StartY = (canvas.height / 15) * (1 + (13 / 250) * (250 - ML));
        EndY = (canvas.height / 15) * ((13 / 250) * ML);
      } else if (Scale === 2000) {
        StartX = (canvas.width / 15) * 2;
        EndX = (canvas.width / 15) * 11 + 2;
        StartY = (canvas.height / 12) * (10 - ML / 200 + 1);
        EndY = (canvas.height / 12) * (ML / 200) + 2;
      }
      return [StartX / dpr, StartY / dpr, EndX / dpr, EndY / dpr];
    },
  },
};
</script>

<style scoped lang="scss">
.Outter {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.cups-container {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>


