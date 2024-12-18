<template>
  <div class="Outter">
    <div class="Container">
      <div class="Selection">
        <p class="Title">選項區</p>
        <div class="DragElement">
          <draggable
            :list="Selections"
            item-key="Tag"
            group="Answer"
            class="InnerComponent"
          >
            <template #item="{ element }">
              <div class="dragable">
                <component :is="element.Name" :Data="element.Data" :ID="ID" />
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div class="QuestionArea">
        <p class="Title">答案區</p>
        <div v-for="(pair, index) in GameData.Pairs" class="Pair">
          <div class="Answer" :class="{ False: FalseOption[index] == true }">
            <draggable
              :list="AnswersNew[index]"
              item-key="Tag"
              group="Answer"
              @change="PoplastAdd(index)"
            >
              <template #item="{ element }">
                <div class="dragable">
                  <component :is="element.Name" :Data="element.Data" :ID="ID" />
                </div>
              </template>
            </draggable>
          </div>
          <div class="Question">
            {{ pair.Question }}
          </div>
        </div>
      </div>
    </div>
    <button class="Submit" type="button" @click="CheckAnswer">送出答案</button>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import { getComponents } from "@/utilitys/get-components";
import draggable from "vuedraggable";
export default {
  name: "PairingGame",
  components: {
    draggable,
    ImageContainer: defineAsyncComponent(() =>
      import("@/components/ImageContainer.vue")
    ),
    ImageWithText: defineAsyncComponent(() =>
      import("@/components/ImageWithText.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    Clock: getComponents("Clock"),
    Water: defineAsyncComponent(() => import("@/components/Water.vue")),
    ElectronicClock: defineAsyncComponent(() =>
      import("@/components/ElectronicClock.vue")
    ),
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
      Selections: [],
      Question: [],
      AnswersOld: [],
      AnswersNew: [],
      FalseOption: [],
    };
  },
  created() {
    this.Selections = this.GameData.Properties;
    this.Question = this.GameData.Pairs.map((pair) => pair.Question);
    for (var i in this.GameData.Pairs) {
      this.AnswersNew.push([]);
      this.AnswersOld.push([]);
    }
  },
  mounted() {
    // Code to run when the component is mounted goes here
  },
  methods: {
    // Your methods go here
  },
  methods: {
    PoplastAdd(index) {
      let Tar = this.AnswersOld[index][0];
      this.FalseOption[index] = false;
      console.log(Tar);
      if (this.AnswersNew[index].length > 1) {
        for (var i in this.AnswersNew[index]) {
          if (this.AnswersNew[index][i].Tag == Tar.Tag) {
            if (i == 0) {
              this.Selections.push(this.AnswersNew[index][0]);
              this.AnswersNew[index] = [this.AnswersNew[index][1]];
            } else {
              this.Selections.push(this.AnswersNew[index][1]);
              this.AnswersNew[index] = [this.AnswersNew[index][0]];
            }
          }
        }
      }
      this.AnswersOld = this.AnswersNew;
    },
    CheckAnswer() {
      let AnswerCheck = true;
      for (var i in this.FalseOption) {
        this.FalseOption[i] = false;
      }
      for (var i in this.GameData.Pairs) {
        if (this.GameData.Pairs[i].Answer != this.AnswersNew[i][0].Tag) {
          AnswerCheck = false;
          this.FalseOption[i] = true;
        }
      }
      if (AnswerCheck) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.GameData.Pairs,
          this.AnswersNew,
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        console.log("Wrong");
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.Pairs,
          this.AnswersNew,
          "錯誤",
        ]);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.dragable {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.False {
  border: solid 3px red !important;
}
.Outter {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .Submit {
    margin: 0.8rem 0;
    padding: 1rem 1rem;
    border: solid;
    border-radius: 15px;
    background-color: white;
    font-size: 1.5rem;
    align-self: flex-end;
  }
}
.Title {
  font-size: 1.5rem;
  align-self: start;
  padding: 1rem 1rem;
  border: solid;
  border-radius: 15px;
  position: relative;
  top: -1.5rem;
  left: 1rem;
  background-color: white;
  margin: 0;
}
.Container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 1.8rem;
  .Selection {
    border: solid 3px #aaa;
    width: 20%;
    display: flex;
    flex-direction: column;
    border-radius: 15px;
    .DragElement {
      display: flex;
      flex-direction: column;
      align-items: center;
      .InnerComponent {
        display: flex;
        flex-direction: column;
        // display: grid;
        // grid-template-rows: 1fr;
        gap: 0.5rem;
        width: 100%;
        .dragable {
          flex: 1;
          max-height: 100px;
          border: solid 3px #aaa;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
  .QuestionArea {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    border: solid 3px #aaa;
    border-radius: 15px;
    width: 75%;
    .Pair {
      width: 90%;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      // margin: 1rem 0;
      .Answer {
        width: 25%;
        border: solid 3px #000;
        border-radius: 15px;
        height: 90% !important;
        max-height: 125px !important;
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100% !important;
        }
      }
      .Question {
        padding: 1rem 1rem;
        width: 70%;
        font-size: 2rem;
        border: solid 3px #aaa;
        border-radius: 15px;
        height: 90%;
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
      }
    }
  }
}
</style>
