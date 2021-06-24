<template>
  <div class="relative min-h-screen">
    <div class="mx-4" v-if="currentQuestion">
      <!-- 题目 -->
      <div class="card">
        <div class="space-y-3">
          <!-- 题目元数据 -->
          <div class="flex items-center justify-between">
            <!-- 题号 -->
            <div>{{ currentQuestionNumber }}</div>
            <!-- 倒计时 -->
            <div v-if="timer">
              <span>{{ timer.duration.minute }}</span>
              <span>:</span>
              <span>{{ timer.duration.second }}</span>
            </div>
          </div>
          <!-- 题干 -->
          <div
            class="whitespace-pre-wrap leading-relaxed"
            v-html="currentQuestion.question"
          ></div>
          <!-- 选项 -->
          <div
            class="space-y-2"
            :class="{ 'pointer-events-none': disableClick }"
          >
            <div
              class="w-full"
              v-for="(value, key, i) in currentQuestion.option"
              :key="i"
            >
              <input
                type="radio"
                v-model="myAnswerRadio"
                v-if="currentQuestionType === 'radio'"
                :value="key"
                class="choice-check hidden"
                :id="`choice-${key}`"
              />
              <input
                type="checkbox"
                v-model="myAnswerCheckbox"
                v-else
                :value="key"
                class="choice-check hidden"
                :id="`choice-${key}`"
              />
              <label
                class="choice-label relative inline-flex items-center box-border w-full p-3 pr-9 rounded-xl transition-all duration-300"
                :for="`choice-${key}`"
                :data-choice="key"
              >
                <span
                  class="choice-label-dot flex-none relative box-border w-4 h-4 rounded-full mr-2"
                  :class="{ square: currentQuestionType === 'checkbox' }"
                  v-if="showChoiceDot"
                ></span>
                <span>
                  <span>{{ key }}. </span>
                  <span class="break-all" v-html="value"></span>
                  <div class="absolute v-center right-4">
                    <img
                      src="../assets/right.png"
                      alt=""
                      class="right-icon w-5 block"
                    />
                    <img
                      src="../assets/wrong.png"
                      alt=""
                      class="wrong-icon w-5 block"
                    />
                  </div>
                </span>
              </label>
            </div>
          </div>
          <!-- 提交按钮 -->
          <div class="text-center">
            <my-btn
              :class="{ 'pointer-events-none': disableClick }"
              @click="judge"
              v-if="!isLastQuestion"
            >
              下一题
            </my-btn>
            <my-btn
              @click="judge"
              :class="{ 'pointer-events-none': disableClick }"
              v-else
            >
              提交
            </my-btn>
          </div>
        </div>
      </div>
    </div>
    <div class="h-16"></div>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        v-if="dialog.showBackdrop.value"
        @click="dialog.clickCloseDialog"
      ></div>
    </teleport>
    <!-- 答题成功 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showQuizWinDialog.value">
        <div class="text-center">
          <div>恭喜您答对了{{ score }}道题</div>
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
    <!-- 答题失败 -->
    <teleport to="#dialogs">
      <div class="dialog" v-show="dialog.showQuizLoseDialog.value">
        <div class="text-center">
          <div>很遗憾您未答对{{ requirement }}道题</div>
          <div>未能获得抽奖机会</div>
        </div>
        <div class="absolute h-center -bottom-16">
          <router-link :to="{ name: 'Home' }">
            <my-btn>
              重新答题
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
import { getInfo, getQuestions, postSubmit } from "@/apis";
import ky from "kyouka";
import { Timer } from "@/utils/timer";
import { isOk } from "@/utils/request";
import { needQuizTimer, needShowRightOrWrong, showChoiceDot } from "@/consts";
import MyBtn from "@/components/MyBtn.vue";
import { Alert } from "@/utils/alert";

