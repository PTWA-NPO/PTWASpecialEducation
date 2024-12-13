<template>
  <div class="container d-flex justify-content-center">
    <div id="container" ref="container">
      <ImageContainer
        class="Background"
        :ID="ID"
        :Data="Background"
      />
      <img
        v-for="(image, index) in expandedImages"
        :key="index"
        :src="image.src"
        class="draggable"
        :alt="image.alt"
        :style="{ left: image.left + 'px', top: image.top + 'px' }"
        @mousedown="onMouseDown($event, index)"
      >
    </div>
  </div>
</template>
<script>
import { getSlotComponentAssets } from "../utilitys/get_assets";
import ImageContainer from "@/components/ImageContainer.vue";
import { getGameAssets } from "@/utilitys/get_assets.js";
//Data Structure
// SlotData = {
//     "Name" : "SlotData",
//     "Data" : {
//         "Images" : [
//             {
//                 "src" : "image1.png",
//                 "alt" : "Image 1",
//                 "Amount" : 2
//             },
//             {
//                 "src" : "image2.png",
//                 "alt" : "Image 2",
//                 "Amount" : 3
//             }
//         ],
//         "Background" : {
//             "Src" : "cover_info.jpeg"
//             "Alt" : "Background Image
//         }
//     }
// }
export default {
  components: {
    ImageContainer,
  },
  props: {
    ID: {
      type: String,
      required: true,
    },
    Data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      images: [
        { src: "image1.png", alt: "Image 1", Amount: 2 },
        { src: "image2.png", alt: "Image 2", Amount: 3 },
        // Add more images as needed
      ],
      expandedImages: [],
      highestZIndex: 1,
      Background: {
        Src: "",
        Alt: "",
      },
    };
  },
  created() {
    this.Background = this.Data.Background;
  },
  mounted() {
    this.expandImages();
  },
  methods: {
    onMouseDown(event, index) {
      event.preventDefault();
      const draggable = event.target;
      this.highestZIndex++;
      draggable.style.zIndex = this.highestZIndex;

      const shiftX = event.clientX - draggable.getBoundingClientRect().left;
      const shiftY = event.clientY - draggable.getBoundingClientRect().top;

      const container = this.$refs.container;
      const containerRect = container.getBoundingClientRect();

      const onMouseMove = (e) => {
        let newLeft = e.clientX - shiftX - containerRect.left;
        let newTop = e.clientY - shiftY - containerRect.top;

        // 確保拖拽元素不會超出容器邊界
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + draggable.offsetWidth > container.clientWidth) {
          newLeft = container.clientWidth - draggable.offsetWidth;
        }
        if (newTop + draggable.offsetHeight > container.clientHeight) {
          newTop = container.clientHeight - draggable.offsetHeight;
        }

        draggable.style.left = newLeft + "px";
        draggable.style.top = newTop + "px";
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      draggable.ondragstart = () => false;
    },
    expandImages() {
      const container = this.$refs.container;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imageWidth = 100; // 假設圖片寬度為100px
      const imageHeight = 100; // 假設圖片高度為100px
      const offsetX = 10; // 每張圖片相對於前一張圖片向右偏移量
      const offsetY = 10; // 每張圖片相對於前一張圖片向下偏移量

      this.images = this.Data.Images;
      this.images.forEach((image) => {
        for (let i = 0; i < image.Amount; i++) {
          let left = i * offsetX;
          let top = i * offsetY;

          // 確保圖片不會超出容器邊界
          if (left + imageWidth > containerWidth) {
            left = containerWidth - imageWidth;
          }
          if (top + imageHeight > containerHeight) {
            top = containerHeight - imageHeight;
          }

          const newImage = {
            src: getGameAssets(this.ID, image.src),
            alt: image.alt + " " + (i + 1),
            left: left,
            top: top,
          };
          this.expandedImages.push(newImage);
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
#container {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  position: relative; /* 使用 relative 而不是 absolute */
  overflow: hidden;
}

.draggable {
  position: absolute; /* 保持 absolute 以便在容器內拖動 */
  width: 100px;
  height: 100px;
  cursor: move;
}

.Background {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
}
</style>
