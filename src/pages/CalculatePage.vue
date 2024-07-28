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
          >{{ current_quesstion.num1 }} {{ current_quesstion.operator }}
          {{ current_quesstion.num2 }} = {{ display_result }}</span
        >
        <!-- <q-icon size="md" name="done" /> -->
        <q-icon v-if="display_wrong" size="md" name="close" color="red" />
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
          <q-icon size="md" name="close" color="red" />
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
let question_index = 0;
let current_quesstion = ref<QuestionItem>({
  id: 0,
  num1: 0,
  operator: '+',
  num2: 0,
  wrong_answer: null,
  next: null,
  correct_count: 0,
});
let display_result = ref('?'); // 用于显示用户的输入
const operators = ['+', '-'];
let timeoutId: NodeJS.Timeout | undefined; // 检查延时的计时器ID
let check_delay = 800; // 检查延时(ms)

// 答题输入
let input_result = ref<number | null>(null); // 绑定用户输入的input

// 答题统计
let total_count = ref(0); // 总题数
let correct_count = ref(0); // 答对题数
let wrong_count = ref(0); // 答错题数
let already_answered = false;
let display_wrong = false;
let wrong_list = ref<QuestionItem[]>([]);
let WrongListDrawerOpen = ref(false);

// 答题计时
let minutes = ref(0);
let seconds = ref(0);

// 配置
let CalculateSettingDrawerOpen = ref(false);
let end_number = ref(20);

// 记忆曲线
let need_retest: QuestionItem[] = [];
let insert_wrong: QuestionItem | null = null;
const memoryCurveIntervals = [5000, 10000, 30000]; // 间隔时间 (以毫秒为单位) 模拟记忆曲线

interface QuestionItem {
  id: number;
  num1: number;
  operator: string;
  num2: number;
  wrong_answer: number | null;
  next: Date | null;
  correct_count: number; // 答对次数
}

function generate_question() {
  // 出新题
  let question: QuestionItem = {
    id: question_index,
    num1: Math.floor(Math.random() * (end_number.value - 1)) + 1,
    operator: operators[Math.floor(Math.random() * operators.length)],
    num2: Math.floor(Math.random() * (end_number.value - 1)) + 1,
    wrong_answer: null,
    next: null,
    correct_count: 0,
  };
  question_index += 1;

  if (question.operator === '-') {
    [question.num1, question.num2] = [
      Math.max(question.num1, question.num2),
      Math.min(question.num1, question.num2),
    ];
  }

  return question;
}

function generate() {
  // generate_wrong();
  if (insert_wrong !== null) {
    current_quesstion.value = insert_wrong;
    return;
  } else {
    current_quesstion.value = generate_question();
  }
}

// 计时器
setInterval(() => {
  if (seconds.value === 59) {
    minutes.value += 1;
    seconds.value = 0;
  }
  seconds.value += 1;
}, 1000);

// 记忆曲线定时检查
setInterval(() => {
  if (need_retest.length <= 0) {
    return;
  }

  need_retest.forEach((item) => {
    if (insert_wrong !== null) {
      return;
    }

    if (item.next !== null && item.next <= new Date()) {
      console.log('找到需要复习的题目：' + item.id);
      insert_wrong = item;
      return;
    }
  });
}, 3000);

// 延时检查输入答案
function checkResult() {
  // 更新显示的值
  display_result.value =
    input_result.value !== null ? input_result.value.toString() : '?';

  // 清除错误图标
  display_wrong = false;

  // 清除上一个检查延时的计时器
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // 设置新的检查延时的计时器
  timeoutId = setTimeout(() => {
    //  计算正确答案
    let question = current_quesstion.value;
    let correct_answer: number = eval(
      `${question.num1} ${question.operator} ${question.num2}`
    );
    if (Number(input_result.value) === correct_answer) {
      // 答对了
      if (question.next !== null && !already_answered) {
        // 当前是错题
        question.correct_count += 1;
        if (question.correct_count >= memoryCurveIntervals.length) {
          // 已经做完记忆曲线
          need_retest = need_retest.filter((item) => item.id != question.id);
        } else {
          // 等待下一次记忆时刻
          question.next = new Date(
            Date.now() + memoryCurveIntervals[question.correct_count]
          );
          console.log(
            '答对错题：' + question.id + '，下次复习时间：' + question.next
          );
          insert_wrong = null;
        }
      }

      // 统计
      if (!already_answered) {
        correct_count.value += 1;
      }
      total_count.value += 1;
      already_answered = false;
      display_result.value = '?';

      // 出新题
      generate();
    } else {
      // 答错了
      if (question.next !== null) {
        // 当前是错题
        question.correct_count = 0;
        question.next = new Date(Date.now() + memoryCurveIntervals[0]);
        console.log(
          '答错错题：' + question.id + '，下次复习时间：' + question.next
        );
        insert_wrong = null;
      }

      if (!already_answered) {
        wrong_count.value += 1;

        let wrong_item = current_quesstion.value;
        wrong_item.wrong_answer = input_result.value;
        wrong_item.correct_count = 0;
        wrong_item.next = new Date(Date.now() + memoryCurveIntervals[0]);
        wrong_list.value.push(wrong_item);
        need_retest.push(wrong_item);
        console.log(
          '增加错题：' + question.id + '，下次复习时间：' + question.next
        );
      }
      already_answered = true;
      display_wrong = true;
    }
    input_result.value = null;
  }, check_delay);
}

generate();
total_count.value += 1;
</script>
