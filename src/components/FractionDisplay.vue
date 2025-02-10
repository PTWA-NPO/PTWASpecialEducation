<template>
  <div class="fraction">
    <span class="numerator">{{ numerator }}</span>
    <span class="line"></span>
    <span class="denominator">{{ denominator }}</span>
  </div>
</template>

<script>
export default {
  props: {
    Data: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      numerator: null,
      denominator: null,
    };
  },
  created() {
    this.parseFraction();
  },
  methods: {
    parseFraction() {
      this.numerator = null;
      this.denominator = null;
      const regex = /\\frac\{(\d+)\}\{(\d+)\}/;
      const match = this.Data.Content.match(regex);
      this.numerator = parseInt(match[1], 10);
      this.denominator = parseInt(match[2], 10);
    },
  },
};
</script>

<style scoped>
.fraction {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  line-height: 1.2;
  font-size: 3rem;
}

.numerator {
  display: block;
}

.line {
  display: block;
  border-top: 0.2rem solid black;
  width: 100%;
  margin: 2px 0;
}

.denominator {
  display: block;
}
</style>
