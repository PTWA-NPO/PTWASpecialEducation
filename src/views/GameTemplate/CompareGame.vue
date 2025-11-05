<template>
  <div class="OutterContainer">
    <div class="Head">
      <p
        v-if="gameData.QuestionText && gameData.QuestionText !== ''"
        class="h1 Title"
      >
        {{ gameData.QuestionText }}
      </p>
      <p
        v-if="gameData.Description && gameData.Description !== ''"
        class="h2 SubTitle"
      >
        {{ gameData.Description }}
      </p>
    </div>
    <hr />
    <div class="QuestionArea">
      <div
        v-for="(item, index) in gameData.Datas"
        :key="index"
        class="QuestionContainer"
      >
        <section
          class="QuestionRow"
          :class="{
            'QuestionRow-Wrong': Answered[index] === false,
            'QuestionRow-Right': Answered[index] === true,
          }"
        >
          <div class="CompareCard Left">
            <component
              :is="item[0].Name"
              :component-data="item[0].Data"
              :game-id="gameId"
              @reply-answer="SlotComponentReplyAnswer(0, $event)"
            />
          </div>
          <div class="SymbolContainer">
            <draggable
              :list="Answers[index]"
              group="Symbols"
              :sort="false"
              item-key="name"
              class="CompareSymbol"
              @change="Add(index)"
              @add="CheckDrop"
            >
              <template #item="{ element }">
                <div class="clickable Options">
                  <p class="h1">
                    {{ element.Text }}
                  </p>
                </div>
              </template>
            </draggable>
          </div>
          <div class="CompareCard Right">
            <component
              :is="item[1].Name"
              :component-data="item[1].Data"
              :game-id="gameId"
              @reply-answer="SlotComponentReplyAnswer(1, $event)"
            />
          </div>
        </section>
      </div>
    </div>
    <section class="OptionBar">
      <div class="Left">
        <draggable
          :list="Symbol"
          :sort="false"
          item-key="name"
          :group="{ name: 'Symbols', pull: 'clone', put: false }"
          class="Options"
        >
          <template #item="{ element }">
            <div class="OptionBarItems clickable">
              <p class="h1">
                {{ element.Text }}
              </p>
            </div>
          </template>
        </draggable>
      </div>
      <!-- <button
        v-if="gameConfig.CheckAnswerMode === 'Button'"
        class="SucessButton"
        @click="CheckAllAnswer"
      >
        送出答案
      </button> -->
      <!-- <button @click="Triger" class="btn btn-primary">Triger</button> -->
    </section>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { defineAsyncComponent } from "vue";
