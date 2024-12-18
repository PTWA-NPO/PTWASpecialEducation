<template>
  <div class="image-container">
    <img :src="imgUrl" class="monay-image">
  </div>
</template>

<script>
import { getSlotComponentAssets } from '@/utilitys/get_assets.js';
export default {
    props: {
        Data: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            moneyImgFile:"MoneyGenerator",
            denomination:null,
            imgUrl:"",
            fileExtension:'.png'
        }
    },
    mounted() {
        this.denomination = this.Data.denomination.toString();
        this.denomination = this.denomination + this.fileExtension;
        this.imgUrl = getSlotComponentAssets(this.moneyImgFile, this.denomination);
    },
    methods: {

    }
}
</script>

<style scoped lang="scss">
.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.monay-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>