<template>
  <div class="relative max-h-80 overflow-y-scroll" v-if="rank">
    <div class="flex flex-col divide-y divide-dotted">
      <div
        class="py-2 flex items-center whitespace-no-wrap text-sm"
        v-for="(item, i) in rank.list"
        :key="i"
      >
        <div class="relative flex-center w-14">
          <div class="absolute font-bold">{{ item.rank }}</div>
        </div>
        <div class="w-11">
          <img :src="item.headimg" alt="" class="w-6 h-6 flex-none" />
        </div>
        <div class="w-20 truncate" v-html="item.name"></div>
        <div class="w-16 font-bold">{{ item.score }}</div>
      </div>
    </div>
    <div class="h-6"></div>
    <div
      class="fixed bottom-0 left-0 w-full bg-warning rounded-xl py-1 flex-center"
    >
      <div class="mx-4 flex items-center whitespace-no-wrap text-sm">
        <div
          v-if="rank.my.rank === '暂无排名'"
          class="w-14 text-xs font-bold text-center"
        >
          {{ rank.my.rank }}
        </div>
        <div v-else class="w-10 font-bold">{{ rank.my.rank }}</div>
        <div class="w-11">
          <img :src="rank.my.headimg" alt="" class="w-6 h-6 flex-none" />
        </div>
        <div class="w-20 truncate" v-html="rank.my.name"></div>
        <div class="w-16 font-bold">{{ rank.my.score }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RankList",
  props: {
    rank: {
      type: Object,
    },
  },
});
</script>
