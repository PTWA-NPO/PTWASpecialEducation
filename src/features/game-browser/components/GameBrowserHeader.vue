<template>
  <div class="img-container">
    <img :src="logoSrc" @click="$emit('goHome')" />
  </div>
  <nav class="subjects">
    <button
      class="subject__btn"
      :class="{ 'subject__btn--active': subject === 'math' }"
      @click="$emit('selectSubject', 'math')"
    >
      數學
    </button>
    <button
      class="subject__btn"
      :class="{ 'subject__btn--active': subject === 'chinese' }"
      @click="$emit('selectSubject', 'chinese')"
    >
      國語
    </button>
    <button
      class="subject__btn"
      :class="{ 'subject__btn--active': subject === 'technology' }"
      @click="$emit('selectSubject', 'technology')"
    >
      多元科技
    </button>
  </nav>
  <div class="search-group">
    <input
      v-model="keyword"
      placeholder="輸入ID或者標題"
      @keyup.enter="$emit('search', keyword)"
    />
    <button
      class="search-group__btn-search"
      type="submit"
      @click="$emit('search', keyword)"
    >
      搜尋
    </button>
  </div>
</template>
<script>
import { SYSTEM_LOGO_SRC } from "@/shared/constants/assets.js";
export default {
  name: "SelectHeader",
  props: {
    subject: {
      type: String,
      required: true,
    },
  },
  emits: ["selectSubject", "search", "goHome"],
  data() {
    return { keyword: "", logoSrc: SYSTEM_LOGO_SRC };
  },
  methods: {},
};
</script>
<style scoped lang="scss">
.img-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    height: 8vh;
    width: auto;
    object-fit: contain;
  }
}
.subjects {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  .subject__btn {
    width: 33%;
    max-width: 9rem;
    height: 3rem;
    border-radius: $border-radius;
    background-color: #f4fc93;
    border: none;
    &--active {
      background-color: #d4e700;
    }
  }
}
.search-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  input {
    width: 70%;
    height: 3rem;
    border: solid;
    border-radius: $border-radius;
    border: none;
    padding: 0 1rem;
    &:focus {
      outline: 3px solid blue;
    }
  }
  .search-group__btn-search {
    height: 3rem;
    padding: 10px 1rem;
    border-radius: $border-radius;
    background-color: #f4fc93;
    border: none;
  }
}
</style>
