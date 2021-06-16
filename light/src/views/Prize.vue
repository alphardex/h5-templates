<template>
  <div class="relative min-h-screen">
    <div class="mx-4">
      <!-- 我的奖品 -->
      <div class="card">
        <div v-if="myPrize">
          <div class="py-6 text-center font-bold" v-if="ky.isEmpty(myPrize)">
            暂无奖品
          </div>
          <div class="space-y-3" v-else>
            <div
              class="flex items-center justify-between"
              v-for="item in myPrize"
              :key="item.id"
            >
              <div class="font-bold">{{ item.title }}</div>
              <my-btn
                :type="2"
                v-if="!ky.yesNo(item.havGet)"
                @click="openLotteryExchangeDialog(item)"
              >
                核销
              </my-btn>
              <my-btn :type="2" class="filter-grayscale" v-else>
                已领取
              </my-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
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
    <!-- 核销弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showWriteOffDialog.value">
        <div class="text-center">
          <input
            type="text"
            class="form-control"
            placeholder="请输入核销码"
            v-model="exchangeBody.excode"
          />
        </div>
        <div class="absolute h-center -bottom-16">
          <my-btn @click="doExchange">
            核销
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
  getMyPrize,
  postExchange,
  postPickup,
} from "@/apis";
import ky from "kyouka";
import { checkAgree, checkNameAndTel } from "@/utils/check";
import { isOk } from "@/utils/request";
import { Alert, TimerAlert } from "@/utils/alert";
import MyBtn from "@/components/MyBtn.vue";

export default defineComponent({
  name: "Prize",
  components: {
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      myInfo: null,
      myPrize: null,
      applyBody: {
        rid: "",
        name: "",
        tel: "",
      },
      agree: false,
      exchangeBody: {
        rid: "",
        excode: "",
      },
    });
    // 打开中奖弹窗
    const openLightCompleteDialog = () => {
      if (ky.yesNo(state.myInfo.is_full) && state.myInfo.prize_id) {
        state.applyBody.rid = state.myInfo.prize_id;
        dialog.openLightCompleteDialog();
      }
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
        location.reload();
      }
    };
    // 打开核销弹窗
    const openLotteryExchangeDialog = (item: any) => {
      state.exchangeBody.rid = item.id;
      dialog.openWriteOffDialog();
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
        Alert.fire("核销成功");
        await ky.sleep(600);
        location.reload();
      }
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      state.myPrize = await getMyPrize();
      openLightCompleteDialog();
      await wx.shareAll(state.info);
    });
    return {
      ky,
      dialog,
      wx,
      ...toRefs(state),
      doReceive,
      openLotteryExchangeDialog,
      doExchange,
    };
  },
});
</script>

<style lang="scss" scoped></style>
