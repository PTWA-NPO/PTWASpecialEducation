<template>
  <div id="Outter" ref="Outter" class="Outter">
    <canvas id="clock" ref="Clock" />
  </div>
</template>
<script>
import { getSlotComponentAssets } from "../utilitys/get_assets";
export default {
  name: "Clock",
  props: {
    ID: {
      type: String,
      required: true,
    },
    Data: {
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
      let canvas = this.$refs.Clock;
      let ctx = canvas.getContext("2d");
      let border = Math.min(
        this.$refs.Outter.clientWidth,
        this.$refs.Outter.clientHeight
      );
      let dpr = window.devicePixelRatio || 1; // 獲取設備像素比率

      canvas.width = border * dpr;
      canvas.height = border * dpr;

      canvas.style.width = `${border}px`;
      canvas.style.height = `${border}px`;

      ctx.scale(dpr, dpr); // 根據設備像素比率縮放畫布

      let img = new Image();
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

      if (this.Data.sec !== undefined && this.Data.sec !== "") {
        let Lsec = (border / 2) * 0.7;
        let sec = new Vector(border / 2, border / 2, this.Data.sec * 6, Lsec);
        ctx.beginPath();
        ctx.moveTo(border / 2, border / 2);
        ctx.lineTo(sec.endX, sec.endY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
      }

      if (this.Data.min !== undefined && this.Data.min !== "") {
        let Lmin = (border / 2) * 0.6;
        let min = new Vector(border / 2, border / 2, this.Data.min * 6, Lmin);
        ctx.beginPath();
        ctx.moveTo(border / 2, border / 2);
        ctx.lineTo(min.endX, min.endY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "blue";
        ctx.stroke();
        ctx.closePath();
      }

      if (this.Data.hour !== undefined && this.Data.hour !== "") {
        let Lhour = (border / 2) * 0.4;
        let hour = new Vector(
          border / 2,
          border / 2,
          this.Data.hour * 30,
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
