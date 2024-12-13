<template>
  <v-circle :config="configBase" @touchmove="getTouchPosition" />
  <v-circle :config="configStick" />
</template>

<script>
export default {
  props: {
    position: {
      type: Object,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
  },
  emits: ["move"],
  data() {
    return {
      configBase: {
        stroke: "white",
        fill: "white",
        opacity: 0.3,
      },

      configStick: {
        stroke: "white",
        fill: "white",
      },
      touchPosition: {},
    };
  },

  mounted() {
    this.initialize();
    this.game = setInterval(this.update, 20);
  },

  unmounted() {
    this.$emit("move", "idle");
  },

  methods: {
    initialize() {
      this.configBase.x = this.position.x;
      this.configBase.y = this.position.y;
      this.configStick.x = this.position.x;
      this.configStick.y = this.position.y;
      this.touchPosition.x = this.position.x;
      this.touchPosition.y = this.position.y;
      this.configBase.radius = this.radius;
      this.configStick.radius = this.radius / 3;
    },
    update() {
      this.moveStick();
      this.getDirection();
    },
    getTouchPosition(e) {
      this.touchPosition = e.target.getStage().getPointerPosition();
    },
    moveStick() {
      this.configStick.x = this.touchPosition.x;
      this.configStick.y = this.touchPosition.y;
    },
    getDirection() {
      if (
        this.configStick.x -
          this.position.x -
          (this.configStick.y - this.position.y) <
          0 &&
        this.configStick.x -
          this.position.x +
          (this.configStick.y - this.position.y) <
          0
      ) {
        this.$emit("move", "left");
      } else if (
        this.configStick.x -
          this.position.x -
          (this.configStick.y - this.position.y) >
          0 &&
        this.configStick.x -
          this.position.x +
          (this.configStick.y - this.position.y) >
          0
      ) {
        this.$emit("move", "right");
      } else if (
        this.configStick.x -
          this.position.x -
          (this.configStick.y - this.position.y) >
          0 &&
        this.configStick.x -
          this.position.x +
          (this.configStick.y - this.position.y) <
          0
      ) {
        this.$emit("move", "up");
      } else if (
        this.configStick.x -
          this.position.x -
          (this.configStick.y - this.position.y) <
          0 &&
        this.configStick.x -
          this.position.x +
          (this.configStick.y - this.position.y) >
          0
      ) {
        this.$emit("move", "down");
      }
    },
  },
};
</script>
