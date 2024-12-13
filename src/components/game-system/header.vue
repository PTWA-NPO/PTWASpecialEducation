<template>
  <header>
    <nav
      class="container-fluid navbar navbar-expand-md navbar-light sticky-top justify-content-around justify-content-md-center"
      style="justify-content: flex-start !important"
    >
      <a class="navbar-brand mx-3" href="#" alt="Home">
        <img :src="logo" />
      </a>
      <button
        class="navbar-toggler btn btn-primary mx-auto"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarText11"
        aria-controls="navbarText11"
        aria-expanded="false"
        aria-label="Toggle navigation"
        @click="PreviousPage"
      >
        上一頁
      </button>
      <div id="navbarText" class="collapse navbar-collapse mx-3">
        <div
          class="container sticky-top d-flex justify-content-end"
          style="--bs-breadcrumb-divider: '>'"
        >
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <img :src="home" />
              <a href="#">主頁</a>
            </li>
            <li
              class="breadcrumb-item"
              aria-current="page"
              @click="PreviousPage"
            >
              <img :src="math" />
              <a>{{ grade }} 年級 {{ subject }}</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              <img :src="game" />
              <a> {{ gameName }}</a>
            </li>
          </ol>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
export default {
  props: {
    grade: {
      type: String,
      required: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
  },
  emits: ["previousPage"],
  data() {
    return {
      logo: getSystemAssets("logo.png", "nav_bar"),
      home: getSystemAssets("home.png", "game_header"),
      math: getSystemAssets("math.png", "game_header"),
      game: getSystemAssets("game.png", "game_header"),
    };
  },
  methods: {
    PreviousPage() {
      this.$emit("previousPage");
    },
  },
};
</script>

<style scoped lang="scss">
header {
  background-color: #f19c79;
  height: 10vh !important;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  display: block;
  position: relative;
  z-index: 1000;
}

.navbar {
  background-color: #f19c79;

  .navbar-brand {
    img {
      @media (max-width: 576px) {
        height: 7vh;
        width: auto;
      }

      @media (min-width: 576px) {
        max-width: 20vw;
      }
    }
  }

  img {
    max-width: 80%;
  }
}

.breadcrumb .breadcrumb-item {
  a {
    color: #fff; /* 替換為你想要的顏色 */
    font-size: 1.2em;
  }
}

.breadcrumb-item > img {
  height: 90%;
  max-width: 40px;
  max-height: 40px;
  margin-right: 4px;
}
</style>
