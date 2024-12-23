<template>
  <div ref="container" class="container">
    <button ref="numBtn" class="numBtn" @click="showPad" :style="btnStyle">
      {{ input }}
    </button>
    <div ref="keys" class="keys" :style="padStyle">
      <button v-for="i in 3" class="keysBtn" @click="setNum(i + 6)">
        {{ i + 6 }}
      </button>
      <button v-for="i in 3" class="keysBtn" @click="setNum(i + 3)">
        {{ i + 3 }}
      </button>
      <button v-for="i in 3" class="keysBtn" @click="setNum(i)">{{ i }}</button>
      <button class="keysBtn" @click="setNum(0)">0</button>
      <button class="clearBtn" @click="setNum(null)">clear</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },

  emits: ["replyAnswer"],

  data() {
    return {
      input: null,
      padStyle: {
        visibility: "hidden",
      },
      btnStyle: {},
    };
  },

  props: {
    Data: {
      type: Object,
      required: true,
    },
  },

  emits: ["replyAnswer"],

  mounted() {
    this.getPreset();
    this.getPositionInfo();
    this.setStyle();
  },

  methods: {
    getPreset() {
      if (this.Data.preset) this.input = this.Data.preset;
    },
    getPositionInfo() {
      this.btnWidth = this.$refs.container.clientWidth;
      this.btnHeight = this.$refs.container.clientHeight;
      this.btnX = this.$refs.container.offsetLeft;
      this.btnY = this.$refs.container.offsetTop;
      this.padWidth = this.$refs.keys.clientWidth;
      this.padHeight = this.$refs.keys.clientHeight;
      this.margin = 10;
    },
    setStyle() {
      this.$refs.numBtn.style.backgroundColor = this.Data.color;

      switch (this.Data.padPosition) {
        case "upperRight":
          this.padStyle.left = this.btnX + this.btnWidth + this.margin + "px";
          this.padStyle.top =
            this.btnY - this.padHeight + this.btnHeight + "px";
          break;
        case "lowerRight":
          this.padStyle.left = this.btnX + this.btnWidth + this.margin + "px";
          this.padStyle.top = this.btnY + "px";
          break;
        case "lowerLeft":
          this.padStyle.left = this.btnX - this.padWidth - this.margin + "px";
          this.padStyle.top = this.btnY + "px";
          break;
        case "upperLeft":
          this.padStyle.left = this.btnX - this.padWidth - this.margin + "px";
          this.padStyle.top =
            this.btnY - this.padHeight + this.btnHeight + "px";
          break;
      }
    },
    setNum(i) {
      this.input = i;
      this.$emit("replyAnswer", i);
      this.padStyle.visibility = "hidden";
    },
    showPad() {
      if (this.Data.adjustable != false) {
        if (this.padStyle.visibility == "hidden") {
          this.padStyle.visibility = "visible";
          this.btnStyle.filter = "sepia(30%) brightness(80%)";
        } else if (this.padStyle.visibility == "visible") {
          this.padStyle.visibility = "hidden";
          this.btnStyle.filter = "sepia(0%) brightness(100%)";
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  padding: 0;
  width: 100%;
  height: 100%;
}
.numBtn {
  width: 100%;
  height: 100%;
}
.keys {
  display: grid;
  position: absolute;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: fit-content;
  height: fit-content;
  background-color: #9b8c7c;
  padding: 10px;
  border-radius: 20px;
  z-index: 1;
}
.keysBtn {
  width: 5vw;
  height: 5vw;
}

.clearBtn {
  grid-column: 2/4;
  height: 5vw;
}
button {
  border: none;
  font-size: 250%;
}
</style>
