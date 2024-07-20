<template>
  <q-page class="row items-center justify-center">
    <div class="container">
      <h1 class="title">{{ displayedText }}</h1>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'HomePage',
});

let displayedText = ref('');
let text = 'Hello, I am YOLA!';

let index = 0;
const timer = setInterval(() => {
  if (index < text.length) {
    displayedText.value += text.charAt(index);
    index++;
  } else {
    clearInterval(timer);
  }
}, 100);
</script>
