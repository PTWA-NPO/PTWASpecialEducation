<template>
  <div class="Outter">
    <div v-if="GameData.TopContainer != undefined" class="TopContainer">
      <component
        :is="GameData.TopContainer.Name"
        :Data="GameData.TopContainer.Data"
        :ID="ID"
      />
    </div>

    <div v-if="GameData.SlotComponent != undefined" class="ComponentArea Rect">
      <component
        :is="GameData.SlotComponent.Name"
        :ID="ID"
        :Data="GameData.SlotComponent.Data"
      />
    </div>
    <transition :name="transitionName" mode="out-in">
      <div :key="currentQuestionIndex" class="Question">
        <div
          v-for="(item, partIndex) in splitQuestion(currentQuestion.Question)"
          :key="partIndex"
          class="part-container"
        >
          <p v-if="!isPlaceHolder(item)">
            {{ item }}
          </p>
          <div
            v-for="(Selection, itemIndex) in currentQuestion.Selection"
            v-else
            :key="itemIndex"
            class="select-component"
            :class="{
              'selected-component':
                SelectionRecord[currentQuestionIndex] === itemIndex,
            }"
            @click="SelectItem(currentQuestionIndex, itemIndex)"
          >
            <component
              :is="GameData.SelectionType"
              :ID="id"
              :Data="Selection"
            />
          </div>
        </div>
      </div>
    </transition>
    <div class="function-btns">
      <!-- <button @click="prevQuestion" class="SubmitAnswer" v-if="currentQuestionIndex != 0">上一題</button> -->
      <!-- <button @click="nextQuestion" class="SubmitAnswer" v-if="currentQuestionIndex != this.currentQuestion.Selection.length -1">下一題</button> -->
      <!-- <button @click="CheckAnswer" class="SubmitAnswer">送出答案</button> -->

      <button class="SubmitAnswer" @click="submitSingleAnswer">送出答案</button>
      <button v-if="nextable" class="SubmitAnswer" @click="nextQuestion">
        下一題
      </button>
    </div>
    <!-- <div class="error-messeage" >
        <p>請將所有答案作答完成</p>
        <p>答案錯誤，請再試一次</p>
    </div> -->
  </div>
</template>

<script>
import { getComponents } from "@/utilitys/get_components";
export default {
  name: "SelectGameMulti",
  components: {
    TextOnly: getComponents("TextOnly"),
    ImageContainer: getComponents("ImageContainer"),
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
      SelectionRecord: [],
      currentQuestionIndex: 0,
      transitionName: "slide-right",
      error: undefined,
      submitAnswerAmount: 0,
      nextable: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.GameData.Questions[this.currentQuestionIndex];
    },
  },
  created() {
    for (var i in this.GameData.Questions) {
      this.SelectionRecord.push(null);
    }
  },
  mounted() {
    let Container = document.getElementsByClassName("Container")[0];
    console.log(Container);
    if (this.GameData.SlotComponent == undefined) {
      Container.style.gridTemplateColumns = "1fr";
    }
  },
  methods: {
    SelectItem(index, selection) {
      this.SelectionRecord[index] = selection;
      this.error = undefined;
    },
    submitSingleAnswer() {
      console.log(this.SelectionRecord[this.currentQuestionIndex]);
      console.log(this.GameData.Questions[this.currentQuestionIndex].Answer);
      let isCorrect = true;
      if (
        this.SelectionRecord[this.currentQuestionIndex] ==
        this.GameData.Questions[this.currentQuestionIndex].Answer
      ) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex}題答案 ${
            this.GameData.Questions[this.currentQuestionIndex].Answer
          }`,
          `回答${this.SelectionRecord[this.currentQuestionIndex]}`,
          "正確",
        ]);
        if (this.currentQuestionIndex < this.GameData.Questions.length - 1) {
          this.nextable = true;
        } else {
          this.nextable = false;
          this.$emit("next-question");
        }
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex}題答案 ${
            this.GameData.Questions[this.currentQuestionIndex].Answer
          }`,
          `回答${this.SelectionRecord[this.currentQuestionIndex]}`,
          "錯誤",
        ]);
      }
    },
    CheckAnswer() {
      let isCorrect = true;
      let Answers = [];
      let notFinish = false;
      this.submitAnswerAmount++;
      for (var i in this.selectionRecord) {
        if (this.selectionRecord[i] == null) {
          this.error = "請將所有答案作答完成";
          this.$emit("play-effect", "WrongSound");
          this.$emit("add-record", [
            `第${this.submitAnswerAmount}送出答案`,
            `第${i + 1}題未作答`,
            "錯誤",
          ]);
        }
      }
      for (var i in this.GameData.Questions) {
        Answers.push(this.GameData.Questions[i].Answer);
        if (this.SelectionRecord[i] != this.GameData.Questions[i].Answer) {
          isCorrect = false;
          this.$emit("add-record", [
            `第${this.submitAnswerAmount}送出答案`,
            `第${i + 1}題錯誤`,
            "錯誤",
          ]);
          this.error = "答案錯誤，請再試一次";
        }
      }
      if (isCorrect) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          `第${this.submitAnswerAmount}次送出答案`,
          "",
          "所有答案正確",
        ]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [Answers, this.SelectionRecord, "錯誤"]);
      }
    },
    splitQuestion(question) {
      return question.split(/(\$question\$)/g);
    },
    isPlaceHolder(part) {
      return part === "$question$";
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.GameData.Questions.length - 1) {
        this.transitionName = "slide-left";
        this.currentQuestionIndex++;
      }
      this.nextable = false;
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.transitionName = "slide-right";
        this.currentQuestionIndex--;
      }
    },
  },
};
</script>
<style scoped lang="scss">
.Outter {
  display: flex;
  flex-direction: column;
  .SubmitAnswer {
    width: 13rem;
    height: 4rem;
    border-radius: 15px;
    background-color: #ffbe0b;
    scale: 1;
    transition: 0.5s;
    font-size: 1.5rem;
    align-self: flex-end;
    margin: 0 1rem;
  }
  .TopContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
  }
}
.Rect {
  border: solid 1px;
  margin: 0 1rem;
  border-radius: 15px;
}
.ComponentArea {
  padding: $gap--tiny;
  display: flex;
  height: 40vh;
}
.Questions {
  width: 30%;
  display: flex;
  flex-direction: row;
}
/* .Container .single-column {
    grid-template-columns: 1fr;
} */

.Question {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0.5rem 0;
  border-radius: 15px;
  border: solid 3px #aaa;
  p {
    text-align: center;
    font-size: x-large;
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: 15px;
  }
  .part-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 5rem;
    .select-component {
      min-width: 4rem;
      border: none;
      margin: 0.5rem;
      border-radius: 15px;
      padding: 0.5rem;
      cursor: pointer;
      scale: 1;
      transition: 0.3s;
    }
    .select-component:hover {
      scale: 1.07;
      transition: 0.3s;
    }
    .selected-component {
      border: solid 3px blue;
      scale: 1.07;
    }
  }
}

.Question {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
  //   position: absolute;
  width: 100%;
}

.slide-left-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave,
.slide-right-enter-to,
.slide-right-leave {
  transform: translateX(0%);
}
</style>
