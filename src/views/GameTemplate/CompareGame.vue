<template>
  <div class="OutterContainer">
    <div class="Head">
      <p
        v-if="GameData.QuestionText && GameData.QuestionText != ''"
        class="h1 Title"
      >
        {{ GameData.QuestionText }}
      </p>
      <p
        v-if="GameData.Description && GameData.Description != ''"
        class="h2 SubTitle"
      >
        {{ GameData.Description }}
      </p>
    </div>
    <hr />
    <div class="QuestionArea">
      <div
        v-for="(item, index) in GameData.Datas"
        :key="index"
        class="QuestionContainer"
      >
        <section
          class="QuestionRow"
          :class="{
            'QuestionRow-Wrong': Answered[index] == false,
            'QuestionRow-Right': Answered[index] == true,
          }"
        >
          <div class="CompareCard Left">
            <component
              :is="item[0].Name"
              :Data="item[0].Data"
              :ID="ID"
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
              :Data="item[1].Data"
              :ID="ID"
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
      <button
        v-if="GameConfig.CheckAnswerMode == 'Button'"
        class="SucessButton"
        @click="CheckAllAnswer"
      >
        檢查答案
      </button>
      <!-- <button @click="Triger" class="btn btn-primary">Triger</button> -->
    </section>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { defineAsyncComponent } from "vue";
import { GetComponents } from "@/utilitys/get-components.js";
export default {
  name: "CompareGame",
  components: {
    draggable,
    ImageContainer: defineAsyncComponent(() =>
      import("@/components/ImageContainer.vue")
    ),
    ImageWithText: defineAsyncComponent(() =>
      import("@/components/ImageWithText.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    CoulorBarChart: GetComponents("CoulorBarChart"),
    CircleChart: GetComponents("CircleChart"),
    ImageTable: GetComponents("ImageTable"),
    DrawImage: GetComponents("DrawImage"),
    NumberBoard: GetComponents("NumberBoard"),
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
      a: "",
      SelectedGroup: 0,
      TotalQuestion: null,
      Answered: [],
      Answers: [],
      Ans1: [],
      Ans2: [],
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
    this.TotalQuestion = this.GameData.Datas.length;
    for (var i in this.GameData.Datas) {
      this.Answered.push(null);
      this.Answers.push([]);
      let TempImg = [];
      this.ImageDatas.push(TempImg);
    }
    this.Symbol = this.BSESymbol;
  },
  methods: {
    Triger() {
      this.$emit("play-effect", "IncorrectAnimation");
    },
    Add(index) {
      console.log("check drop");
      this.SelectedGroup = index;
      console.log(this.SelectedGroup);
    },
    CheckDrop(newVal) {
      console.log(newVal.newIndex);
      let tmp = this.Answers[this.SelectedGroup][newVal.newIndex];
      this.Answers[this.SelectedGroup] = [tmp];
      this.RealTimeCheckAnswer();
      if (this.GameConfig.CheckAnswerMode != "OnFill") {
        this.Answered[this.SelectedGroup] = null;
      }
    },
    RealTimeCheckAnswer() {
      if (this.GameConfig.CheckAnswerMode == "OnFill") {
        if (
          this.GameData.Answer[this.SelectedGroup] ==
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
      for (var i in this.Answered) {
        if (this.Answered[i] == false || this.Answered[0][i] == null) {
          return false;
        }
      }
      return true;
    },
    CheckAllAnswer() {
      let check = true;
      for (var i in this.GameData.Answer) {
        if (this.GameData.Answer[i] == this.Answers[i][0].tag) {
          //FIXME: UnEfficient
          this.Answered[i] = true;
        } else {
          this.Answered[i] = false;
          check = false;
        }
      }
      if (this.GameData.SlotComponentVerifycation == true) {
        // Check if the SlotComponent is correct
        let temp = true;
        let cnt = 0;
        this.SlotComponentanswer.forEach((element) => {
          if (element != true) {
            temp = false;
          }
          cnt++;
        });
        console.log("Temp", temp);
        if (temp == false) {
          check = false;
        }
      }
      if (check == false) {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.Answer[0],
          this.Answers[0][0].tag,
          "錯誤",
        ]);
      } else {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.GameData.Answer[0],
          this.Answers[0][0].tag,
          "正確",
        ]);
        this.$emit("next-question");
      }
    },
    ClearAllData() {
      for (var i in this.Answered) {
        this.Answers[i][0] = null;
        this.Answers[i][1] = null;
        this.Answered[i] = null;
        this.Answers[i] = [];
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
    background-color: #3a86ff;
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
