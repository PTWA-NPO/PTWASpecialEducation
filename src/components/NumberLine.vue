<template>
  <div class="OutterContainer">
    <v-stage id="stage" ref="stage" :config="configStage">
      <v-layer>
        <v-line :config="mainLineConfig" />
        <v-line
          v-for="(lineConfig, index) in lineConfigs"
          :key="index"
          :config="lineConfig"
        />
        <v-text
          v-for="(textConfig, index) in textConfigs"
          :key="index"
          :config="textConfig"
        />
      </v-layer>
    </v-stage>
    <input
      v-for="(inputConfig, index) in inputConfigs"
      :id="`Box${index}`"
      :key="index"
      class="InputBox"
      :style="{
        position: 'absolute',
        left: `${inputConfig.x - 22.5 + Offset.x}px`,
        top: `${inputConfig.y + Offset.y}px`,
        width: '45px',
        height: '30px',
        border: 'solid 2px black',
        'border-radius': '5px',
        'text-align': 'center',
      }"
      @input="onInput(index)"
    />
  </div>
</template>
<script>
export default {
  name: "NumberLine",
  // components: {
  //   'v-stage': Stage,
  //   'v-layer': Layer,
  //   'v-line': Line,
  //   'v-text': Text,
  // },
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      bais: 20,
      NowX: 0,
      Gap: undefined,
      // Data: {
      //   Unit: "Number",
      //   Start: 0,
      //   End: 1000,
      //   Increment: 100,
      //   Annotate: 200,
      //   Blank: {
      //     200: {
      //       TextAnswer: 0,
      //     },
      //     400: {
      //       TextAnswer: 0,
      //     },
      //   },
      // },
      AnnotateLineHeight: 30,
      IncrementLineHeight: 15,
      SvgHeight: 150,
      SvgWidth: 600,
      FontSize: 17,
      BoxIndex: 1,
      BoxAnswer: {},
      CorrectAnswer: {},
      configStage: {
        width: 610,
        height: 100,
      },
      mainLineConfig: {
        points: [20, 15, 580, 15],
        stroke: "black",
        strokeWidth: 3,
      },
      lineConfigs: [],
      textConfigs: [],
      inputConfigs: [],
      Offset: {
        x: 0,
        y: 0,
      },
    };
  },
  created() {
    this.NowX = this.bais;
    this.CountGap(this.SvgWidth);
    for (
      let i = this.Data.Start;
      i <= this.Data.End;
      i += this.Data.Increment
    ) {
      if (i in this.Data.Blank) {
        this.inputConfigs.push({
          x: this.NowX,
          y: this.AnnotateLineHeight + this.FontSize,
        });
      } else if (i % this.Data.Annotate === 0) {
        this.textConfigs.push({
          x: this.NowX - (i.toString().length * this.FontSize) / 4,
          y: this.AnnotateLineHeight + this.FontSize,
          text: i.toString(),
          fontSize: this.FontSize,
          align: "center",
        });
      }
      if (i % this.Data.Annotate === 0) {
        this.lineConfigs.push({
          points: [this.NowX, 0, this.NowX, this.AnnotateLineHeight],
          stroke: "black",
          strokeWidth: 3,
        });
      } else {
        this.lineConfigs.push({
          points: [
            this.NowX,
            this.AnnotateLineHeight / 2 - this.IncrementLineHeight / 2,
            this.NowX,
            this.AnnotateLineHeight / 2 + this.IncrementLineHeight / 2,
          ],
          stroke: "black",
          strokeWidth: 3,
        });
      }
      this.NowX += this.Gap;
    }
    let index = 0;
    for (let i in this.Data.Blank) {
      this.CorrectAnswer[index] = this.Data.Blank[i].TextAnswer;
      index++;
    }
  },
  mounted() {
    // Code to run when the component is mounted goes here
    // Get Stage BoundingsClientRect
    let stage = this.$refs.stage.$el;
    stage.style.border = "solid 1px black";
    let stageBound = stage.getBoundingClientRect();
    let OutterContainer = document.getElementsByClassName("OutterContainer")[0];
    let OutterContainerBound = OutterContainer.getBoundingClientRect();
    // this.Offset.x = stageBound.x;
    // this.Offset.y = stageBound.y;
    this.Offset.x = stageBound.x - OutterContainerBound.x;
    this.Offset.y = stageBound.y - 2 * OutterContainerBound.y + this.FontSize;
    console.log(this.Offset);
  },
  methods: {
    CountGap(CanvasWidth) {
      this.Gap =
        (CanvasWidth - this.bais * 2) /
        (Math.abs(this.Data.End - this.Data.Start) / this.Data.Increment);
    },
    onInput(index) {
      this.BoxAnswer[index] = document.getElementById(`Box${index}`).value;
      this.CheckAnswer();
    },
    CheckAnswer() {
      let Answer = true;
      for (let i in this.CorrectAnswer) {
        if (this.CorrectAnswer[i] !== parseInt(this.BoxAnswer[i])) {
          console.log("Wrong");
          Answer = false;
        }
      }
      this.$emit("replyAnswer", Answer);
    },
  },
};
</script>
<style scoped lang="scss">
.OutterContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid 3px blue;
  position: relative;
}
.InputBox {
  border-radius: 15px;
}
</style>
