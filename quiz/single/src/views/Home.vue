<template>
  <div class="relative min-h-screen">
    <div class="flex flex-col items-center">
      <!-- 活动时间 -->
      <time-range
        v-if="info"
        :startDate="info.begin_time"
        :endDate="info.end_time"
      ></time-range>
      <!-- 答题入口 -->
      <my-btn @click="enter">开始答题</my-btn>
    </div>
    <div class="absolute bottom-14 h-center text-sm">常熟零距离技术支持</div>
    <nav-bar :navItems="navItems"></nav-bar>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
    <!-- 引导分享 -->
    <teleport to="#dialogs">
      <div class="share-tip" v-show="dialog.showShareTip.value"></div>
    </teleport>
    <!-- 规则弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showRuleDialog.value">
        <div
          class="whitespace-pre-wrap h-60 overflow-y-scroll"
          v-html="info.act_rule"
          v-if="info"
        ></div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
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
    <!-- 机会用完弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showQuizNoChanceDialog.value">
        <div class="text-center space-y-3">
          <div class="text-center text-sm whitespace-no-wrap">
            <div>您没有答题机会了</div>
            <div v-if="myInfo">
              <div v-if="ky.yesNo(myInfo.can_share)">
                邀请好友可以增加1次答题机会
              </div>
              <div v-else>
                请明天再来吧
              </div>
            </div>
          </div>
        </div>
        <div class="absolute h-center -bottom-16" v-if="myInfo">
          <my-btn
            v-if="ky.yesNo(myInfo.can_share)"
            @click="dialog.openShareTip"
          >
            邀请好友
          </my-btn>
          <my-btn v-else @click="dialog.closeAllDialog">
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
import NavBar from "@/components/NavBar.vue";
import {
  navItems,
  needCheckChance,
  needCheckDate,
  needSubscribe,
  gzh,
} from "@/consts";
import { checkDate } from "@/utils/check";
import router from "@/router";
import MyBtn from "@/components/MyBtn.vue";
import TimeRange from "@/components/TimeRange.vue";

export default defineComponent({
  name: "Home",
  components: {
    NavBar,
    MyBtn,
    TimeRange,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      myInfo: null,
      navItems,
      gzh,
    });
    // 检测日期
    const checkDateRange = () => {
      const { begin_time, end_time } = state.info!;
      const beginDate = new Date(ky.fromTimestamp(begin_time));
      const endDate = new Date(ky.fromTimestamp(end_time));
      if (needCheckDate && !checkDate(beginDate, endDate)) {
        return false;
      }
      return true;
    };
    // 检测是否有答题机会
    const checkHaveChance = () => {
      if (needCheckChance && Number(state.myInfo.my_time) < 1) {
        dialog.openQuizNoChanceDialog();
        return false;
      }
      return true;
    };
    // 检测是否关注
    const checkSubscribe = () => {
      if (needSubscribe && !ky.yesNo(state.myInfo.subscribe)) {
        dialog.openFollowDialog();
        return false;
      }
      return true;
    };
    // 进入答题页
    const enter = () => {
      if (!checkDateRange()) {
        return;
      }
      if (!checkSubscribe()) {
        return;
      }
      if (!checkHaveChance()) {
        return;
      }
      router.push({ name: "Quiz" });
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      await wx.shareAll(state.info);
    });
    return { ky, dialog, wx, ...toRefs(state), enter };
  },
});
</script>

<style lang="scss" scoped></style>
