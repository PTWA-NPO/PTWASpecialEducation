<template>
  <div
    v-if="GameStatus == 'Progressing'"
    class="row levelbutton d-sm-none d-md-block d-none d-sm-block"
  >
    <div class="d-grid gap-2 d-flex justify-content-center mb-3 levebar">
      <button
        type="button"
        class="btn btn-primary flex-fill text-nowrap"
        disabled
      >
        關卡
      </button>
      <div
        v-for="(i, key) in questions"
        :key="key"
        class="grid-item flex-fill d-flex justify-content-between"
      >
        <button
          type="button"
          class="btn btn-success flex-fill"
          :class="{ active: Nowlevel == key + 1 }"
          @click="changelevel(key + 1)"
        >
          {{ key + 1 }}
        </button>
      </div>
      <button
        v-if="GameStatus == 'Progressing'"
        type="button"
        class="btn btn-primary flex-fill text-nowrap"
        disabled
      >
        時間 : {{ time }}
      </button>
      <button
        v-if="GameStatus == 'Progressing'"
        type="button"
        class="btn btn-primary flex-fill text-nowrap"
        disabled
      >
        總計時間 : {{ totaltime }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapWritableState } from "pinia";
import gameStore from "@/stores/game";

export default {
  props: {
    time: {
      type: Number,
      required: true,
    },
    totaltime: {
      type: Number,
      required: true,
    },
    questions: {
      type: Array,
      required: true,
    },
  },
  emits: ["pauseTimer", "resetTimer", "startTimer", "resetWrongTimer"],
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(gameStore, [
      "transitionName",
      "GameStatus",
      "Nowlevel",
    ]),
  },
  methods: {
    changelevel(change2level) {
      this.resetWrongTimes();
      if (change2level > this.questions.length || change2level < 1) {
        console.log("The level is out of range");
      } else {
        if (this.Nowlevel > change2level) {
          this.transitionName = "slide-right";
        } else if (this.Nowlevel < change2level) {
          this.transitionName = "slide-left";
        }
        this.Nowlevel = change2level;
        this.pauseTimer();
        //FIXME 傳資料進入CSV
        this.resetTimer();
        this.startTimer();
      }
    },
    pauseTimer() {
      this.$emit("pauseTimer");
    },
    resetTimer() {
      this.$emit("resetTimer");
    },
    startTimer() {
      this.$emit("startTimer");
    },
    resetWrongTimes() {
      this.$emit("resetWrongTimer");
    },
  },
};
</script>

<style scoped lang="scss">
.levebar {
  // overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
