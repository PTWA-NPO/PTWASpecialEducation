<template>
  <div class="Outter">
    <input v-model="ReplyDatas" :type="configs.Type" @input="Reply2Parent" />
  </div>
</template>
<script>
export default {
  name: "ReplyInput",
  props: {
    Data: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],
  data() {
    return {
      ReplyDatas: "",
      configs: {},
    };
  },
  created() {
    this.configs = this.Data;
    if (this.configs.Type == undefined) {
      this.configs.Type = "Text";
    }
  },
  methods: {
    Reply2Parent() {
      let ans = this.ReplyDatas == this.configs.Text ? true : false;
      this.$emit("replyAnswer", ans);
    },
  },
};
</script>

<style scoped lang="scss">
/* Your component styles here */
.Outter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  input {
    width: 100%;
  }
}
</style>
