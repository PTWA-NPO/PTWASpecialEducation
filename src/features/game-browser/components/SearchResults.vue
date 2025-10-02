<template>
  <div v-if="searchResult === undefined" class="serch-result__not-found">
    <div>
      <p class="h1">沒有搜尋結果</p>
      <br />
      <button
        class="btn-back"
        style="height: 3em; width: 10rem"
        @click="$emit('back')"
      >
        返回目錄
      </button>
    </div>
  </div>
  <div v-else class="search-result__container">
    <p class="h1">搜尋結果:</p>
    <div class="game-card__group">
      <div
        v-for="item in searchResult"
        :key="item.id"
        class="card game-card"
        style="width: 18rem"
        @click="$emit('enterGame', item.id, item.Name)"
      >
        <game-card
          :game-info="item"
          @read-text="$emit('readText', item.Name, item.Description)"
        />
      </div>
    </div>
    <div class="">
      <button
        class="btn-back"
        style="height: 3em; width: 20rem"
        @click="$emit('back')"
      >
        返回目錄
      </button>
    </div>
  </div>
</template>
<script>
import GameCard from "../components/GameCard.vue";
export default {
  name: "SearchResults",
  components: {
    GameCard,
  },
  props: {
    searchResult: {
      type: Array,
      required: true,
    },
  },
  emits: ["enterGame", "readText", "back"],
};
</script>
<style scoped lang="scss">
.btn-back {
  width: 20rem;
  height: 3em;
  margin: 2rem;
  background-color: $primary-btn-bg;
  border: none;
  &:hover {
    background-color: $primary-btn-hover-bg;
    scale: $transform-scale;
  }
}
.serch-result__not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  .h1 {
    font-size: 3rem;
    font-weight: bold;
  }
  button {
    width: 10rem;
    height: 3em;
  }
}
.search-result__container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (min-width: 1200px) {
    .game-card__group {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }
}
</style>
