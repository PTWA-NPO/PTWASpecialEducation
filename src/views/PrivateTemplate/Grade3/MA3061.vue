<template>
  <div class="game">
    <DragToAlign
      :Data="configDragToAlign"
      :ID="ID"
      class="game__drag-to-align game--border"
    >
    </DragToAlign>
    <div class="qestion-and-submit">
      <Markdown
        class="game__qestion"
        :Data="markdownData"
        @ReplyAnswer="updataAnswer"
      ></Markdown>
      <button class="game__submit" @click="submit">送出答案</button>
    </div>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import Markdown from "@/components/Markdown.vue";
export default {
  name: "MA3061",
  components: {
    DragToAlign: defineAsyncComponent(() =>
      import("@/components/DragToAlign.vue")
    ),
    Markdown,
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
  emits: [
    "add-record",
    "play-effect",
    "next-question",
    "WrongSound",
    "CorrectSound",
  ],
  data() {
    return {
      configDragToAlign: this.GameData.DragToAlign,
      markdownData: this.GameData.markdown,
      userAnswer: false,
    };
  },
  methods: {
    updataAnswer(answer) {
      this.userAnswer = answer;
      // console.log(this.userAnswer);
    },
    submit() {
      if (this.userAnswer === true) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `正確`]);
        this.$emit("next-question", true);
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", ["不支援顯示", "不支援顯示", `正確`]);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.game {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: $gap--tiny;
  &__drag-to-align {
    display: flex;
    width: 40%;
  }
  &--border {
    border: 2px black solid;
    border-radius: $border-radius;
  }
  &__submit {
    border: none;
    background-color: #aabdc3;
    height: 4rem;
  }
}

.qestion-and-submit {
  display: flex;
  flex-direction: column;
  gap: $gap--tiny;
}

// .drag-to-align {
//   display: flex;
//   width: 40%;
// }
</style>
