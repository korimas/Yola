<template>
  <q-page class="row items-center justify-evenly">
    <div class="container">
      <div class="row">
        <q-chip square>
          <q-avatar color="teal" text-color="white">{{
            correct_count
          }}</q-avatar>
          答对
        </q-chip>
        <q-space />
        <q-chip square>
          <q-avatar color="red" text-color="white">{{ wrong_count }}</q-avatar>
          答错
        </q-chip>
      </div>
      <q-space />
      <div>
        <span style="font-size: 55px"
          >{{ num1 }} {{ operator }} {{ num2 }} = {{ display_result }}</span
        >
        <!-- <q-icon size="md" name="done" /> -->
        <q-icon v-if="is_wrong" size="md" name="close" />
      </div>
      <q-input
        v-model="input_result"
        outlined
        dense
        class="full-width"
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
let display_result = ref('?');
let result = ref(0);
let input_result = ref('');
let timeoutId: NodeJS.Timeout | undefined;
let total_count = ref(0);
let correct_count = ref(0);
let wrong_count = ref(0);
let same_question = false;
let is_wrong = false;

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
  display_result.value = input_result.value;
  is_wrong = false;

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    if (Number(input_result.value) === result.value) {
      generate();
      if (!same_question) {
        correct_count.value += 1;
      }
      total_count.value += 1;
      same_question = false;
      display_result.value = '?';
    } else {
      if (!same_question) {
        wrong_count.value += 1;
      }
      same_question = true;
      is_wrong = true;
    }
    input_result.value = '';
  }, 650);
}

generate();
total_count.value += 1;
</script>
