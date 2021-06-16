<template>
  <div class="flex-center flex-wrap">
    <div class="relative flex-center" v-for="n in targetNum" :key="n">
      <img
        :src="
          lightNum > n - 1
            ? require(`../assets/icons/${n}.png`)
            : require(`../assets/icons/${n}-d.png`)
        "
        alt=""
        class="w-20"
        :class="`icon-${n}-img`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ky from "kyouka";

export default defineComponent({
  name: "LightStatus",
  props: {
    lightNum: {
      type: Number,
      default: 0,
    },
    targetNum: {
      type: Number,
      default: 12,
    },
  },
  setup() {
    return { ky };
  },
});
</script>

<style lang="scss" scoped></style>
