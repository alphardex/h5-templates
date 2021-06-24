<template>
  <div class="relative min-h-screen">
    <div class="mx-4 space-y-4">
      <!-- 抽奖 -->
      <div class="card">
        <div class="space-y-3 text-center text-sm">
          <div>点击下方图片进行抽奖</div>
          <div class="flex items-center justify-between">
            <img
              src="../assets/lottery.png"
              alt=""
              class="w-22"
              v-for="n in 3"
              :key="n"
              @click="doLottery"
              :class="{ 'pointer-events-none': disableClick }"
            />
          </div>
          <div v-if="myInfo">
            <span>你还有</span
            ><span class="text-danger">{{ myInfo.my_draw_time }}</span
            ><span>次抽奖机会</span>
          </div>
        </div>
      </div>
      <!-- 我的奖品 -->
      <div class="card">
        <div v-if="myPrize">
          <div
            class="py-6 text-center font-bold"
            v-if="ky.isEmpty(myPrize.my_prize)"
          >
            暂无奖品
          </div>
          <div class="space-y-3" v-else>
            <div
              class="flex items-center justify-between"
              v-for="item in myPrize.my_prize"
              :key="item.id"
            >
              <div class="font-bold">{{ item.title }}</div>
              <my-btn
                :type="2"
                v-if="!ky.yesNo(item.havGet)"
                @click="openLotteryWinDialog(item)"
              >
                立即领取
              </my-btn>
              <my-btn :type="2" class="filter-grayscale" v-else>
                已领取
              </my-btn>
            </div>
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
    <!-- 没有机会弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLotteryNoChanceDialog.value">
        <div class="text-center space-y-3">
          <div class="text-center text-sm whitespace-no-wrap">
            <div>你没有抽奖机会哦</div>
            <div v-if="myInfo">
              <div v-if="ky.yesNo(myInfo.can_share)">
                叫上好友可增加1次抽奖机会~
              </div>
              <div v-else>
                去答题可增加1次抽奖机会~
              </div>
            </div>
          </div>
        </div>
        <div class="absolute h-center -bottom-16" v-if="myInfo">
          <my-btn
            @click="dialog.openShareTip"
            v-if="ky.yesNo(myInfo.can_share)"
          >
            叫上好友
          </my-btn>
          <my-btn v-else @click="dialog.closeAllDialog">
            好的
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 未中奖弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLotteryLoseDialog.value">
        <div class="text-center space-y-3">
          <div class="text-center text-sm whitespace-no-wrap">
            <div>很遗憾，您没有中奖</div>
            <div v-if="myInfo">
              <div v-if="ky.yesNo(myInfo.can_share)">
                邀请好友可增加1次抽奖机会
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
    <!-- 中奖弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLotteryWinDialog.value">
        <div class="space-y-2">
          <div class="text-center">
            <div>恭喜您获得</div>
            <div class="font-bold text-xl text-danger" v-if="currentPrize">
              {{ currentPrize.title }}
            </div>
          </div>
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
              placeholder="请输入您的手机号"
              v-model="applyBody.tel"
            />
            <div class="flex flex-col space-y-2" v-if="needReceivePrizeSendMsg">
              <div class="form-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="请输入图形验证码"
                  v-model="sendCodeBody.code"
                />
                <img
                  :src="seccodeImg"
                  alt=""
                  @click="setSeccode"
                  class="ml-3 box-border w-30 h-8"
                />
              </div>
              <div class="form-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="请输入短信验证码"
                  v-model="applyBody.auth_code"
                />
                <div
                  class="btn btn-primary btn-auth box-border w-20 h-8 px-4 py-1 ml-2 flex-center text-xs"
                  @click="getAuthCode"
                >
                  获取验证码
                </div>
              </div>
            </div>
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input flex-none"
                id="agree"
                name="agree"
                v-model="agree"
              />
              <label class="form-check-label text-xs text-left" for="agree"
                >我已阅读并接受<a
                  class="text-info"
                  target="_blank"
                  href="https://app.cs090.com/serviceItem.html"
                  >《零距离服务条款》</a
                >和<a
                  class="text-info"
                  target="_blank"
                  href="https://app.cs090.com/privacy.html"
                  >《隐私政策》</a
                >
              </label>
            </div>
          </div>
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="doApply">
            立即领取
          </my-btn>
        </div>
      </div>
    </teleport>
    <!-- 核销弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showLotteryExchangeDialog.value">
        <div class="text-center">
          <input
            type="text"
            class="form-control"
            v-model="exchangeBody.excode"
            placeholder="请输入核销码"
          />
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="doExchange">
            立即核销
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
import {
  getInfo,
  getMyInfo,
  getSecCode,
  postApply,
  postExchange,
  postLottery,
  postSendCode,
} from "@/apis";
import ky from "kyouka";
import NavBar from "@/components/NavBar.vue";
import { navItems, needReceivePrizeSendMsg } from "@/consts";
import { isOk } from "@/utils/request";
import {
  checkAgree,
  checkAuth,
  checkBasic,
  checkSeccode,
  checkTel,
} from "@/utils/check";
import { Alert } from "@/utils/alert";
import MyBtn from "@/components/MyBtn.vue";

