<template>
  <div class="container">
    <h1>{{ GameData.Question.text }}</h1>
    <hr />
    <draggable :key="options[0]" :list="options" group="Sentense">
      <template #item="{ element }">
        <button type="button" class="btn btn-primary m-1 my-btn">
          {{ element }}
        </button>
      </template>
    </draggable>
    <br />
    <hr />
    <button
      type="button"
      class="btn btn-primary btn-lg btn-block"
      @click="CheckAnswer()"
    >
      送出答案
    </button>
  </div>
</template>

<script>
import draggable from "vuedraggable";
export default {
  name: "SortGame",
  components: {
    draggable,
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
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      QuestionWord: "",
      options: [],
      show: false,
      question: null,
      // answer: null
    };
  },
  created() {
    this.UpdateQuestion();
    // setInterval(this.IntervalCheckUpdate, 500);
  },
  mounted() {},
  methods: {
    UpdateQuestion() {
      this.answer = this.GameData.Answer;
      this.question = this.GameData.Question.options;
      this.RandomtheList();
      let randed = this.Checkrand();
      while (randed == false) {
        this.RandomtheList();
        randed = this.Checkrand();
      }
      this.options = [];
      for (var i in this.question) {
        this.options.push(this.question[i]);
      }
      console.log(this.question, this.options, this.answer);
    },
    RandomtheList() {
      this.question.sort(() => Math.random() - 0.5);
    },
    Checkrand() {
      let list1 = "";
      let list2 = "";
      for (var i in this.question) {
        list1 += this.question[i];
      }
      for (var i in this.answer) {
        list2 += this.answer[i];
      }
      if (list1 == list2) {
        return false;
      } else {
        return true;
      }
    },
    CheckAnswer() {
      var AnswerCheck = true;
      for (var i in this.answer) {
        if (this.answer[i] != this.options[i]) {
          AnswerCheck = false;
        }
      }
      if (AnswerCheck == true) {
        console.log("SortGame ChenckAnswer: Right");
        this.show = false;
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.GameData.Answer, this.options, "正確"]);
        this.$emit("next-question");
        setTimeout(this.UpdateQuestion, 100);
        this.UpdateQuestion();
      } else {
        console.log("SortGame ChenckAnswer: Wrong");
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.answer, this.options, "錯誤"]);
        this.UpdateQuestion();
      }
    },
  },
};
</script>
<style scoped lang="scss">
.card {
  min-height: 75px;
}
.my-btn {
  font-size: 2rem; /* 這裡可以調整文字大小 */
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* align-items: center; */
  align-self: center;
}
</style>
