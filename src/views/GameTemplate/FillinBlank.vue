<template>
  <div class="Container container">
    <div class="index">
      <p class="MainQuestion">
        {{ GameData.Question_Text }}
      </p>
      <div class="SlotArea">
        <component
          :is="slot.Name"
          v-for="(slot, index) in GameData.SlotComponents"
          :key="index"
          class="SlotItem"
          :ID="ID"
          :Data="slot.Data"
        />
      </div>
      <div class="QuestionArea card">
        <p class="SubQuestion">
          {{ GameData.SubQuestionTitle }}
        </p>
        <hr />
        <div
          v-for="(item, index1) in GameData.Question"
          :key="index1"
          class="QuestionRow"
        >
          <div
            v-for="(question, index2) in GameData.Question[index1]"
            class="Question"
          >
            <input
              v-if="question == '$input'"
              v-model="Value[index1][index2]"
              type="text"
              class="input form-control"
              @focus="focusInput(index1, index2)"
            />
            <div v-else-if="question == '$gap'" class="gap" />
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
      <div v-for="slot in GameData.AssistiveComponent">
        <component
          :is="slot"
          @virtualpadinputInput="VNInput"
          @virtualpadinputDelete="VNDelete"
          @virtualpadinput-pop="VNPop"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { defineAsyncComponent } from "vue";
import { getGameAssets } from "@/utilitys/get_assets.js";
import { getComponents } from "@/utilitys/get-components";
export default {
  name: "FillinBlank",
  components: {
    Numpad: defineAsyncComponent(() =>
      import("@/components/VirtualNumPadInput.vue")
    ),
    Calculator: defineAsyncComponent(() =>
      import("@/components/Calculator.vue")
    ),
    Clock: getComponents("Clock"),
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

  emits: ["play-effect", "next-question", "add-record"],
  data() {
    return {
      InputId: 0,
      ImgSrc: "",
      WithImage: false,
      // id: "MA3023",
      Value: [],
      focuslocation: null,
    };
  },
  created() {
    for (var i in this.GameData.Question) {
      let temp = [];
      for (var j in this.GameData.Question[i]) {
        temp.push("");
      }
      this.Value.push(temp);
    }
  },
  mounted() {
    if (this.GameConfig.WithImage) {
      this.WithImage = true;
      this.ImgSrc = getGameAssets(this.ID, this.GameData.Img);
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
      if (this.focusInput != null) {
        this.Value[this.focuslocation[0]][this.focuslocation[1]] += data;
      }
    },
    VNDelete() {
      if (this.focusInput != null) {
        this.Value[this.focuslocation[0]][this.focuslocation[1]] = "";
      }
    },
    VNPop() {
      if (this.focusInput != null) {
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
      for (var i in this.GameData.Question) {
        for (var j in this.GameData.Question[i]) {
          if (this.GameData.Question[i][j] == "$input") {
            if (this.Value[i][j] != this.GameData.Answer[count]) {
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
