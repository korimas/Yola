<template>
  <q-page class="row items-center justify-evenly">
    <div>
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
        type="number"
        @update:model-value="checkResult"
      >
        <template v-slot:before> 解答: </template>
        <template v-slot:after>
          <q-btn
            flat
            size="md"
            icon="settings"
            @click="CalculateSettingDrawerOpen = !CalculateSettingDrawerOpen"
        /></template>
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
          <q-item-section
            >{{ item.num1 }} {{ item.operator }} {{ item.num2 }} =
            {{ item.wrong_answer }}</q-item-section
          >
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>

  <q-drawer
    elevated
    side="right"
    :width="$q.screen.width > 600 ? 500 : $q.screen.width * 0.8"
    v-model="CalculateSettingDrawerOpen"
    overlay
  >
    <div class="q-pa-md row" style="height: 65px">
      <div class="text-h6">配置</div>
      <q-space></q-space>
      <q-btn
        unelevated
        size="12px"
        icon="clear"
        color="red"
        @click="CalculateSettingDrawerOpen = false"
      />
    </div>
    <q-separator />
    <q-scroll-area style="height: calc(100% - 66px)">
      <div class="q-pa-md q-gutter-md">
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
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'CalculatePage',
});

// 计算题组成
let num1 = ref(0);
let operator = ref('+');
let num2 = ref(0);
let display_result = ref('?'); // 用于显示用户的输入
const operators = ['+', '-'];
let result = ref(0); // 正确结果
let timeoutId: NodeJS.Timeout | undefined; // 检查延时的计时器ID
let check_delay = 800; // 检查延时(ms)

// 答题输入
let input_result = ref<number | null>(null); // 绑定用户输入的input

// 答题统计
let total_count = ref(0); // 总题数
let correct_count = ref(0); // 答对题数
let wrong_count = ref(0); // 答错题数
let same_question = false;
let is_wrong = false;
let wrong_list = ref<WrongItem[]>([]);
let need_retest = [];
let WrongListDrawerOpen = ref(false);

// 答题计时
let minutes = ref(0);
let seconds = ref(0);

// 配置
let CalculateSettingDrawerOpen = ref(false);
let end_number = ref(20);

// 记忆曲线
// const memoryCurveIntervals = [60000, 150000, 300000]; // 间隔时间 (以毫秒为单位) 模拟记忆曲线

interface WrongItem {
  id: number;
  num1: number;
  operator: string;
  num2: number;
  wrong_answer: number | null;
}

function generate_new() {
  // 出新题
  const randomOperator =
    operators[Math.floor(Math.random() * operators.length)];
  const num1_t = Math.floor(Math.random() * end_number.value - 1) + 1;
  const num2_t = Math.floor(Math.random() * end_number.value - 1) + 1;

  if (randomOperator === '-') {
    [num1.value, num2.value] = [
      Math.max(num1_t, num2_t),
      Math.min(num1_t, num2_t),
    ];
  } else {
    [num1.value, num2.value] = [num1_t, num2_t];
  }
  operator.value = randomOperator;
  result.value = eval(`${num1.value} ${operator.value} ${num2.value}`);
}

function generate_wrong() {
  // 五分之一的概率从错题集中出题
  if (Math.random() < 0.2 && wrong_list.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * wrong_list.value.length);
    const randomWrongItem = wrong_list.value[randomIndex];
    const [num1_t, operator_t, num2_t] = [
      randomWrongItem.num1,
      randomWrongItem.operator,
      randomWrongItem.num2,
    ];
    num1.value = num1_t;
    operator.value = operator_t;
    num2.value = num2_t;
    result.value = eval(`${num1.value} ${operator.value} ${num2.value}`);
    return;
  }
}

function generate() {
  generate_wrong();
  generate_new();
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
  if (input_result.value !== null) {
    display_result.value = input_result.value.toString();
  } else {
    display_result.value = '?';
  }
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
      let wrong_item = {
        id: wrong_list.value.length + 1,
        num1: num1.value,
        num2: num2.value,
        operator: operator.value,
        wrong_answer: input_result.value,
      };
      wrong_list.value.push(wrong_item);
      need_retest.push(wrong_item);
    }
    input_result.value = null;
  }, check_delay);
}

generate();
total_count.value += 1;
</script>
