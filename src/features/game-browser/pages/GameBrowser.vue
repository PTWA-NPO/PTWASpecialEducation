<template>
  <div class="outter">
    <header class="game-select__header">
      <select-header
        :subject="browser.currentSubject"
        @select-subject="browser.selectSubject"
        @search="browser.searchGame"
        @go-home="goHome"
      />
    </header>

    <section v-if="browser.showMode === 'menu'" class="subjects-menu">
      <subject-menu @select-subject="browser.selectSubject" />
    </section>

    <section
      v-else-if="browser.showMode === 'game'"
      class="game-select__container"
      style="overflow-y: hidden"
    >
      <template v-if="browser.hasCurrentSubjectData">
        <div class="sidebar">
          <game-select-sidebar
            :semesters="browser.showInfo"
            :chapters="browser.currentSemesterChapters"
            :selected-semester="browser.selectedSemester"
            :selected-chapter="browser.selectedChapter"
            @select-semester="browser.selectSemester"
            @select-chapter="browser.selectChapter"
          />
        </div>
        <div :key="browser.refresh" class="game-display__container">
          <game-list
            :sections="browser.currentChapterSections"
            @enter-game="onEnterGame"
            @read-text="browser.read"
          />
        </div>
      </template>
      <div v-else class="under-construction">
        <img :src="UNDER_CONSTRUCTION_SRC" alt="Under Construction" />
      </div>
    </section>

    <section v-else-if="browser.showMode === 'search'" class="search_result">
      <search-results
        :search-result="browser.searchResult"
        @enter-game="onEnterGame"
        @read-text="browser.read"
        @back="() => browser.switchMode('menu')"
      />
    </section>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useGameBrowserData } from "../hooks/useGameBrowserData.js";
import SelectHeader from "../components/GameBrowserHeader.vue";
import SubjectMenu from "../components/SubjectsMenu.vue";
import GameSelectSidebar from "../components/GameBrowserSidebar.vue";
import GameList from "../components/GameList.vue";
import SearchResults from "../components/SearchResults.vue";
import { UNDER_CONSTRUCTION_SRC } from "@/shared/constants/assets.js";

export default {
  name: "GameBrowserPage",
  components: {
    SelectHeader,
    SubjectMenu,
    GameSelectSidebar,
    GameList,
    SearchResults,
  },
  data() {
    const browser = useGameBrowserData();
    return {
      browser,
      router: useRouter(),
      UNDER_CONSTRUCTION_SRC,
    };
  },
  async created() {
    await this.browser.init(this.$route.params.grade);
  },
  methods: {
    onEnterGame(gameId, gameName) {
      this.router.push(this.browser.toGameRoute(gameId, gameName));
    },
    goHome() {
      this.router.push({ name: "Home" });
    },
  },
};
</script>

<style lang="scss" scoped>
.subjects-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
}

.game-select__header {
  touch-action: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  background-color: #f4c49f;
  height: 10vh !important;
  width: 100%;
  padding: 0 2rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 2fr 2fr;
}

.game-select__container {
  display: grid;
  grid-template-columns: 1fr 5fr;
  height: 90vh;
}

.game-display__container {
  padding: 1rem;
  overflow-y: scroll;
}

.search_result {
  height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
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
}
.sidebar {
  display: flex;
  flex-direction: column;
  height: 90vh;
  background-color: #dfedb3;
  padding: 0 0.5rem;
  overflow-y: auto;
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
    &--semester-active {
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
