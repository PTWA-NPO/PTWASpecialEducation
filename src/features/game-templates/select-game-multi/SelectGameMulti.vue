<template>
  <div class="Outter">
    <div v-if="gameData.TopContainer !== undefined" class="TopContainer">
      <component
        :is="gameData.TopContainer.Name"
        :component-config="gameData.TopContainer.Data"
        :game-id="gameId"
      />
    </div>

    <div v-if="gameData.SlotComponent !== undefined" class="ComponentArea Rect">
      <component
        :is="gameData.SlotComponent.Name"
        :game-id="gameId"
        :component-config="gameData.SlotComponent.Data"
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
              :is="gameData.SelectionType"
              :game-id="gameId"
              :component-config="Selection"
            />
          </div>
        </div>
      </div>
    </transition>
    <!-- 送出答案按鈕已移至 SideBar -->
    <button v-if="nextable" class="SubmitAnswer" @click="nextQuestion">
      下一題
    </button>
    <!-- <div class="error-messeage" >
        <p>請將所有答案作答完成</p>
        <p>答案錯誤，請再試一次</p>
    </div> -->
  </div>
</template>

<script>
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "SelectGameMulti",
  components: {
    TextOnly: getComponents("TextOnly"),
    ImageContainer: getComponents("ImageContainer"),
    DragImages: getComponents("DragImages"),
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameId: {
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
      nextable: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.gameData.Questions[this.currentQuestionIndex];
    },
  },
  created() {
    Array.from({ length: this.gameData.Questions.length }).forEach(() => {
      this.SelectionRecord.push(null);
    });
    emitter.on("submitAnswer", this.submitSingleAnswer);
  },
  mounted() {
    const Container = document.getElementsByClassName("Container")[0];
    console.log(Container);
    if (this.gameData.SlotComponent === undefined) {
      Container.style.gridTemplateColumns = "1fr";
    }
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.submitSingleAnswer);
  },
  methods: {
    SelectItem(index, selection) {
      this.SelectionRecord[index] = selection;
      this.error = undefined;
    },
    submitSingleAnswer() {
      console.log(this.SelectionRecord[this.currentQuestionIndex]);
      console.log(this.gameData.Questions[this.currentQuestionIndex].Answer);
      if (
        this.SelectionRecord[this.currentQuestionIndex] ===
        this.gameData.Questions[this.currentQuestionIndex].Answer
      ) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex}題答案 ${
            this.gameData.Questions[this.currentQuestionIndex].Answer
          }`,
          `回答${this.SelectionRecord[this.currentQuestionIndex]}`,
          "正確",
        ]);
        if (this.currentQuestionIndex < this.gameData.Questions.length - 1) {
          this.nextable = true;
        } else {
          this.nextable = false;
          this.$emit("next-question");
        }
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          `第 ${this.currentQuestionIndex}題答案 ${
            this.gameData.Questions[this.currentQuestionIndex].Answer
          }`,
          `回答${this.SelectionRecord[this.currentQuestionIndex]}`,
          "錯誤",
        ]);
      }
    },
    splitQuestion(question) {
      return question.split(/(\$question\$)/g);
    },
    isPlaceHolder(part) {
      return part === "$question$";
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.gameData.Questions.length - 1) {
        this.transitionName = "slide-left";
        this.currentQuestionIndex++;
      }
      this.nextable = false;
    },
  },
};
</script>
<style scoped lang="scss">
.Outter {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .SubmitAnswer {
    width: 13rem;
    height: 4rem;
    border-radius: 15px;
    background-color: $submit-color;
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
  height: 65%;
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
      background-color: white;
      border: 2px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 80px;
      text-align: center;
      display: inline-block;
      margin: 0 5px;

      &:hover {
        background-color: #e9e9e9;
      }

      &.selected-component {
        border-color: $hyperlink-color;
        background-color: $success-color;
        color: white;
      }
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
