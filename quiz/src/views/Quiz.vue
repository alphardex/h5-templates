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
            v-html="currentQuestion.ext1"
          ></div>
          <!-- 选项 -->
          <div
            class="space-y-2"
            :class="{ 'pointer-events-none': disableClick }"
          >
            <div class="w-full" v-for="(item, i) in choices" :key="i">
              <div class="w-full" v-if="currentQuestion[item.name]">
                <input
                  type="radio"
                  v-model="myAnswerRadio"
                  v-if="currentQuestionType === 'radio'"
                  :value="item.value"
                  class="choice-check hidden"
                  :id="`choice-${item.value}`"
                />
                <input
                  type="checkbox"
                  v-model="myAnswerCheckbox"
                  v-else
                  :value="item.value"
                  class="choice-check hidden"
                  :id="`choice-${item.value}`"
                />
                <label
                  class="choice-label relative inline-flex items-center box-border w-full p-3 pr-9 rounded-xl transition-all duration-300"
                  :for="`choice-${item.value}`"
                  :data-choice="item.value"
                >
                  <span
                    class="choice-label-dot flex-none relative box-border w-4 h-4 rounded-full mr-2"
                    :class="{ square: currentQuestionType === 'checkbox' }"
                    v-if="showChoiceDot"
                  ></span>
                  <span>
                    <span>{{ item.value }}. </span>
                    <span
                      class="break-all"
                      v-html="currentQuestion[item.name]"
                    ></span>
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
          <div>恭喜您答对了{{ requirement }}道题</div>
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
import {
  canRetryWhenWrong,
  needQuizTimer,
  needShowRightOrWrong,
  showRightAnswerWhenWrong,
  showChoiceDot,
} from "@/consts";
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
      questions: [],
      currentQuestionId: -1,
      myAnswerRadio: "",
      myAnswerCheckbox: [],
      myAnswers: [],
      choices: [
        { name: "ext3", value: "A" },
        { name: "ext4", value: "B" },
        { name: "ext5", value: "C" },
        { name: "ext6", value: "D" },
        { name: "ext7", value: "E" },
      ],
      disableClick: false,
      score: 0,
      scoreRate: 1,
      requirement: 3,
      timer: null,
      timeLimit: 180,
      isSubmittedBeforeTimeUp: false,
      showChoiceDot,
    });
    // 当前问题
    const currentQuestion = computed(() => {
      return !ky.isEmpty(state.questions) && state.currentQuestionId >= 0
        ? state.questions[state.currentQuestionId]
        : null;
    });
    // 当前题数
    const currentQuestionNumber = computed(() => {
      return currentQuestion.value
        ? `第${state.currentQuestionId + 1}题/共${state.questions.length}题`
        : "";
    });
    // 时间到
    const isTimeUp = computed(() => {
      return state.timer ? state.timer.totalMs <= 0 : false;
    });
    // 是否是最后一题
    const isLastQuestion = computed(
      () => state.currentQuestionId + 1 >= state.questions.length
    );
    // 当前题类
    const currentQuestionType = computed(() => {
      return currentQuestion.value
        ? currentQuestion.value.ext2.includes(",")
          ? "checkbox"
          : "radio"
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
      state.currentQuestionId += 1;
      state.disableClick = false;
    };
    // 提交
    const submit = async () => {
      const { myAnswers } = state;
      const myanswer = myAnswers;
      const unansweredQuestions = state.questions.filter(
        (item: any) => !item.answered
      );
      const unansweredAnswers = unansweredQuestions.map(
        (item: any) => `${item.id}|N`
      );
      const finalAnswer = [...myanswer, ...unansweredAnswers];
      console.log(finalAnswer);
      const res = await postSubmit({ myanswer: finalAnswer });
      if (isOk(res)) {
        const result = res.data;
        const score = result.rightNum;
        state.score = score;
        if (score >= state.requirement) {
          dialog.openQuizWinDialog();
        } else {
          dialog.openQuizLoseDialog();
        }
      }
    };
    // 判断正误
    const judge = async (needsCheck = true) => {
      let isRight = false;
      let { myAnswerRadio, myAnswerCheckbox } = state;
      myAnswerCheckbox = myAnswerCheckbox.sort();
      const myAnswerCheckboxString = myAnswerCheckbox.join(",");
      const correctAnswer = currentQuestion.value.ext2;
      if (currentQuestionType.value === "radio") {
        if (needsCheck && !myAnswerRadio) {
          Alert.fire("请先做出选择再点击下一题");
          return;
        }
        // 单选判断对错
        if (myAnswerRadio === correctAnswer) {
          isRight = true;
        }
        // 单选显示对错
        if (needShowRightOrWrong) {
          state.disableClick = true;
          if (isRight) {
            const rightChoice = document.querySelector(
              `.choice-label[data-choice=${myAnswerRadio}]`
            );
            if (rightChoice) {
              rightChoice!.classList.add("right");
            }
          } else {
            if (showRightAnswerWhenWrong) {
              const rightChoice = document.querySelector(
                `.choice-label[data-choice=${correctAnswer}]`
              );
              if (rightChoice) {
                rightChoice!.classList.add("right");
              }
            }
            const wrongChoice = document.querySelector(
              `.choice-label[data-choice=${myAnswerRadio}]`
            );
            if (wrongChoice) {
              wrongChoice!.classList.add("wrong");
            }
          }
        }
      } else {
        if (needsCheck && ky.isEmpty(myAnswerCheckbox)) {
          Alert.fire("请先做出选择再点击下一题");
          return;
        }
        // 多选判断对错
        if (myAnswerCheckboxString === correctAnswer) {
          isRight = true;
        }
        // 多选显示对错
        if (needShowRightOrWrong) {
          state.disableClick = true;
          const correctAnswers = currentQuestion.value.ext2.split(",");
          correctAnswers.forEach((ca: string) => {
            const rightChoice = document.querySelector(
              `.choice-label[data-choice=${ca}]`
            );
            rightChoice!.classList.add("right");
          });
          myAnswerCheckbox.forEach((ma: string) => {
            if (!correctAnswers.includes(ma)) {
              const wrongChoice = document.querySelector(
                `.choice-label[data-choice=${ma}]`
              );
              wrongChoice!.classList.add("wrong");
            }
          });
        }
      }
      if (needShowRightOrWrong) {
        await ky.sleep(1200);
        const choices = document.querySelectorAll(".choice-label");
        choices.forEach((choice) => {
          choice.classList.remove("wrong");
          choice.classList.remove("right");
        });
        state.disableClick = false;
      }
      state.myAnswerRadio = "";
      state.myAnswerCheckbox = [];
      // 重答本题
      if (canRetryWhenWrong && !isRight) {
        return;
      }
      currentQuestion.value.answered = true;
      // 加分
      if (isRight) {
        state.score += state.scoreRate;
      }
      // 添加答案
      if (currentQuestionType.value === "radio") {
        // 单选添加答案
        const answerRadio = `${currentQuestion.value.id}|${myAnswerRadio}`;
        state.myAnswers.push(answerRadio);
      } else if (currentQuestionType.value === "checkbox") {
        // 多选添加答案
        const answerCheckbox = `${currentQuestion.value.id}|${myAnswerCheckboxString}`;
        state.myAnswers.push(answerCheckbox);
      }
      if (!isLastQuestion.value) {
        nextQuestion();
      } else {
        state.isSubmittedBeforeTimeUp = true;
        submit();
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
          await submit();
          break;
        }
        await ky.sleep(0.001);
      }
    };
    onMounted(async () => {
      state.info = await getInfo();
      state.questions = await getQuestions();
      nextQuestion();
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
      currentQuestion,
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
