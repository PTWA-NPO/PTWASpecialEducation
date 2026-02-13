<template>
  <div>
    <p class="h3">
      {{ gameData.Question.text }}
    </p>
    <div class="container">
      <div class="component1">
        <component
          :is="slotcomponent.Name"
          :game-id="gameId"
          :component-config="slotcomponent.Data"
        />
      </div>
      <div class="optionbar">
        <p class="h5">
          {{ gameData.Question.SubQuestion }}
        </p>
        <div id="error_msg">
          {{ errorMsg }}
        </div>
        <div class="Buttons">
          <button
            v-for="(items, index) in btn"
            :key="index"
            @click="judgeAnswer(items)"
          >
            {{ items }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Game Description:
 * The game will show the image that offered on canvas.
 * The player should click the button to answer.
 * 
 * Game Data Structure Sample:
 *         {   
            "Question": {
                "text": "隢?貊?憿銝剜?憭??舀?璉?", // Question Text(This will be disply on the buttom of the canvas)
                "Range": [5, 10] //The Range of the button: [ Min, Max ] (Note That we strongly recommend that the range should be less than 10)
            },
            "Answer": 8, //The answer of the question
            "img": "NumberningGameSample.png" //The image that will be display on the canvas(Please make sure the image's route is right)
        }
 * 
 */
import { getGameAssets } from "@/lib/get-assets.js";
import { defineAsyncComponent } from "vue";
export default {
  Name: "NumberingGame",
  components: {
    ImageContainer: defineAsyncComponent(
      () => import("@/components/ImageContainer.vue")
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
      imageUrl: "",
      btn: [],
      errorMsg: "",
      slotcomponent: {},
    };
  },
  created() {
    this.slotcomponent.Name = this.gameData.SlotComponents[0].Name;
    this.slotcomponent.Data = this.gameData.SlotComponents[0].Data;
  },
  mounted() {
    this.imageUrl = getGameAssets(this.gameId, this.gameData.img);
    for (
      let i = this.gameData.Question.Range[0];
      i <= this.gameData.Question.Range[1];
      i++
    ) {
      this.btn.push(i);
    }
  },
  methods: {
    judgeAnswer(answer) {
      if (answer === this.gameData.Answer) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.gameData.Answer, answer, "甇?Ⅱ"]);
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.gameData.Answer, answer, "?航炊"]);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.GameImg {
  height: auto;
}
p {
  margin-left: 1rem;
}
.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 70vh;
  .component1 {
    width: 60%;
    height: 100%;
    component {
      height: 100%;
    }
  }
  .optionbar {
    width: 40%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .Buttons {
      button {
        min-width: 5rem;
        margin: 10pt;
        height: 3rem;
        border-radius: 12px;
        background-color: #bdb2ff;
        border: none;
      }
    }
  }
}
</style>



