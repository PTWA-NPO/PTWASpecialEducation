<template>
  <div class="Container container">
    <div class="index">
      <p class="MainQuestion">
        {{ gameData.Question_Text }}
      </p>
      <div class="SlotArea">
        <component
          :is="slot.Name"
          v-for="(slot, index) in gameData.SlotComponents"
          :key="index"
          class="SlotItem"
          :game-id="gameId"
          :component-config="slot.Data"
        />
      </div>
      <div class="QuestionArea card">
        <p class="SubQuestion">
          {{ gameData.SubQuestionTitle }}
        </p>
        <hr />
        <div
          v-for="(item, itemIndex) in gameData.Question"
          :key="itemIndex"
          class="QuestionRow"
        >
          <div
            v-for="(question, questionIndex) in gameData.Question[itemIndex]"
            :key="questionIndex"
            class="Question"
          >
            <input
              v-if="question === '$input'"
              v-model="Value[index1][index2]"
              type="text"
              class="input form-control"
              @focus="focusInput(index1, index2)"
            />
            <div v-else-if="question === '$gap'" class="gap" />
            <p v-else>
              {{ question }}
            </p>
          </div>
        </div>
      </div>
      <div class="functionbar">
        <button class="btn btn-primary" @click="CheckAnswer">確認答案</button>
      </div>
    </div>
    <div class="Slot">
      <div
        v-for="(slot, slotIndex) in gameData.AssistiveComponent"
        :key="slotIndex"
      >
        <component
          :is="slot"
          @virtualpadinput-input="VNInput"
          @virtualpadinput-delete="VNDelete"
          @virtualpadinput-pop="VNPop"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { getGameAssets } from "@/utilitys/get_assets.js";
import { getComponents } from "@/utilitys/get-components";
export default {
  name: "FillinBlank",
  components: {},
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

  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      ImgSrc: "",
      WithImage: false,
      // id: "MA3023",
      Value: [],
      focuslocation: null,
    };
  },
  created() {
    for (const i in this.gameData.Question) {
      let temp = [];
      temp = Array(Object.keys(this.gameData.Question[i]).length).fill("");
      this.Value.push(temp);
    }
  },
  mounted() {
    if (this.gameConfig.WithImage) {
      this.WithImage = true;
      this.ImgSrc = getGameAssets(this.ID, this.gameData.Img);
      const patten = /undefined/;
      if (patten.test(this.ImgSrc)) {
        this.WithImage = false;
      }
    }
  },
  methods: {
    focusInput(id1, id2) {
      this.focuslocation = [id1, id2];
    },
    VNInput(data) {
      if (this.focusInput !== null) {
        this.Value[this.focuslocation[0]][this.focuslocation[1]] += data;
      }
    },
    VNDelete() {
      if (this.focusInput !== null) {
        this.Value[this.focuslocation[0]][this.focuslocation[1]] = "";
      }
    },
    VNPop() {
      if (this.focusInput !== null) {
        this.Value[this.focuslocation[0]][this.focuslocation[1]] = this.Value[
          this.focuslocation[0]
        ][this.focuslocation[1]].slice(0, -1);
        console.log(this.Value[this.focuslocation[0]][this.focuslocation[1]]);
      }
    },
    CheckAnswer() {
      let count = 0;
      let result = true;
      let ReMesseage = "";
      let ReAnswer = "";
      for (const i in this.gameData.Question) {
        for (const j in this.gameData.Question[i]) {
          if (this.gameData.Question[i][j] === "$input") {
            if (this.Value[i][j] !== this.gameData.Answer[count]) {
              result = false;
              ReMesseage += "第" + (i + 1) + "格:" + this.Value[i][j] + "\n";
            }
            ReAnswer += "第" + (i + 1) + "格:" + this.Value[i][j] + "\n";
            count++;
          }
        }
      }
      if (result) {
        console.log("Correct");
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [ReAnswer, ReMesseage, "正確"]);
        this.$emit("next-question");
      } else {
        console.log("Wrong");
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [ReAnswer, ReMesseage, "錯誤"]);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.QuestionRow {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: first baseline;
  input {
    width: 9rem;
    text-align: center;
  }
  p {
    font-size: 1.5rem;
  }
  .Question {
    .gap {
      width: 1rem;
    }
  }
}
.Container {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 2rem;
  height: 100%;
  .index {
    max-width: 60%;
    display: flex;
    flex-direction: column;
    align-items: start;
    .MainQuestion {
      font-size: 2rem;
      font-weight: bold;
    }
    .SubQuestion {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .QuestionArea {
      padding: 1rem;
      width: 100%;
      p {
        font-weight: bold;
      }
    }
    .functionbar {
      margin: 0.5rem;
      button {
        height: 3rem;
      }
    }
  }
  .Slot {
    max-width: 40%;
  }
}
.SlotArea {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  .SlotItem {
    flex-shrink: 1;
    flex-grow: 1;
  }
  max-width: 100%;
  img {
    width: auto;
    max-height: 100%;
  }
}
</style>
