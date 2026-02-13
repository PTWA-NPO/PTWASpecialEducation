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
                <component
                  :is="element.Name"
                  :component-config="element.Data"
                  :game-id="gameId"
                />
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div class="QuestionArea">
        <p class="Title">答案區</p>
        <div v-for="(pair, index) in gameData.Pairs" :key="index" class="Pair">
          <div class="Answer" :class="{ False: FalseOption[index] === true }">
            <draggable
              :list="AnswersNew[index]"
              item-key="Tag"
              group="Answer"
              @change="PoplastAdd(index)"
            >
              <template #item="{ element }">
                <div class="dragable">
                  <component
                    :is="element.Name"
                    :component-config="element.Data"
                    :game-id="gameId"
                  />
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
    <!-- <button class="Submit" type="button" @click="CheckAnswer">送出答案</button> -->
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import { getComponents } from "@/lib/get-components.js";
import draggable from "vuedraggable";
import { subComponentsVerifyAnswer as emitter } from "@/lib/mitt.js";
export default {
  name: "PairingGame",
  components: {
    draggable,
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
    ),
    ImageWithText: defineAsyncComponent(
      () => import("@/components/ImageWithText.vue")
    ),
    TextOnly: defineAsyncComponent(() => import("@/components/TextOnly.vue")),
    AnalogClock: getComponents("AnalogClock"),
    WaterDisplay: getComponents("WaterDisplay"),
    ElectronicClock: defineAsyncComponent(
      () => import("@/components/ElectronicClock.vue")
    ),
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
      Selections: [],
      Question: [],
      AnswersOld: [],
      AnswersNew: [],
      FalseOption: [],
    };
  },
  created() {
    this.Selections = this.gameData.Properties;
    this.Question = this.gameData.Pairs.map((pair) => pair.Question);
    for (let i = 0; i < this.gameData.Pairs.length; i++) {
      this.AnswersNew.push([]);
      this.AnswersOld.push([]);
    }
    emitter.on("submitAnswer", this.CheckAnswer);
  },
  beforeUnmount() {
    emitter.off("submitAnswer", this.CheckAnswer);
  },
  methods: {
    PoplastAdd(index) {
      const Tar = this.AnswersOld[index][0];
      this.FalseOption[index] = false;
      console.log(Tar);
      if (this.AnswersNew[index].length > 1) {
        for (const i in this.AnswersNew[index]) {
          if (this.AnswersNew[index][i].Tag === Tar.Tag) {
            if (i === 0) {
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
      for (let i = 0; i < this.FalseOption.length; i++) {
        this.FalseOption[i] = false;
      }
      for (let j = 0; j < this.gameData.Pairs.length; j++) {
        if (this.gameData.Pairs[j].Answer !== this.AnswersNew[j][0].Tag) {
          AnswerCheck = false;
          this.FalseOption[j] = true;
        }
      }
      if (AnswerCheck) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [
          this.gameData.Pairs,
          this.AnswersNew,
          "正確",
        ]);
        this.$emit("next-question");
      } else {
        console.log("Wrong");
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.gameData.Pairs,
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
    background-color: $submit-color;
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
