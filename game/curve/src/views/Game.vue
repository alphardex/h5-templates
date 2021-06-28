<template>
  <div class="bg-game relative min-h-screen">
    <!-- 数据 -->
    <div class="fixed z-5 top-9 left-8" v-if="game">
      <div class="text-danger font-bold text-xl">
        {{ store.state.game.status.score }}m
      </div>
    </div>
    <!-- 游戏 -->
    <div id="game" class="fixed z-1 w-screen h-screen"></div>
    <!-- 教程 -->
    <div v-show="isTutorialShown">
      <img
        v-show="showT3"
        src="../assets/t-3.jpg"
        alt=""
        class="fixed cover z-2"
        @click="closeT3"
      />
      <img
        v-show="showT2"
        src="../assets/t-2.jpg"
        alt=""
        class="fixed cover z-3"
        @click="closeT2"
      />
      <img
        v-show="showT1"
        src="../assets/t-1.jpg"
        alt=""
        class="fixed cover z-4"
        @click="closeT1"
      />
    </div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
    <!-- 游戏结束弹窗 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showGameFinishDialog.value">
        <div v-if="rank">
          <div>
            <div>您的成绩为</div>
            <div>{{ store.state.game.status.score }}分</div>
          </div>
          <div>
            <div>累计总分</div>
            <div>{{ rank.my.score }}分</div>
          </div>
          <div>
            <div>当前排名</div>
            <div v-if="rank">
              {{ rank.my.rank }}
            </div>
          </div>
        </div>
        <div class="absolute h-center -bottom-16 flex items-center space-x-6">
          <my-btn @click="reload">
            再次挑战
          </my-btn>
          <router-link :to="{ name: 'Home' }">
            <my-btn>
              返回首页
            </my-btn>
          </router-link>
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
import { defineComponent, onMounted, onUnmounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo, getMyInfo, getRank, getStart, postFinish } from "@/apis";
import ky from "kyouka";
import MyBtn from "@/components/MyBtn.vue";
import { isOk } from "@/utils/request";
import { useStore } from "vuex";
import { reload } from "@/utils/dom";
import startCurveGame from "@/game";

export default defineComponent({
  name: "Game",
  components: {
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const store = useStore();
    const state = reactive<any>({
      info: null,
      rank: null,
      myInfo: null,
      game: null,
      finishBody: {},
      msg: "",
      isTutorialShown: false,
      showT1: false,
      showT2: false,
      showT3: false,
    });
    const endGame = async () => {
      const { finishBody } = state;
      finishBody.score = store.state.game.status.score;
      const res = await postFinish(finishBody);
      if (isOk(res)) {
        state.myInfo = await getMyInfo();
        state.rank = await getRank();
        dialog.openGameFinishDialog();
      } else {
        state.msg = res.msg;
        dialog.openCustomDialog();
      }
    };
    const start = async () => {
      const game = startCurveGame();
      state.game = game;
      // 有的手机首次路径会显示错误，故首次打开时刷新1次，算是临时的解决方案
      const firstRun = localStorage.getItem("firstRun");
      if (!firstRun) {
        localStorage.setItem("firstRun", "true");
        location.reload();
      }
      while (!store.state.game.status.isGameover) {
        await ky.sleep(0.001);
      }
      endGame();
    };
    const removeCanvas = () => {
      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((canvas) => canvas.remove());
    };
    const showTutorial = () => {
      const tutorialShown = localStorage.getItem("tutorial");
      if (!tutorialShown) {
        state.isTutorialShown = true;
        state.showT1 = true;
        state.showT2 = true;
        state.showT3 = true;
        localStorage.setItem("tutorial", "true");
      } else {
        start();
      }
    };
    const closeT1 = () => {
      state.showT1 = false;
    };
    const closeT2 = () => {
      state.showT2 = false;
    };
    const closeT3 = async () => {
      state.showT3 = false;
      await ky.sleep(10);
      start();
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.myInfo = await getMyInfo();
      const start = await getStart();
      state.finishBody.gcode = start.gcode;
      await wx.shareAll(state.info);
      await ky.sleep(10);
      removeCanvas();
      showTutorial();
    });
    onUnmounted(() => {
      state.game.destroy();
      store.commit("resetStatus");
    });
    return {
      ky,
      store,
      dialog,
      wx,
      ...toRefs(state),
      start,
      endGame,
      reload,
      closeT1,
      closeT2,
      closeT3,
    };
  },
});
</script>

<style lang="scss" scoped></style>
