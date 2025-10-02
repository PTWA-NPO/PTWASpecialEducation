<template>
  <div
    v-for="(items, index) in sections"
    :key="index"
    class="game-charpter__container"
  >
    <p class="game-charpter__title">
      {{ items.Title }}
    </p>
    <div class="game-card__group">
      <div v-for="item in items.Games" :key="item.id" class="game-card">
        <game-card
          :game-info="item"
          @click="$emit('enterGame', item.id, item.Name)"
          @read-text="$emit('readText', item.Name, item.Description)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import GameCard from "../components/GameCard.vue";
export default {
  name: "GameList",
  components: {
    GameCard,
  },
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
  emits: ["enterGame", "readText"],
};
</script>
<style scoped lang="scss">
.game-charpter__container {
  margin-bottom: 2vh;
}
.game-charpter__title {
  font-size: 1.5rem;
}
.game-card__group {
  display: grid;
  width: 100%;
  align-self: center;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 1.5rem;
  .game-card {
    border-radius: $border-radius;
    border: solid 2px #aaa;
    transition: transform 0.3s ease;
    min-height: 16rem;
  }
  .game-card:hover {
    transform: scale(1.05);
  }
}
</style>
