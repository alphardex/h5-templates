<template>
  <div class="btn btn-primary btn-round" v-if="type === 1">
    <slot></slot>
  </div>
  <div class="btn btn-primary btn-round btn-sm" v-else-if="type === 2">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MyBtn",
  props: {
    type: {
      type: Number,
      default: 1,
    },
  },
});
</script>
