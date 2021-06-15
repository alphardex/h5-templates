<template>
  <div class="relative min-h-screen">
    <div class="mx-4">
      <!-- 活动规则 -->
      <div class="card">
        <div
          class="whitespace-pre-wrap"
          v-html="info.act_rule"
          v-if="info"
        ></div>
      </div>
    </div>
    <nav-bar :navItems="navItems"></nav-bar>
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
import NavBar from "@/components/NavBar.vue";
import { navItems } from "@/consts";

export default defineComponent({
  name: "Rule",
  components: {
    NavBar,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      navItems,
    });
    onMounted(async () => {
      state.info = await getInfo();
      await wx.shareAll(state.info);
    });
    return { ky, dialog, wx, ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped></style>