export default defineComponent({
  name: "Quiz",
  components: {
    MyBtn,
  },
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<any>({
      info: null,
      total: 0,
      currentQuestionId: 0,
      currentQuestion: null,
      nextQuestion: null,
      myAnswerRadio: "",
      myAnswerCheckbox: [],
      disableClick: false,
      score: 0,
      scoreRate: 1,
      requirement: 5,
      timer: null,
      timeLimit: 180,
      isSubmittedBeforeTimeUp: false,
      showChoiceDot,
    });
    // 当前题数
    const currentQuestionNumber = computed(() => {
      return `第${state.currentQuestionId + 1}题/共${state.total}题`;
    });
    // 时间到
    const isTimeUp = computed(() => {
      return state.timer ? state.timer.totalMs <= 0 : false;
    });
    // 是否是最后一题
    const isLastQuestion = computed(
      () => state.currentQuestionId + 1 >= Number(state.total)
    );
    // 当前题类
    const currentQuestionType = computed(() => {
      return state.currentQuestion
        ? state.currentQuestion.type === "1"
          ? "radio"
          : "checkbox"
        : "";
    });
    // 清空计时器
    const endTimer = () => {
      if (state.timer) {
        clearInterval(state.timer);
      }
    };
    // 下一题
    const nextQuestion = () => {
      state.disableClick = false;
      state.myAnswerRadio = "";
      state.myAnswerCheckbox = [];
      state.currentQuestionId += 1;
      state.currentQuestion = { ...state.nextQuestion };
    };
    // 判断正误
    const judge = async (needsCheck = true) => {
      let { myAnswerRadio, myAnswerCheckbox } = state;
      // 单选判断空值
      if (currentQuestionType.value === "radio") {
        if (needsCheck && !myAnswerRadio) {
          Alert.fire("请先做出选择再点击下一题");
          return;
        }
      }
      // 多选判断空值
      if (currentQuestionType.value === "checkbox") {
        if (needsCheck && ky.isEmpty(myAnswerCheckbox)) {
          Alert.fire("请先做出选择再点击下一题");
          return;
        }
        // 多选选多项
        if (needsCheck && myAnswerCheckbox.length < 2) {
          Alert.fire("本题为多选题，请至少选择两项");
          return;
        }
      }
      const myAnswerCheckboxString = myAnswerCheckbox.sort().join(",");
      const myAnswer =
        currentQuestionType.value === "radio"
          ? myAnswerRadio
          : myAnswerCheckboxString;
      const submitBody = { answer: myAnswer };
      const res = await postSubmit(submitBody);
      if (isOk(res)) {
        const result = res.data;
        const isRight = ky.yesNo(result.is_right);
        if (isRight) {
          state.score += state.scoreRate;
        }
        // 判断对错
        if (needShowRightOrWrong) {
          state.disableClick = true;
          const choiceClass = isRight ? "right" : "wrong";
          if (currentQuestionType.value === "radio") {
            const myChoice = document.querySelector(
              `.choice-label[data-choice=${myAnswerRadio}]`
            );
            myChoice!.classList.add(choiceClass);
          } else if (currentQuestionType.value === "checkbox") {
            myAnswerCheckbox.forEach((ma: string) => {
              const myChoice = document.querySelector(
                `.choice-label[data-choice=${ma}]`
              );
              myChoice!.classList.add(choiceClass);
            });
          }
          await ky.sleep(1200);
          const choices = document.querySelectorAll(".choice-label");
          choices.forEach((choice) => {
            choice.classList.remove("wrong");
            choice.classList.remove("right");
          });
          state.disableClick = false;
        }
        // 下一题
        const isEnd = ky.yesNo(result.is_end);
        if (isEnd) {
          state.isSubmittedBeforeTimeUp = true;
          const isWin = ky.yesNo(result.is_win);
          if (isWin) {
            dialog.openQuizWinDialog();
          } else {
            dialog.openQuizLoseDialog();
          }
        } else {
          state.nextQuestion = result.next;
          nextQuestion();
        }
      }
    };
    // 开始计时器
    const startTimer = async () => {
      const begin = new Date();
      const end = ky.addSecondsToDate(new Date(), state.timeLimit);
      const timer = new Timer(begin, end, true);
      state.timer = { ...timer };
      timer.start();
      while (timer.totalMs >= 0) {
        state.timer = { ...timer };
        // 在时间到之前提交时，提前停止计时器
        if (state.isSubmittedBeforeTimeUp) {
          break;
        }
        // 时间到自动提交
        if (isTimeUp.value) {
          await judge(false);
          break;
        }
        await ky.sleep(0.001);
      }
    };
    // 获取问题
    const fetchQuestion = async () => {
      const questions = await getQuestions();
      const { total, question } = questions;
      state.total = total;
      state.currentQuestion = question;
    };
    onMounted(async () => {
      state.info = await getInfo();
      fetchQuestion();
      if (needQuizTimer) {
        startTimer();
      }
      await wx.shareAll(state.info);
    });
    onUnmounted(() => {
      endTimer();
    });
    return {
      ky,
      dialog,
      wx,
      ...toRefs(state),
      currentQuestionNumber,
      currentQuestionType,
      isTimeUp,
      isLastQuestion,
      judge,
    };
  },
});
</script>

<style lang="scss" scoped>
.right-icon,
.wrong-icon {
  opacity: 0;
  transition: 0.3s;
}

.wrong-icon {
  position: absolute;
  top: 0;
  left: 0;
}

.choice-check {
  &:checked {
    & ~ .choice-label {
      color: white;
      background: black;

      .choice-label-dot {
        &::before {
          transform: scale(0.4);
        }
      }
    }
  }
}

.choice-label {
  &.right {
    .right-icon {
      opacity: 1;
    }
  }

  &.wrong {
    .wrong-icon {
      opacity: 1;
    }
  }
}

@mixin cover(
  $top: 0,
  $left: 0,
  $width: 100%,
  $height: 100%,
  $position: absolute
) {
  position: $position;
  top: $top;
  left: $left;
  width: $width;
  height: $height;
}

.choice-label-dot {
  --dot-color: var(--primary-color);
  --dot-border-color: var(--primary-color);

  box-shadow: inset 0 0 0 2px var(--dot-border-color);

  &::before {
    @include cover;
    content: "";
    background: var(--dot-color);
    border-radius: inherit;
    transform: scale(0);
    transition: 0.3s;
  }

  &.square {
    border-radius: 0 !important;

    &::before {
      border-radius: 0 !important;
    }
  }
}
</style>
