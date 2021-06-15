<template>
  <div class="relative min-h-screen">
    <div @click="enter">进入</div>
    <div class="absolute bottom-4 h-center text-sm">常熟零距离技术支持</div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
    <!-- 强制关注弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showFollowDialog.value">
        <div class="text-center space-y-3">
          <img src="../assets/qrcode.png" alt="" class="w-45" />
          <div class="text-center text-sm whitespace-no-wrap">
            <div>长按识别二维码进入</div>
            <div>“{{ gzh.name }}”公众号</div>
            <div>
              回复关键字<span class="font-bold">“{{ gzh.keyword }}”</span
              >参与活动
            </div>
          </div>
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo, getMyInfo } from "@/apis";
import ky from "kyouka";
import { gzh, needSubscribe } from "@/consts";
import MyBtn from "@/components/MyBtn.vue";
import router from "@/router";

export default defineComponent({
  name: "Home",
  components: {
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      myInfo: null,
      gzh,
    });
    // 检测是否关注
    const checkSubscribe = () => {
      if (needSubscribe && !ky.yesNo(state.myInfo.subscribe)) {
        dialog.openFollowDialog();
        return false;
      }
      return true;
    };
    // 进入投票页
    const enter = () => {
      if (!checkSubscribe()) {
        return;
      }
      router.push({ name: "List" });
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      await wx.shareAll(state.info, {}, false);
    });
    return { ky, dialog, wx, ...toRefs(state), enter };
  },
});
</script>

<style lang="scss" scoped></style>
