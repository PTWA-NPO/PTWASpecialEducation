<template>
  <p class="sidebar__title">學期</p>
  <div class="sidebar__button-group">
    <template v-for="(semester, index) in semesters" :key="index">
      <button
        class="sidebar__button"
        :class="{
          'sidebar__button--selected': selectedSemester === index,
        }"
        @click="$emit('selectSemester', index)"
      >
        {{ semester.lableName }}
      </button>
    </template>
  </div>
  <p class="sidebar__title">單元</p>
  <div v-if="chapters" class="sidebar__button-group">
    <template v-for="(items, key) in chapters" :key="key">
      <button
        class="sidebar__button"
        :class="{
          'sidebar__button--selected': selectedChapter === key,
        }"
        @click="$emit('selectChapter', key)"
      >
        {{ items.Title }}
      </button>
    </template>
  </div>
</template>
<script>
export default {
  name: "GameSelectSidebar",
  props: {
    semesters: {
      type: Array,
      required: true,
    },
    chapters: {
      type: Array,
      required: true,
    },
    selectedSemester: {
      type: Number,
      required: true,
    },
    selectedChapter: {
      type: Number,
      required: true,
    },
  },
  emits: ["selectSemester", "selectChapter"],
};
</script>
<style lang="scss" scoped>
.sidebar {
  &__title {
    font-size: 1.5em;
    margin: 0.5rem 0;
    position: sticky;
    top: 0;
    background-color: #dfedb3;
    z-index: 1;
  }
  &__button-group {
    display: grid;
    gap: 0.5rem;
  }
  &__button {
    transition: transform 0.3s ease;
    font-size: 1rem;
    background-color: #f8fbe8;
    color: #333;
    @extend .button-border;
    width: 100%;
    font-weight: 600;
    height: 2.5rem;
    padding: 0 0.5rem;
    &--selected {
      background-color: #a8c2ea;
    }
  }
}
.under-construction {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 90vh;
  grid-column: 1 / -1;
  padding: 2rem;
  overflow: hidden;

  img {
    max-width: 80%;
    max-height: 79vh;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}
</style>
