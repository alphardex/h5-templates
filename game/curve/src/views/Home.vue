<template>
  <div class="relative min-h-screen">
    <div class="text-center">
      <my-btn @click="enter">进入游戏</my-btn>
      <my-btn @click="dialog.openRankDialog">排行榜</my-btn>
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
      <div class="share-tip" v-show="dialog.showShareTip.value"></div>
    </teleport>
    <!-- 排行榜弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showRankDialog.value">
        <rank-list :rank="rank"></rank-list>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.closeAllDialog">关闭</my-btn>
        </div>
      </div>
    </teleport>
    <!-- 机会用完弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showGameNoChanceDialog.value">
        <div class="text-center space-y-3">
          <div class="text-center text-sm whitespace-no-wrap">
            <div>您没有游戏机会了</div>
            <div v-if="myInfo">
              <div v-if="ky.yesNo(myInfo.can_share)">
                邀请好友可以增加1次游戏机会
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
import { getInfo, getMyInfo, getRank } from "@/apis";
import ky from "kyouka";
import MyBtn from "@/components/MyBtn.vue";
import { needCheckChance } from "@/consts";
import router from "@/router";
import RankList from "@/components/RankList.vue";

export default defineComponent({
  name: "Home",
  components: {
    MyBtn,
    RankList,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      myInfo: null,
      rank: null,
    });
    // 检测是否有游戏机会
    const checkHaveChance = () => {
      if (needCheckChance && Number(state.myInfo.my_time) < 1) {
        dialog.openGameNoChanceDialog();
        return false;
      }
      return true;
    };
    // 进入游戏页
    const enter = () => {
      if (!checkHaveChance()) {
        return;
      }
      router.push({ name: "Game" });
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.rank = await getRank();
      state.myInfo = await getMyInfo();
      await wx.shareAll(state.info);
    });
    return { ky, dialog, wx, ...toRefs(state), enter };
  },
});
</script>

<style lang="scss" scoped></style>
