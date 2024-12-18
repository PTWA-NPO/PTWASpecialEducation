<template>
  <nav>
    <div>
      <RouterLink to="/">
        <img :src="logo" alt="Program the World">
      </RouterLink>
    </div>
    <ul>
      <li>
        <a href="https://programtheworld.tw/donate/donate" alt="捐款">
          <img :src="donation" class="navbar_picAndText">
        </a>
      </li>
      <li>
        <a href="#grade-title" alt="遊戲">
          <img :src="sharing" class="navbar_picAndText">
        </a>
      </li>
      <li>
        <a href="https://programtheworld.tw/works/index" alt="耕耘">
          <img :src="effort" class="navbar_picAndText">
        </a>
      </li>
      <li>
        <a
          href="https://programtheworld.tw/about/about?pagetarget=us"
          alt="關於"
        >
          <img :src="about" class="navbar_picAndText">
        </a>
      </li>
      <li>
        <a
          id="FB_img"
          href="https://www.facebook.com/program.the.world"
          alt="facebook"
        >
          <img :src="facebook" class="navbar_pic">
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
import { getSystemAssets } from "@/utilitys/get_assets.js";
export default {
  data() {
    return {
      logo: getSystemAssets("logo.png", "nav_bar"),
      donation: getSystemAssets("donateV2.png", "nav_bar"),
      sharing: getSystemAssets("sharing.png", "nav_bar"),
      effort: getSystemAssets("effort.png", "nav_bar"),
      about: getSystemAssets("about.png", "nav_bar"),
      facebook: getSystemAssets("facebook.png", "nav_bar"),
    };
  },
};
</script>

<style scoped lang="scss">
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f19c79;
  padding: 0 1rem;
  height: 10vh;
}

nav div img {
  height: 4rem;
  width: auto;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  width: 60%;
}

nav ul li {
  margin: 0 0.5rem;
  flex: 1 1 auto;
}

nav ul li a {
  text-decoration: none;
}

.navbar_picAndText {
  max-width: 200px; /* 讓圖片在容器內部自適應 */
  height: auto; /* 保持圖片的長寬比 */
}

.navbar_picAndText {
  width: 100%;
}

.navbar_pic {
  width: 80%;
}

nav ul li a img:hover {
  transform: scale(1.1);
}

nav ul li a img {
  transition: transform 0.3s;
}

.navbar_pic {
  max-width: 60px; /* 設定圖片的最大寬度 */
}

@media (max-width: 990px) {
  nav ul {
    display: none;
  }
}
</style>
