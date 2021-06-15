<template>
  <div class="relative min-h-screen">
    <div class="mx-4">
      <!-- 详情 -->
      <div class="card" v-if="detail">
        <div class="space-y-3">
          <!-- 详情图 -->
          <img :src="detail.pic" alt="" class="w-full" />
          <!-- 操作按钮 -->
          <div class="flex flex-col space-y-2">
            <!-- 投票按钮 -->
            <my-btn @click="doVote(detail)" v-if="!ky.yesNo(detail.voted)">
              投TA一票
            </my-btn>
            <my-btn class="filter-grayscale" v-else>
              已投票
            </my-btn>
            <!-- 返回按钮 -->
            <router-link :to="{ name: 'List' }">
              <my-btn>
                查看更多参赛者
              </my-btn>
            </router-link>
          </div>
        </div>
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
    <!-- 引导分享 -->
    <teleport to="#dialogs">
      <div class="share-tip" v-show="dialog.showShareTip.value"></div>
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
    <!-- 投票成功弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showVoteSuccessDialog.value">
        <div class="text-center text-2xl">
          投票成功!
        </div>
        <div class="absolute -bottom-16 h-center">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 投票没机会弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showVoteNoChanceDialog.value">
        <div class="text-center">
          <div>今天票数已用完</div>
          <div v-if="myInfo">
            <div v-if="ky.yesNo(myInfo.can_share)">
              叫上好友参与可增加投票机会
            </div>
            <div v-else>
              请明天再来吧
            </div>
          </div>
        </div>
        <div class="absolute -bottom-16 h-center" v-if="myInfo">
          <my-btn
            v-if="ky.yesNo(myInfo.can_share)"
            @click="dialog.openShareTip"
          >
            叫上好友
          </my-btn>
          <my-btn @click="dialog.closeAllDialog" v-else>
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 自定义弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showCustomDialog.value">
        <div class="text-center" v-html="msg"></div>
        <div class="absolute -bottom-16 h-center">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getDetail, getInfo, getMyInfo, postVote } from "@/apis";
import ky from "kyouka";
import NavBar from "@/components/NavBar.vue";
import { gzh, navItems, needSubscribe } from "@/consts";
import { useRoute } from "vue-router";
import { isOk } from "@/utils/request";
import MyBtn from "@/components/MyBtn.vue";

export default defineComponent({
  name: "Detail",
  components: {
    NavBar,
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const route = useRoute();
    const state = reactive<any>({
      info: null,
      navItems,
      gzh,
      myInfo: null,
      msg: "",
      detail: null,
    });
    // 详情id
    const detailId = computed(() => route.query.id);
    // 检测是否关注
    const checkSubscribe = () => {
      if (needSubscribe && !ky.yesNo(state.myInfo.subscribe)) {
        dialog.openFollowDialog();
        return false;
      }
      return true;
    };
    // 投票
    const doVote = async (item: any) => {
      if (!checkSubscribe()) {
        return;
      }
      if (Number(state.myInfo!.my_time) < 1) {
        dialog.openVoteNoChanceDialog();
        return;
      }
      const id = item.id;
      const body = { id };
      const res = await postVote(body);
      if (isOk(res)) {
        state.myInfo!.my_time -= 1;
        item.num = Number(item.num);
        item.num += 1;
        item.voted = "yes";
        dialog.openVoteSuccessDialog();
      } else if (Number(res.code) === 21019) {
        state.msg = res.msg;
        dialog.openCustomDialog();
      } else if (Number(res.code) === 301) {
        dialog.openFollowDialog();
      }
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      state.myInfo.my_time = Number(state.myInfo.my_time);
      state.detail = await getDetail({ id: detailId.value });
      await wx.shareAll(
        state.info,
        {
          shareUrl: state.detail.share_url,
        },
        ky.yesNo(state.myInfo.can_share)
      );
    });
    return { ky, dialog, wx, ...toRefs(state), doVote };
  },
});
</script>

<style lang="scss" scoped></style>
