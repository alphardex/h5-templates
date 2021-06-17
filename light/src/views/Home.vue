<template>
  <div class="relative min-h-screen" v-if="myInfo">
    <!-- 点亮按钮 -->
    <div @click="doLight" v-if="!aff">点亮</div>
    <div @click="doHelp" v-else>帮TA点亮</div>
    <div class="mx-4">
      <!-- 点亮状态 -->
      <light-status
        :lightNum="myInfo.my_num"
        :targetNum="myInfo.target_num"
        v-if="!aff"
      ></light-status>
      <light-status
        :lightNum="friendInfo.my_num"
        :targetNum="friendInfo.target_num"
        v-else
      ></light-status>
    </div>
    <div class="absolute bottom-4 h-center text-sm">常熟零距离技术支持</div>
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
    <!-- 活动规则 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showRuleDialog.value">
        <div
          class="max-h-60 overflow-y-scroll"
          v-if="info"
          v-html="info.act_rule"
        ></div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 机会用完弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLightNoChanceDialog.value">
        <div class="text-center">
          <div>您的次数已用完</div>
          <div>叫上好友一起来点亮吧~</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.openShareTip">
            叫上好友
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 自己点亮成功弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLightSuccessDialog.value">
        <div class="flex flex-col items-center space-y-3">
          <img
            :src="require(`../assets/icons/${currentIcon.icon + 1}.png`)"
            alt=""
            class="w-38"
          />
          <div>{{ currentIcon.name }}</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 帮助他人点亮成功弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLightHelpDialog.value">
        <div class="flex flex-col items-center space-y-3">
          <img
            :src="require(`../assets/icons/${currentIcon.icon + 1}.png`)"
            alt=""
            class="w-38"
          />
          <div>{{ currentIcon.name }}</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="goBack">
            我也要参加
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 全部点亮弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLightCompleteDialog.value">
        <div class="flex flex-col space-y-2">
          <input
            type="text"
            class="form-control"
            placeholder="请输入您的姓名"
            v-model="applyBody.name"
          />
          <input
            type="tel"
            class="form-control"
            placeholder="请输入您的联系方式"
            v-model="applyBody.tel"
          />
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input flex-none"
              id="agree"
              name="agree"
              v-model="agree"
            />
            <label class="form-check-label text-sm text-left" for="agree"
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
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="doReceive">
            立即领取
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 自定义弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showCustomDialog.value">
        <div class="text-center" v-html="msg"></div>
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
import { computed, defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import {
  getInfo,
  getMyInfo,
  postFriendInfo,
  postHelp,
  postLight,
  postPickup,
} from "@/apis";
import ky from "kyouka";
import { gzh, iconNames, needSubscribe } from "@/consts";
import { useRoute } from "vue-router";
import { isOk } from "@/utils/request";
import router from "@/router";
import { checkAgree, checkNameAndTel } from "@/utils/check";
import { TimerAlert } from "@/utils/alert";
import LightStatus from "@/components/LightStatus.vue";
import MyBtn from "@/components/MyBtn.vue";
import TimeRange from "@/components/TimeRange.vue";

export default defineComponent({
  name: "Home",
  components: {
    LightStatus,
    MyBtn,
    TimeRange,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const route = useRoute();
    const state = reactive<any>({
      info: null,
      gzh,
      myInfo: null,
      friendInfo: null,
      currentIconId: 0,
      msg: "",
      applyBody: {
        rid: "",
        name: "",
        tel: "",
      },
      agree: false,
    });
    // 分享码
    const aff = computed(() => {
      return route.query.aff || "";
    });
    // 当前点亮图标
    const currentIcon = computed(() => ({
      icon: state.currentIconId,
      name: iconNames[state.currentIconId],
    }));
    // 检测是否关注
    const checkSubscribe = () => {
      if (needSubscribe && !ky.yesNo(state.myInfo.subscribe)) {
        dialog.openFollowDialog();
        return false;
      }
      return true;
    };
    // 检测是否已集满
    const checkIsFull = () => {
      if (ky.yesNo(state.myInfo.is_full)) {
        state.msg = "已经获得奖品了，不能贪心哦";
        dialog.openCustomDialog();
        return true;
      }
      return false;
    };
    // 检测奖品是否还有剩余
    const checkPrizeLeft = () => {
      if (Number(state.info.prize_left) < 1) {
        state.msg = "奖品已兑完，下次再来吧";
        dialog.openCustomDialog();
        return false;
      }
      return true;
    };
    // 检测是否还有点亮次数
    const checkLightTime = () => {
      if (state.myInfo.my_time < 1) {
        dialog.openLightNoChanceDialog();
        return false;
      }
      return true;
    };
    // 打开中奖弹窗
    const openLightCompleteDialog = () => {
      if (ky.yesNo(state.myInfo.is_full) && state.myInfo.prize_id) {
        state.applyBody.rid = state.myInfo.prize_id;
        dialog.openLightCompleteDialog();
      }
    };
    // 设置当前的点亮图标
    const setCurrentIcon = (iconId: number) => {
      state.currentIconId = iconId;
    };
    // 自己点亮
    const doLight = async () => {
      const { myInfo } = state;
      if (!checkSubscribe()) {
        return;
      }
      if (checkIsFull()) {
        return;
      }
      if (!checkPrizeLeft()) {
        return;
      }
      if (!checkLightTime()) {
        return;
      }
      const res = await postLight();
      if (isOk(res)) {
        myInfo.my_time -= 1;
        myInfo.my_num += 1;
        const currentIconId = Number(myInfo.my_num) - 1;
        setCurrentIcon(currentIconId);
        if (myInfo.my_num >= myInfo.target_num) {
          state.myInfo.is_full = "yes";
          state.myInfo.prize_id = res.data.prize_id;
          openLightCompleteDialog();
        } else {
          dialog.openLightSuccessDialog();
        }
      } else if (Number(res.code) === 301) {
        dialog.openFollowDialog();
      }
    };
    // 引导分享
    const openShareTip = () => {
      if (!checkSubscribe()) {
        return;
      }
      if (checkIsFull()) {
        return;
      }
      if (!checkPrizeLeft()) {
        return;
      }
      dialog.openShareTip();
    };
    // 帮他人点亮
    const doHelp = async () => {
      if (!checkPrizeLeft()) {
        return;
      }
      const res = await postHelp({ aff: aff.value });
      if (isOk(res)) {
        state.friendInfo.my_num += 1;
        const currentIcon = Number(state.friendInfo.my_num) - 1;
        setCurrentIcon(currentIcon);
        dialog.openLightHelpDialog();
      } else {
        state.msg = res.msg;
        dialog.openCustomDialog();
      }
    };
    // 返回我的页面
    const goBack = async () => {
      router.push({ name: "Home", query: {} });
      await ky.sleep(100);
      location.reload();
    };
    // 领奖
    const doReceive = async () => {
      const { applyBody, agree } = state;
      const { name, tel } = applyBody;
      if (!checkNameAndTel(name, tel)) {
        return;
      }
      if (!checkAgree(agree)) {
        return;
      }
      const res = await postPickup(applyBody);
      if (isOk(res)) {
        TimerAlert.fire("领取成功！");
        await ky.sleep(600);
        dialog.closeAllDialog();
        router.push({ name: "Prize" });
      }
    };
    // 判断在自己页还是在好友页
    const judgeIsMeOrFriend = async () => {
      if (aff.value) {
        // 好友页
        const res = await postFriendInfo({ aff: aff.value });
        if (isOk(res)) {
          state.friendInfo = res.data;
        }
      } else {
        // 自己页
        openLightCompleteDialog();
      }
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      judgeIsMeOrFriend();
      await wx.shareAll(state.info, { shareUrl: state.myInfo.my_share_url });
    });
    return {
      ky,
      dialog,
      wx,
      ...toRefs(state),
      aff,
      currentIcon,
      doLight,
      openShareTip,
      doHelp,
      goBack,
      doReceive,
    };
  },
});
</script>

<style lang="scss" scoped></style>
