<template>
  <div class="container">
    <!-- v-if -->
    <div v-if="GameData.SlotComponents != undefined" class="ImageCard">
      <component
        :is="SlotComponent"
        class="component"
        :ID="ID"
        :Data="SlotData"
      />
    </div>
    <div class="AnswerArea">
      <p>{{ GameData.Question }}</p>
      <VirtualNumPad ref="VirtualNumPad" @submit="GetSubmitData" />
    </div>
  </div>
</template>
<script>
import VirtualNumPad from "@/components/VirtualNumPad.vue";
import { defineAsyncComponent } from "vue";
export default {
  name: "NumberInputGame",
  components: {
    VirtualNumPad,
    ImageContainer: defineAsyncComponent(() =>
      import("@/components/ImageContainer.vue")
    ),
    FreeDrag: defineAsyncComponent(() => import("@/components/FreeDrag.vue")),
    NumberLine: defineAsyncComponent(() =>
      import("@/components/NumberLine.vue")
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
      imageUrl: "",
      SlotComponentSwitch: false,
      SlotComponent: "",
      SlotData: {},
    };
  },
  created() {
    if (this.GameData.SlotComponents != undefined) {
      this.SlotComponentSwitch = true;
      this.SlotComponent = this.GameData.SlotComponents[0].Name;
      this.SlotData = this.GameData.SlotComponents[0].Data;
    }
  },
  methods: {
    GetSubmitData(data) {
      console.log("Number Input Game Get:" + data);
      this.CheckAnswer(data);
    },
    CheckAnswer(data) {
      var response = false;
      if (data == this.GameData.Answer) {
        response = true;
      } else {
        response = false;
      }
      console.log(response);
      if (response) {
        this.$emit("play-effect", "CorrectSound");
        this.$emit("add-record", [this.answer, data, "正確"]);
        this.$refs.VirtualNumPad.delete_num();
        this.$emit("next-question");
      } else {
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [this.answer, data, "錯誤"]);
        this.$refs.VirtualNumPad.delete_num();
      }
    },
  },
};
</script>
<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-self: stretch;
  .ImageCard {
    width: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3rem;
    .component {
      max-height: 50vh;
      min-height: 40vh;
    }
  }
  .AnswerArea {
    width: 40%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    p {
      font-size: 1.5em;
    }
  }
}
</style>
