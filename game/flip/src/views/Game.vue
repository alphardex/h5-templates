<template>
  <div class="relative min-h-screen">
    <!-- 开始按钮 -->
    <div class="btn-start-container fixed z-3 bottom-16 h-center">
      <my-btn class="btn-start" @click="startGame">开始游戏</my-btn>
    </div>
    <div class="relative z-1">
      <div class="mx-4">
        <!-- 游戏状态 -->
        <div class="flex items-center justify-between" v-if="info">
          <!-- 用户信息 -->
          <div>{{ info.wxinfo.nickname }}</div>
          <!-- 倒计时 -->
          <span class="flex items-center space-x-1 font-bold">
            <span class="flex-center" v-if="timer">
              {{ timer.duration.minute }}:{{ timer.duration.second }}
            </span>
            <span>秒</span>
          </span>
        </div>
        <!-- 游戏界面 -->
        <div
          class="game flex-center flex-wrap"
          :class="{ 'pointer-events-none': disableClick }"
        >
          <div
            class="memory-card relative w-20 h-24 m-05 mb-2"
            :class="[
              {
                'pointer-events-none':
                  isTwoCardsFlipping ||
                  isTwoCardsFlipped ||
                  item.isFlipping ||
                  item.flipped,
              },
              `memory-card-${i}`,
              `order-${item.order}`,
              `memory-card-type-${item.type}`,
            ]"
            v-for="(item, i) in memoryCards"
            :key="i"
            @click="flip(item)"
          >
            <div
              class="memory-card-face memory-card-face--front absolute cover flex-center"
            >
              <img :src="item.front" alt="" class="w-full" />
              <span
                class="absolute text-black text-3xl font-bold"
                v-if="debugMode"
              >
                {{ item.type }}
              </span>
            </div>
            <div
              class="memory-card-face memory-card-face--back absolute cover flex-center"
            >
              <div class="relative flex-center">
                <img :src="item.back" alt="" class="w-full" />
              </div>
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
    <!-- 游戏成功 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showGameWinDialog.value">
        <div class="text-center">
          <div>恭喜你，过关了</div>
          <div>获得了1次抽奖机会</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <router-link :to="{ name: 'Prize' }">
            <my-btn>
              去抽奖
            </my-btn>
          </router-link>
        </div>
      </div>
    </teleport>
    <!-- 游戏失败 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showGameLoseDialog.value">
        <div class="text-center">
          <div>很遗憾，您没有过关</div>
          <div>未能获得抽奖机会</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <router-link :to="{ name: 'Home' }">
            <my-btn>
              再来一次
            </my-btn>
          </router-link>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
} from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { getInfo, postSubmit } from "@/apis";
import ky from "kyouka";
import { Timer } from "@/utils/timer";
import { isOk } from "@/utils/request";
import gsap from "gsap";
import MyBtn from "@/components/MyBtn.vue";
import { memoryCardState } from "@/consts";

