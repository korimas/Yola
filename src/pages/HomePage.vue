<template>
  <q-page class="row items-center justify-center">
    <div class="container">
      <h2 class="title">{{ displayedText }}</h2>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'HomePage',
});

let displayedText = ref('');
let text = "Hello, I'm YOLA!";

let index = 0;
let speed = 90;
const timer = setInterval(() => {
  if (index < text.length) {
    displayedText.value += text.charAt(index);
    index++;
    speed = Math.floor(Math.random() * 101);
  } else {
    clearInterval(timer);
  }
}, speed);
</script>
