<template>
  <GenericBoard
    :data="componentConfig"
    :config="currentConfig"
    @reply-answer="handleReply"
  />
</template>

<script>
import GenericBoard from "@/components/utilities/calculation-board/GenericBoard.vue";
// 引入各題型的 config 設定
import {
  multiplyConfig,
  addsubConfig,
  divisionConfig,
  decimalConfig,
} from "@/components/utilities/calculation-board";

export default {
  name: "CalculationBoard",
  components: {
    GenericBoard,
  },
  props: {
    componentConfig: {
      type: Object,
      required: true,
    },
  },
  emits: ["replyAnswer"],

  computed: {
    currentConfig() {
      const map = {
        multiply: multiplyConfig,
        addsub: addsubConfig,
        division: divisionConfig,
        decimal: decimalConfig,
      };

      const type = this.componentConfig.type?.toLowerCase?.() ?? "";
      const configType = type === "add" || type === "sub" ? "addsub" : type;

      return map[configType] || addsubConfig;
    },
  },

  methods: {
    handleReply(result) {
      this.$emit("replyAnswer", result);
    },
  },
};
</script>
<style lang="scss" scoped>
.CalculationBoard {
  width: 100%;
  height: 100%;
}
</style>