export default defineComponent({
  name: "Game",
  components: {
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      timeLimit: 90,
      timer: null,
      gameover: false,
      memoryCards: [],
      disableClick: true,
      score: 0,
      debugMode: false,
      viewTime: 2,
    });
    // 正在翻转的牌
    const flippingCards = computed(() => {
      return state.memoryCards.filter((e: any) => e.isFlipping);
    });
    // 已翻面且并未消除的牌
    const flippedCards = computed(() => {
      return state.memoryCards.filter((e: any) => e.flipped && !e.right);
    });
    // 是否2张牌正在翻面
    const isTwoCardsFlipping = computed(() => {
      return flippingCards.value.length >= 2;
    });
    // 是否2张牌已翻面
    const isTwoCardsFlipped = computed(() => {
      return flippedCards.value.length >= 2;
    });
    // 是否通关
    const isWin = computed(() => {
      return state.score >= state.memoryCards.length / 2;
    });
    // 所用时间
    const elapsedTime = computed(() => {
      return state.timer
        ? Math.ceil(state.timeLimit - state.timer.totalMs / 1000)
        : 0;
    });
    // 洗牌
    const shuffleCards = () => {
      const randomOrders = ky.shuffle([
        ...ky.range(0, state.memoryCards.length),
      ]);
      state.memoryCards.forEach((item: any, i: number) => {
        item.order = randomOrders[i] + 1;
      });
    };
    // 重置卡牌
    const resetCards = () => {
      state.memoryCards.forEach((item: any) => {
        item.flipped = false;
        item.right = false;
      });
    };
    // 初始化计时器
    const initTimer = () => {
      const begin = new Date();
      const end = ky.addSecondsToDate(new Date(), state.timeLimit);
      const timer = new Timer(begin, end, true);
      state.timer = timer;
    };
    // 结束游戏
    const endGame = async () => {
      state.gameover = true;
      state.disableClick = true;
      if (isWin.value) {
        if (!state.info.isGotChance) {
          const res = await postSubmit({ second: elapsedTime.value });
          if (isOk(res)) {
            dialog.openGameWinDialog();
          }
        } else {
          dialog.openGameWinDialog();
        }
      } else {
        dialog.openGameLoseDialog();
      }
    };
    // 开始计时器
    const startTimer = async () => {
      const { timer } = state;
      timer.start();
      while (timer.totalMs >= 0) {
        state.timer = { ...timer };
        if (state.gameover) {
          break;
        }
        await ky.sleep(0.0001);
        if (state.timer.totalMs <= 0 || isWin.value) {
          await endGame();
        }
      }
    };
    // 开始游戏
    const startGame = () => {
      gsap.set(".btn-start-container", {
        pointerEvents: "none",
      });
      gsap.set(".btn-start", {
        pointerEvents: "none",
      });
      gsap.to(".btn-start", {
        opacity: 0,
        duration: 0.6,
      });
      const cards = state.memoryCards.map((e: any) => e.el);
      const t = gsap.timeline();
      t.to(cards, {
        rotateY: 180,
        duration: 1,
      }).to(cards, {
        rotateY: 0,
        duration: 1,
        delay: state.viewTime,
        onComplete() {
          state.gameover = false;
          state.disableClick = false;
          startTimer();
        },
      });
    };
    // 开始一轮
    const startOneRound = () => {
      resetCards();
      shuffleCards();
      initTimer();
    };
    // 翻牌
    const flip = (activeCard: any) => {
      const t = gsap.timeline();
      if (!activeCard.flipped) {
        activeCard.isFlipping = true;
        t.to(activeCard.el, {
          rotateY: 180,
          duration: 1,
          onComplete() {
            activeCard.isFlipping = false;
            activeCard.flipped = true;
            if (isTwoCardsFlipped.value) {
              const [card1, card2] = flippedCards.value;
              const isRight = card1.type === card2.type;
              if (!isRight) {
                [card1, card2].forEach((item) => {
                  item.isFlipping = true;
                });
                gsap.to(
                  [card1, card2].map((e) => e.el),
                  {
                    rotateY: 0,
                    duration: 0.6,
                    delay: 0.1,
                    onComplete() {
                      [card1, card2].forEach((item) => {
                        item.isFlipping = false;
                        item.flipped = false;
                      });
                    },
                  }
                );
              } else {
                [card1, card2].forEach((item) => {
                  item.right = true;
                });
                state.score += 1;
              }
            }
          },
        });
      }
    };
    // 获取卡牌
    const getMemoryCards = async () => {
      const memoryCardTypeCount = 6;
      const memoryCardsHalf = [...ky.range(0, memoryCardTypeCount)].map(
        (e: number) => {
          return {
            ...memoryCardState,
            type: e + 1,
            back: `./static/card-back-${e + 1}.png`,
          };
        }
      );
      const memoryCards = [
        ...ky.deepClone(memoryCardsHalf),
        ...ky.deepClone(memoryCardsHalf),
      ];
      state.memoryCards = memoryCards;
    };
    // 标记卡牌
    const markMemoryCards = async () => {
      state.memoryCards.forEach((item: any, i: number) => {
        item.el = document.querySelector(`.memory-card-${i}`);
      });
    };
    onMounted(async () => {
      state.info = await getInfo();
      await getMemoryCards();
      await markMemoryCards();
      startOneRound();
      await wx.shareAll(state.info);
    });
    onUnmounted(() => {
      state.gameover = true;
    });
    return {
      ky,
      dialog,
      wx,
      ...toRefs(state),
      isTwoCardsFlipping,
      isTwoCardsFlipped,
      isWin,
      elapsedTime,
      startGame,
      flip,
    };
  },
});
</script>

<style lang="scss" scoped>
.game {
  perspective: 800px;
}

.memory-card {
  transform-style: preserve-3d;

  &-face {
    backface-visibility: hidden;

    &--back {
      transform: rotateY(0.5turn);
    }
  }
}
</style>