import { getComponents } from "@/lib/get-components.js";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "CompareGame",
  components: {
    draggable,
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    ImageWithText: defineAsyncComponent(
      () => import("@/components/ImageWithText.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    CoulorBarChart: getComponents("CoulorBarChart"),
    CircleChart: getComponents("CircleChart"),
    ImageTable: getComponents("ImageTable"),
    DrawImage: getComponents("DrawImage"),
    NumberBoard: getComponents("NumberBoard"),
    FractionDisplay: getComponents("FractionDisplay"),
  },
  props: {
    gameData: {
      type: Object,
      required: true,
    },
    gameConfig: {
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
      SelectedGroup: 0,
      TotalQuestion: null,
      Answered: [],
      Answers: [],
      ImageDatas: [],
      Symbol: [],
      SlotComponentanswer: ["", ""], // Two SubComponents
      BSESymbol: [
        {
          tag: "Big",
          Text: ">",
        },
        {
          tag: "Small",
          Text: "<",
        },
        {
          tag: "Equal",
          Text: "=",
        },
      ],
    };
  },
  created() {
    this.TotalQuestion = this.gameData.Datas.length;
    this.gameData.Datas.forEach(() => {
      this.Answered.push(null);
      this.Answers.push([]);
      const TempImg = [];
      this.ImageDatas.push(TempImg);
    });
    this.Symbol = this.BSESymbol;
    emitter.on("submitAnswer", this.CheckAllAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.CheckAllAnswer);
  },
  methods: {
    Add(index) {
      console.log("check drop");
      this.SelectedGroup = index;
      console.log(this.SelectedGroup);
    },
    CheckDrop(newVal) {
      console.log(newVal.newIndex);
      const tmp = this.Answers[this.SelectedGroup][newVal.newIndex];
      this.Answers[this.SelectedGroup] = [tmp];
      this.RealTimeCheckAnswer();
      if (this.gameConfig.CheckAnswerMode !== "OnFill") {
        this.Answered[this.SelectedGroup] = null;
      }
    },
    RealTimeCheckAnswer() {
      if (this.gameConfig.CheckAnswerMode === "OnFill") {
        if (
          this.gameData.Answer[this.SelectedGroup] ===
          this.Answers[this.SelectedGroup][0].tag
        ) {
          this.$emit("play-effect", "CorrectSound");
          this.Answered[this.SelectedGroup] = true;
        } else {
          this.Answered[this.SelectedGroup] = false;
          this.$emit("play-effect", "WrongSound");
        }
        if (this.CheckAnsweredAll()) {
          // this.$emit('play-effect', 'Harray',)
          console.log("All Answered");
          // this.$emit('next-question');
        }
      }
    },
    CheckAnsweredAll() {
      for (const i in this.Answered) {
        if (this.Answered[i] === false || this.Answered[0][i] === null) {
          return false;
        }
      }
      return true;
    },
    CheckAllAnswer() {
      let check = true;
      for (const i in this.gameData.Answer) {
        if (this.gameData.Answer[i] === this.Answers[i][0].tag) {
          //FIXME: UnEfficient
          this.Answered[i] = true;
        } else {
          this.Answered[i] = false;
          check = false;
        }
      }
      if (this.gameData.SlotComponentVerifycation === true) {
        // Check if the SlotComponent is correct
        let temp = true;
        this.SlotComponentanswer.forEach((element) => {
          if (element !== true) {
            temp = false;
          }
        });
        console.log("Temp", temp);
        if (temp === false) {
          check = false;
        }
      }
      if (check === false) {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.Answer[0],
          this.Answers[0][0].tag,
          "錯誤",
        ]);
      } else {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.gameData.Answer[0],
          this.Answers[0][0].tag,
          "正確",
        ]);
        this.$emit("next-question");
      }
    },
    SlotComponentReplyAnswer(index, answer) {
      this.SlotComponentanswer[index] = answer;
    },
  },
};
</script>

<style scoped lang="scss">
.Head {
  width: 100%;
  padding-left: 2rem;
  .Title {
    font-size: 2rem;
  }
  .SubTitle {
    font-size: 1.5rem;
  }
}
.QuestionRow-Wrong {
  background-color: #cc0627c6;
}
.QuestionRow-Right {
  background-color: rgba(255, 255, 255, 1);
}
.OutterContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  .QuestionArea {
    width: 100%;
    .QuestionContainer {
      .QuestionRow {
        /* display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                align-items: center; */
        display: grid;
        grid-template-columns: 0.5fr 4fr 1fr 4fr 0.5fr;
        height: 40vh;
        .Options {
          background-color: #fff;
        }
        .Left {
          grid-column: 2/3;
        }
        .Right {
          grid-column: 4/5;
        }
        .CompareCard {
          border: solid 3px #aaa;
          border-radius: 20px;
          component {
            width: 100%;
            height: 100%;
          }
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }
        .SymbolContainer {
          display: flex;
          justify-content: center;
          align-items: center;
          .CompareSymbol {
            grid-column: 3/4;
            margin: 2em;
            width: 7rem;
            height: 5rem;
            border: solid 3px #aaa;
            border-radius: 12px;
            border-color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem 1rem;
          }
        }
      }
    }
  }
}
.clickable {
  cursor: pointer;
  border: solid 2px #aaa;
  border-radius: 12px;
  width: 5rem;
  text-align: center;
}
.OptionBar {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0 2rem;
  gap: 2rem;
  .Left {
    width: 60%;
    margin: 0 2rem;
    .Options {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 2rem;
      .OptionBarItems {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
      }
    }
  }
  .SucessButton {
    padding: 1rem;
    width: 40%;
    background-color: $submit-color;
    border: none;
    border-radius: 12px;
    font-size: x-large;
  }
}
:deep(.number-board-container) {
  height: 70%;
  width: 90%;
  font-size: 1.2rem;
}
</style>
