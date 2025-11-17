<template>
  <p class="title">請選科目</p>
  <div class="subjects-menu__container">
    <div class="subject" @click="$emit('selectSubject', 'math')">
      <img :src="mathLogoSrc" />
      <p>數學</p>
    </div>
    <div class="subject" @click="$emit('selectSubject', 'chinese')">
      <img :src="chineseLogoSrc" />
      <p>國語</p>
    </div>
    <div class="subject" @click="$emit('selectSubject', 'technology')">
      <img :src="technologyLogoSrc" />
      <p>多元科技</p>
    </div>
  </div>
</template>
<script>
import { SUBJECT_LOGO_SRC } from "@/shared/constants/assets.js";
export default {
  name: "SubjectMenu",
  props: {},
  emits: ["selectSubject"],
  data() {
    return {
      mathLogoSrc: SUBJECT_LOGO_SRC.math,
      chineseLogoSrc: SUBJECT_LOGO_SRC.chinese,
      technologyLogoSrc: SUBJECT_LOGO_SRC.technology,
    };
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0rem;
}
.subjects-menu__container {
  margin: 2rem;
  width: 40%;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 2rem;
  @media (min-width: 1200px) {
    width: 30%;
  }
  .subject {
    @extend .container-basic;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    background-color: $primary-color;
    p {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0;
    }
    img {
      height: 20vh;
      width: auto;
      object-fit: contain;
    }
  }
  .subject:hover {
    transform: scale($transform-scale);
  }
}
</style>
