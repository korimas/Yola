<template>
  <q-page class="row items-center justify-evenly">
    <div class="container">
      <h2 class="title">{{ num1 }} {{ operator }} {{ num2 }} = ?</h2>
      <q-input
        v-model="input_result"
        outlined
        dense
        style="width: 100px"
        @update:model-value="checkResult"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'CalculatePage',
});

let num1 = ref('0');
let operator = ref('+');
let num2 = ref('0');
let result = ref(0);
let input_result = ref('');
let timeoutId: NodeJS.Timeout | undefined;

function generate() {
  const operators = ['+', '-'];
  const randomOperator =
    operators[Math.floor(Math.random() * operators.length)];
  const num1_t = Math.floor(Math.random() * 19) + 1;
  const num2_t = Math.floor(Math.random() * 19) + 1;

  if (randomOperator === '-') {
    [num1.value, num2.value] = [
      Math.max(num1_t, num2_t).toString(),
      Math.min(num1_t, num2_t).toString(),
    ];
  } else {
    [num1.value, num2.value] = [num1_t.toString(), num2_t.toString()];
  }
  operator.value = randomOperator;
  result.value = eval(`${num1.value} ${randomOperator} ${num2.value}`);
}

function checkResult() {
  if (Number(input_result.value) === result.value) {
    generate();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      input_result.value = '';
    }, 100);
  }
}

generate();
</script>
