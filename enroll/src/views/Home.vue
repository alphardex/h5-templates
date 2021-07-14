<template>
  <div class="relative min-h-screen">
    <div class="flex flex-col space-y-3">
      <input
        type="text"
        class="form-control"
        v-model="applyBody.name"
        placeholder="请输入您的姓名"
      />
      <input
        type="tel"
        class="form-control"
        v-model="applyBody.tel"
        placeholder="请输入您的手机号码"
      />
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input flex-none"
          id="agree"
          name="agree"
          v-model="agree"
        />
        <label class="form-check-label text-xs" for="agree"
          >我已阅读并接受<a
            class="text-primary"
            target="_blank"
            href="https://app.cs090.com/serviceItem.html"
            >《零距离服务条款》</a
          >和<a
            class="text-primary"
            target="_blank"
            href="https://app.cs090.com/privacy.html"
            >《隐私政策》</a
          >
        </label>
      </div>
      <div class="text-center">
        <my-btn @click="doApply">报名</my-btn>
      </div>
    </div>
    <div class="absolute bottom-4 h-center text-sm">常熟零距离技术支持</div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showApplySuccessDialog.value">
        <div class="relative text-center space-y-3">
          <div class="text-2xl font-bold">报名成功!</div>
        </div>
        <div class="close-icon" @click="reload"></div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo, postApply } from "@/apis";
import ky from "kyouka";
import { Alert } from "@/utils/alert";
import { checkAgree, checkTel } from "@/utils/check";
import { isOk } from "@/utils/request";
import MyBtn from "@/components/MyBtn.vue";

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
      applyBody: {
        name: "",
        tel: "",
      },
      agree: false,
    });
    // 报名
    const doApply = async () => {
      const { applyBody, agree } = state;
      const { name, tel } = applyBody;
      if (!name) {
        Alert.fire("请输入姓名");
        return;
      }
      if (!checkTel(tel)) {
        return;
      }
      if (!checkAgree(agree)) {
        return;
      }
      const res = await postApply(applyBody);
      if (isOk(res)) {
        dialog.openApplySuccessDialog();
      }
    };
    const reload = () => {
      dialog.closeAllDialog();
      location.reload();
    };
    onMounted(async () => {
      state.info = await getInfo();
      await wx.shareAll(state.info);
    });
    return { ky, dialog, wx, ...toRefs(state), doApply, reload };
  },
});
</script>

<style lang="scss" scoped></style>
