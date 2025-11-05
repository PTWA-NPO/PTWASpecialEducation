<template>
  <div id="Outter" ref="Outter" class="Outter">
    <canvas id="clock" ref="Clock" />
  </div>
</template>
<script>
import { getSlotComponentAssets } from "@/lib/get-assets.js";
export default {
  name: "AnalogClock",
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Your data properties go here
    };
  },
  mounted() {
    this.drawClock();
    window.addEventListener("resize", this.drawClock);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.drawClock);
  },

  methods: {
    drawClock() {
      const canvas = this.$refs.Clock;
      const ctx = canvas.getContext("2d");
      const border = Math.min(
        this.$refs.Outter.clientWidth,
        this.$refs.Outter.clientHeight
      );
      const dpr = window.devicePixelRatio || 1; // 獲取設備像素比率

      canvas.width = border * dpr;
      canvas.height = border * dpr;

      canvas.style.width = `${border}px`;
      canvas.style.height = `${border}px`;

      ctx.scale(dpr, dpr); // 根據設備像素比率縮放畫布

      const img = new Image();
      img.src = getSlotComponentAssets("Clock", "Clock.png");
      img.onload = function () {
        ctx.drawImage(img, 0, 0, border, border);
      };

      class Vector {
        constructor(startX, startY, angle, length) {
          this.startX = startX;
          this.startY = startY;
          this.angle = (Math.PI * (angle - 90)) / 180;
          this.length = length;
          this.endX = this.startX + Math.cos(this.angle) * this.length;
          this.endY = this.startY + Math.sin(this.angle) * this.length;
        }
      }

      if (
        this.componentConfig.sec !== undefined &&
        this.componentConfig.sec !== ""
      ) {
        const Lsec = (border / 2) * 0.7;
        const sec = new Vector(
          border / 2,
          border / 2,
          this.componentConfig.sec * 6,
          Lsec
        );
        ctx.beginPath();
        ctx.moveTo(border / 2, border / 2);
        ctx.lineTo(sec.endX, sec.endY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
      }

      if (
        this.componentConfig.min !== undefined &&
        this.componentConfig.min !== ""
      ) {
        const Lmin = (border / 2) * 0.6;
        const min = new Vector(
          border / 2,
          border / 2,
          this.componentConfig.min * 6,
          Lmin
        );
        ctx.beginPath();
        ctx.moveTo(border / 2, border / 2);
        ctx.lineTo(min.endX, min.endY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "blue";
        ctx.stroke();
        ctx.closePath();
      }

      if (
        this.componentConfig.hour !== undefined &&
        this.componentConfig.hour !== ""
      ) {
        const Lhour = (border / 2) * 0.4;
        const hour = new Vector(
          border / 2,
          border / 2,
          this.componentConfig.hour * 30,
          Lhour
        );
        ctx.beginPath();
        ctx.moveTo(border / 2, border / 2);
        ctx.lineTo(hour.endX, hour.endY);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* Your component-specific styles go here */
.Outter {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
</style>


