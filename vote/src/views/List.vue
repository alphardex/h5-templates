<template>
  <div class="relative min-h-screen">
    <div class="mx-4">
      <!-- 搜索框 -->
      <div class="relative">
        <input
          type="text"
          class="form-control rounded-3xl"
          placeholder="搜编号或选手名称"
          v-model="words"
        />
        <div
          class="btn btn-primary btn-round absolute w-12 h-7 flex-center box-border right-1 v-center"
          @click="onSearch"
        >
          <i class="gg gg-search flex-none absolute text-white"></i>
        </div>
      </div>
      <!-- 投票作品列表 -->
      <div class="flex flex-wrap items-center justify-between">
        <router-link
          :to="{ name: 'Detail', query: { id: item.id } }"
          class="card"
          v-for="item in list.list"
          :key="item.id"
        >
          <div class="flex flex-col space-y-2">
            <!-- 作品图 -->
            <img :data-src="item.pic" alt="" class="w-30 h-40 lazyload" />
            <!-- 投票按钮 -->
            <my-btn @click.prevent="doVote(item)" v-if="!ky.yesNo(item.voted)">
              投TA一票
            </my-btn>
            <my-btn class="filter-grayscale" v-else>
              已投票
            </my-btn>
          </div>
        </router-link>
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
import {
  defineComponent,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  toRefs,
} from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo, getList, getMyInfo, postVote } from "@/apis";
import ky from "kyouka";
import useLazy from "@/hooks/useLazy";
import NavBar from "@/components/NavBar.vue";
import { gzh, navItems, needSubscribe } from "@/consts";
import { isOk } from "@/utils/request";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import MyBtn from "@/components/MyBtn.vue";

export default defineComponent({
  name: "List",
  components: {
    NavBar,
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const lazy = useLazy();
    const route = useRoute();
    const state = reactive<any>({
      info: null,
      navItems,
      gzh,
      myInfo: null,
      msg: "",
      words: "",
      page: 0,
      list: {
        page: {
          max: 1,
        },
        list: [],
      },
      loading: false,
      type: "1",
    });
    // 加载数据
    const loadData = async () => {
      state.loading = true;
      let { list, words, page } = state;
      let max = Number(list.page.max);
      if (page < max) {
        page++;
        const query = { page, words };
        console.log(query);
        const res = await getList(query);
        const newList = state.list.list.concat(res.list);
        state.page = page;
        state.list = {
          page: res.page,
          list: newList,
        };
        state.loading = false;
      }
    };
    // 触底加载
    const onReachBottom = async () => {
      if (ky.isBottomVisible(20) && !state.loading) {
        await loadData();
      }
    };
    // 清除数据
    const purgeData = () => {
      state.page = 0;
      state.list = {
        page: {
          max: 1,
        },
        list: [],
      };
    };
    // 搜索
    const onSearch = async () => {
      purgeData();
      await loadData();
    };
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
      state.type = (route.query.type as string) || "1";
      await loadData();
      window.addEventListener("scroll", onReachBottom);
      await wx.shareAll(state.info);
    });
    onUpdated(() => {
      lazy.lazyload(document.querySelectorAll(".lazyload:not([src])"));
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", onReachBottom);
    });
    onBeforeRouteUpdate(async (to, from) => {
      state.words = "";
      purgeData();
      state.type = to.query.type as string;
      await loadData();
    });
    return { ky, dialog, wx, ...toRefs(state), onSearch, doVote };
  },
});
</script>

<style lang="scss" scoped></style>
