<template>
  <div
    class="music"
    :class="{ active: audio.isAudioActive.value }"
    @click="audio.toggleAudio()"
  >
    <audio
      loop
      preload
      autoplay
      src="./static/audios/bgm.mp3"
      class="bgm"
    ></audio>
  </div>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.sp.min.css";
import "swiper/swiper-bundle.min.css";
import { defineComponent, onMounted } from "vue";
import MockServer from "@/mock/index";
// import VConsole from "vconsole";
import { isDevMode } from "./consts";
import ky from "kyouka";
import useAudio from "./hooks/useAudio";

export default defineComponent({
  setup() {
    ky.iosInputScrollFix();
    const audio = useAudio();
    if (isDevMode) {
      const mockServer = new MockServer();
      mockServer.start();
    }
    onMounted(() => {
      audio.playBGM(document.querySelector(".bgm") as HTMLAudioElement);
    });
    return {
      audio,
    };
  },
});
</script>

<style lang="scss">
body {
  min-height: 100vh;
  margin: 0;
  background: white;
}

// colors

:root {
}

// mixins

@mixin sp-layout {
  @media screen and (max-width: 750px) {
    @content;
  }
}

@mixin pc-layout {
  @media screen and (min-width: 751px) {
    @content;
  }
}

@mixin iphone-x-below-layout {
  @media screen and (max-height: 723px) {
    @content;
  }
}

// reset

* {
  border-width: 0;
  -webkit-tap-highlight-color: transparent;
}

a {
  color: currentColor;
  text-decoration: none;
}

p {
  margin: 0;
}

// sweetalert2

.alert-title {
  font-weight: normal !important;
}

@include sp-layout {
  body {
    font-size: 4vw;
  }

  .alert-title {
    font-size: 3.8vw !important;
  }

  .alert-popup {
    max-width: 72vw !important;
  }
}

// utils

$colors: "red", "orange", "yellow", "green", "blue", "purple", "brown", "black",
  "white";
@each $c in $colors {
  @for $i from 1 through 8 {
    .text-#{$c}-#{$i} {
      color: var(--#{$c}-color-#{$i});
    }

    .bg-#{$c}-#{$i} {
      background: var(--#{$c}-color-#{$i});
    }

    .border-#{$c}-#{$i} {
      border-color: var(--#{$c}-color-#{$i});
    }
  }
}

@for $i from 101 through 180 {
  .top-#{$i} {
    top: #{$i}vw;
  }

  .bottom-#{$i} {
    bottom: #{$i}vw;
  }
}

// common

.dialog {
  animation: fade-in 0.6s both;
}

.music {
  position: fixed;
  z-index: 1000;
  top: 12vh;
  right: 5vw;
  width: 30px;
  height: 30px;
  background: url("./assets/music-1.png") 0 0 / cover no-repeat;

  &.active {
    background-image: url("./assets/music-0.png");
  }
}

.share-tip {
  position: fixed;
  z-index: 10000;
  top: 4vh;
  right: 6vw;
  width: 38vw;
  height: 21vh;
  background: url("./assets/share-tip.png") 0 0 / contain no-repeat;
  animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

// animations

.swiper-slide {
  * {
    visibility: hidden;
  }
}

.swiper-slide-active {
  * {
    visibility: visible;
  }

  .slide-in-right {
    animation: slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .slide-in-left {
    animation: slide-in-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .slide-in-bottom {
    animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .fade-in-fwd {
    animation: fade-in-fwd 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  }

  .arrow {
    animation: fade-in-fwd 1.2s 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) both,
      slide-up-down 2s 1.4s infinite;
  }

  .scale-in-center {
    animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .puff-in-center {
    animation: puff-in-center 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) both;
  }

  .bounce-in-bottom {
    animation: bounce-in-bottom 1.1s both;
  }

  .bounce-in-fwd {
    animation: bounce-in-fwd 1.1s both;
  }
}

@keyframes slide-in-right {
  0% {
    transform: translateX(50vw);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-left {
  0% {
    transform: translateX(-50vw);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-bottom {
  0% {
    transform: translateY(50vw);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in-fwd {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slide-up-down {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes scale-in-center {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes puff-in-center {
  0% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce-in-bottom {
  0% {
    transform: translateY(500px);
    animation-timing-function: ease-in;
    opacity: 0;
  }
  38% {
    transform: translateY(0);
    animation-timing-function: ease-out;
    opacity: 1;
  }
  55% {
    transform: translateY(65px);
    animation-timing-function: ease-in;
  }
  72% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  81% {
    transform: translateY(28px);
    animation-timing-function: ease-in;
  }
  90% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  95% {
    transform: translateY(8px);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
}

@keyframes bounce-in-fwd {
  0% {
    transform: scale(0);
    animation-timing-function: ease-in;
    opacity: 0;
  }
  38% {
    transform: scale(1);
    animation-timing-function: ease-out;
    opacity: 1;
  }
  55% {
    transform: scale(0.7);
    animation-timing-function: ease-in;
  }
  72% {
    transform: scale(1);
    animation-timing-function: ease-out;
  }
  81% {
    transform: scale(0.84);
    animation-timing-function: ease-in;
  }
  89% {
    transform: scale(1);
    animation-timing-function: ease-out;
  }
  95% {
    transform: scale(0.95);
    animation-timing-function: ease-in;
  }
  100% {
    transform: scale(1);
    animation-timing-function: ease-out;
  }
}

.blink {
  animation: blink 2s linear both infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}
</style>
