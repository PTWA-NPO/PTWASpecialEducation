<template>
  <div class="Container">
    <input id="Input1" type="text" @change="Reply(0)" @input="Reply(0)" />
    <hr />
    <input id="Input2" type="text" @change="Reply(1)" @input="Reply(1)" />
  </div>
</template>

<script>
export default {
  name: "Fractions",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      // Your data properties here
      Num: [null, null],
      // Data: {
      //     Verifycation:
      //     {
      //         Mother: 0,
      //         Son: 0
      //     },
      //     Mother: 0,
      //     Son: 0
      // }
    };
  },
  mounted() {
    // Code to run when the component is mounted
  },
  methods: {
    // Your methods here
    Reply(index) {
      if (index == 0) {
        this.Num[0] = document.getElementById("Input1").value;
      } else {
        this.Num[1] = document.getElementById("Input2").value;
      }
      console.log(this.Num[0], this.Num[1]);
      console.log(this.Data.Son, this.Data.Mother);
      if (this.Data.Mother == this.Num[1] && this.Data.Son == this.Num[0]) {
        this.$emit("replyAnswer", true);
      } else {
        this.$emit("replyAnswer", false);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.Container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  /* border: solid 1px black; */
  hr {
    /* border: solid 3px black; */
    width: 100%;
  }
  input {
    width: 100%;
    text-align: center;
  }
}
</style>
