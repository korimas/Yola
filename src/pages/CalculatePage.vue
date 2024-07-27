<template>
  <q-page class="row items-center justify-evenly">
    <div>
      <q-input
        v-model="end_number"
        type="number"
        dense
        style="width: 235px; margin-bottom: 30px"
        outlined
      >
        <template v-slot:before> 从0到</template>
        <template v-slot:after> 的加减法</template>
      </q-input>
      <div class="row">
        <q-chip square>
          <q-avatar color="teal" text-color="white">{{
            correct_count
          }}</q-avatar>
          答对
        </q-chip>
        <q-space />
        <span style="font-size: 22px">{{ minutes }}:{{ seconds }}</span>
        <q-space />
        <q-chip
          square
          clickable
          @click="WrongListDrawerOpen = !WrongListDrawerOpen"
        >
          <q-avatar color="red" text-color="white">{{ wrong_count }}</q-avatar>
          答错
        </q-chip>
      </div>
      <q-space />
      <div style="margin-top: 66px; margin-bottom: 66px">
        <span style="font-size: 55px"
          >{{ num1 }} {{ operator }} {{ num2 }} = {{ display_result }}</span
        >
        <!-- <q-icon size="md" name="done" /> -->
        <q-icon v-if="is_wrong" size="md" name="close" color="red" />
      </div>
      <q-input
        v-model="input_result"
        outlined
        dense
        class="full-width"
        @update:model-value="checkResult"
      >
        <template v-slot:before> 解答: </template>
      </q-input>
    </div>
  </q-page>

  <q-drawer
    elevated
    side="right"
    :width="$q.screen.width > 600 ? 500 : $q.screen.width * 0.8"
    v-model="WrongListDrawerOpen"
    overlay
  >
    <div class="q-pa-md row" style="height: 65px">
      <div class="text-h6">错题集</div>
      <q-space></q-space>
      <q-btn
        unelevated
        size="12px"
        icon="clear"
        color="red"
        @click="WrongListDrawerOpen = false"
      />
    </div>
    <q-separator />
    <q-scroll-area style="height: calc(100% - 66px)">
      <q-list bordered separator>
        <q-item
          clickable
          v-ripple
          v-for="item in wrong_list"
          :key="item.id"
          v-bind="item"
        >
          <q-icon v-if="is_wrong" size="md" name="close" color="red" />
          <q-item-section>{{ item.question }}</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
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
let minutes = ref(0);
let seconds = ref(0);
let wrong_list = ref<WrongItem[]>([]);
let WrongListDrawerOpen = ref(false);
let end_number = ref(20);

interface WrongItem {
  id: number;
  question: string;
  wrong_answer: string;
  correct_answer: string;
}

function generate() {
  // 五分之一的概率从错题集中出题
  if (Math.random() < 0.2 && wrong_list.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * wrong_list.value.length);
    const randomWrongItem = wrong_list.value[randomIndex];
    const [num1_t, operator_t, num2_t] = randomWrongItem.question.split(' ');
    num1.value = num1_t;
    operator.value = operator_t;
    num2.value = num2_t;
    result.value = Number(randomWrongItem.correct_answer);
    return;
  }

  // 出新题
  const operators = ['+', '-'];
  const randomOperator =
    operators[Math.floor(Math.random() * operators.length)];
  const num1_t = Math.floor(Math.random() * end_number.value - 1) + 1;
  const num2_t = Math.floor(Math.random() * end_number.value - 1) + 1;

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

// 计时器
setInterval(() => {
  if (seconds.value === 59) {
    minutes.value += 1;
    seconds.value = 0;
  }
  seconds.value += 1;
}, 1000);

// 延时检查输入答案
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
      wrong_list.value.push({
        id: wrong_list.value.length + 1,
        question: `${num1.value} ${operator.value} ${num2.value} = ${input_result.value}`,
        wrong_answer: input_result.value,
        correct_answer: result.value.toString(),
      });
    }
    input_result.value = '';
  }, 800);
}

generate();
total_count.value += 1;
</script>
