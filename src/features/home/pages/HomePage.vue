<template>
  <div class="index-container">
    <home-header />
    <div ref="gradeContainer" class="grade-container">
      <p class="title">請選擇年級</p>
      <div class="grade-select-menu">
        <div
          v-for="(card, index) in imgSrcs"
          :key="index"
          class="grad-card-container"
        >
          <router-link
            :to="{ name: 'browser', params: { grade: index + 1 } }"
            class="submenu-link-block"
          >
            <img :src="card" class="img-fluid" alt="一年遊戲" />
          </router-link>
        </div>
      </div>
    </div>
    <home-footer />
  </div>
</template>

<script>
import HomeHeader from "../components/HomeHeader.vue";
import HomeFooter from "../components/HomeFooter.vue";
import { getSystemAssets } from "@/lib/get-assets.js";
export default {
  name: "HomePage",
  components: {
    HomeHeader,
    HomeFooter,
  },
  data() {
    return {
      imgSrcs: [],
    };
  },
  created() {
    for (let i = 1; i <= 6; i++) {
      this.imgSrcs.push(getSystemAssets(`g${i}_hover.png`, "grade_btn"));
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.gradeContainer.style.backgroundImage = `url(${getSystemAssets(
        "cover_info.png",
        "general"
      )})`;
    });
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.index-container {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr 8.5fr 0.5fr;
  overflow-y: hidden;
  overflow-x: hidden;
  .grade-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    .title {
      font-size: 3rem;
      text-align: center;
      padding: 3rem;
      font-weight: bold;
    }
    .grade-select-menu {
      width: 100%;
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(6, 1fr);
      padding: 1rem 2.5rem;
      .grad-card-container {
        display: flex;
        justify-content: center;
        transition: transform 0.3s ease;
        img {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
          object-fit: contain;
        }
        &:hover {
          transform: scale(1.03);
          img {
            transform: scale(1.03);
          }
        }
      }
    }
  }
}
</style>
