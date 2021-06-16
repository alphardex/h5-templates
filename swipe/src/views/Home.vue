<template>
  <div class="relative min-h-screen">
    <!-- 导航 -->
    <div
      class="fixed z-5 top-3 left-3 flex flex-wrap max-w-screen space-x-2"
      v-if="testMode"
    >
      <div
        class="w-6 h-6 flex-center rounded-full"
        v-for="n in 5"
        :key="n"
        @click="slideTo(n - 1)"
      >
        {{ n }}
      </div>
    </div>
    <!-- 滑屏页 -->
    <swiper class="w-screen h-screen" @swiper="onSwiper">
      <swiper-slide id="slide-1"> </swiper-slide>
    </swiper>
    <div class="absolute bottom-4 h-center text-sm">常熟零距离技术支持</div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo } from "@/apis";
import ky from "kyouka";
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/vue";

export default defineComponent({
  name: "Home",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      swiper: null,
      currentPage: 0,
      testMode: true,
    });
    const onSwiper = (swiper: any) => {
      swiper.changeDirection();
      swiper.slideTo(state.currentPage);
      state.swiper = swiper;
    };
    const slideTo = (id: number) => {
      state.swiper.slideTo(id);
    };
    onMounted(async () => {
      state.info = await getInfo();
      await wx.shareAll(state.info);
    });
    return { ky, dialog, wx, ...toRefs(state), onSwiper, slideTo };
  },
});
</script>

<style lang="scss" scoped></style>