export default defineComponent({
  name: "Prize",
  components: {
    NavBar,
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      navItems,
      myPrize: null,
      myInfo: null,
      currentPrize: {
        title: "",
        id: "",
      },
      applyBody: {
        id: "",
        name: "",
        tel: "",
        auth_code: "",
      },
      seccodeImg: "",
      sendCodeBody: {
        tel: "",
        code: "",
      },
      agree: false,
      exchangeBody: {
        id: "",
        excode: "",
      },
      disableClick: false,
      needReceivePrizeSendMsg,
    });
    // 设置图形验证码
    const setSeccode = async () => {
      state.seccodeImg = await getSecCode();
    };
    // 设置当前奖品
    const setCurrentPrize = (prize: any) => {
      state.currentPrize = prize;
      state.applyBody!.id = prize.id;
    };
    // 打开中奖弹窗
    const openLotteryWinDialog = (prize: any) => {
      if (needReceivePrizeSendMsg) {
        setSeccode();
      }
      setCurrentPrize(prize);
      dialog.openLotteryWinDialog();
    };
    // 抽奖
    const doLottery = async () => {
      if (state.myInfo.my_draw_time < 1) {
        dialog.openLotteryNoChanceDialog();
        return;
      }
      state.disableClick = true;
      const res = await postLottery();
      state.disableClick = false;
      if (isOk(res)) {
        state.myInfo.my_draw_time -= 1;
        state.myInfo = await getMyInfo();
        const result = res.data;
        const { win } = result;
        if (ky.yesNo(win)) {
          openLotteryWinDialog(result);
        } else {
          dialog.openLotteryLoseDialog();
        }
      }
    };
    // 领奖
    const doApply = async () => {
      const { applyBody, agree } = state;
      const { name, tel, auth_code } = applyBody;
      if (!checkBasic(name)) {
        return;
      }
      if (!checkTel(tel)) {
        return;
      }
      if (needReceivePrizeSendMsg && !checkAuth(auth_code)) {
        return;
      }
      if (!checkAgree(agree)) {
        return;
      }
      const res = await postApply(applyBody);
      if (isOk(res)) {
        Alert.fire("领取成功！");
        await ky.sleep(600);
        location.reload();
      }
    };
    // 发送短信验证码
    const getAuthCode = async () => {
      const { sendCodeBody, applyBody } = state;
      sendCodeBody.tel = applyBody.tel;
      const { tel, code } = sendCodeBody;
      if (!checkTel(tel)) {
        return;
      }
      if (!checkSeccode(code)) {
        return;
      }
      const res = await postSendCode(sendCodeBody);
      if (isOk(res)) {
        let time = 60;
        const btnAuth = document.querySelector(".btn-auth");
        btnAuth!.classList.add("pointer-events-none");
        const timer = setInterval(() => {
          btnAuth!.textContent = `${time}s`;
          time--;
          if (time < 0) {
            btnAuth!.textContent = `重新发送`;
            btnAuth!.classList.remove("pointer-events-none");
            clearInterval(timer);
          }
        }, 1000);
      }
    };
    // 打开核销弹窗
    const openLotteryExchangeDialog = (item: any) => {
      state.exchangeBody.id = item.id;
      dialog.openLotteryExchangeDialog();
    };
    // 核销
    const doExchange = async () => {
      const { exchangeBody } = state;
      const { excode } = exchangeBody;
      if (!excode) {
        Alert.fire("请输入核销码");
        return;
      }
      const res = await postExchange(exchangeBody);
      if (isOk(res)) {
        Alert.fire("核销成功！");
        await ky.sleep(600);
        location.reload();
      }
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      state.myInfo.my_draw_time = Number(state.myInfo.my_draw_time);
      state.myPrize = state.myInfo;
      await wx.shareAll(state.info);
    });
    return {
      ky,
      dialog,
      wx,
      ...toRefs(state),
      doLottery,
      doApply,
      openLotteryWinDialog,
      setSeccode,
      getAuthCode,
      openLotteryExchangeDialog,
      doExchange,
    };
  },
});
</script>

<style lang="scss" scoped></style>
