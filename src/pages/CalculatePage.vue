<template>
  <q-page class="row items-center justify-evenly">
    <div class="calculate-container">
      <!-- 游戏模式顶部信息 -->
      <div v-if="settings.gameMode" class="game-header">
        <div class="streak-badge">
          <q-icon name="whatshot" color="orange" />
          <span>连续答对: {{ gameStats.streak }}</span>
        </div>

        <div class="max-streak-badge">
          <q-icon name="emoji_events" color="amber" />
          <span>最高连击: {{ gameStats.maxStreak }}</span>
        </div>
      </div>

      <!-- 统计信息行 -->
      <div class="row stats-row">
        <q-chip square class="stat-chip">
          <q-avatar color="green" text-color="white">
            {{ correct_count }}
          </q-avatar>
          <span class="stat-label">答对</span>
        </q-chip>

        <q-space />

        <div class="timer">
          <q-icon name="timer" size="sm" />
          <span
            >{{ minutes }}:{{ seconds < 10 ? '0' + seconds : seconds }}</span
          >
        </div>

        <q-space />

        <q-chip
          square
          clickable
          class="stat-chip"
          @click="WrongListDrawerOpen = !WrongListDrawerOpen"
        >
          <q-avatar color="red" text-color="white">{{ wrong_count }}</q-avatar>
          <span class="stat-label">答错</span>
        </q-chip>
      </div>

      <!-- 题目容器 -->
      <div class="question-container">
        <transition name="fade" mode="out-in">
          <div class="question" :key="current_quesstion.id">
            <span class="number">{{ current_quesstion.num1 }}</span>
            <span class="operator">{{ current_quesstion.operator }}</span>
            <span class="number">{{ current_quesstion.num2 }}</span>
            <span class="equals">=</span>
            <span class="result" :class="{ 'wrong-answer': display_wrong }">
              {{ display_result }}
            </span>
            <transition name="bounce">
              <q-icon
                v-if="display_wrong"
                name="close"
                color="red"
                class="wrong-icon"
              />
              <q-icon
                v-else-if="display_correct"
                name="check_circle"
                color="green"
                class="correct-icon"
              />
            </transition>
          </div>
        </transition>

        <!-- 连续答对特效 -->
        <div v-if="showStreakEffect" class="streak-effect">
          <q-icon name="whatshot" color="orange" size="xl" />
          <span>连续{{ gameStats.streak }}题！</span>
        </div>
      </div>

      <!-- 输入容器 -->
      <div class="input-container">
        <q-input
          ref="answerInput"
          v-model="input_result"
          outlined
          autofocus
          class="answer-input"
          type="number"
          @update:model-value="checkResult"
        >
          <template v-slot:before>
            <div class="input-label">解答:</div>
          </template>
          <template v-slot:after>
            <q-btn
              flat
              round
              size="lg"
              icon="settings"
              color="primary"
              @click="CalculateSettingDrawerOpen = !CalculateSettingDrawerOpen"
            />
          </template>
        </q-input>
      </div>

      <!-- 进度条 -->
      <div
        class="progress-container"
        v-if="settings.gameMode || settings.showAnimation"
      >
        <q-linear-progress
          size="25px"
          :value="progressValue"
          :color="settings.gameMode ? 'primary' : 'secondary'"
          class="progress-bar"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              :text-color="settings.gameMode ? 'primary' : 'secondary'"
              :label="`${correct_count}/${settings.targetScore}`"
            />
          </div>
        </q-linear-progress>
      </div>

      <!-- 成就通知 -->
      <transition name="slide-up">
        <div v-if="showAchievement" class="achievement-notification">
          <q-icon name="emoji_events" color="amber" size="md" />
          <div class="achievement-text">
            <div class="achievement-title">获得成就！</div>
            <div>{{ currentAchievement }}</div>
          </div>
        </div>
      </transition>
    </div>
  </q-page>

  <!-- 错题集抽屉 -->
  <q-drawer
    elevated
    side="right"
    :width="$q.screen.width > 600 ? 500 : $q.screen.width * 0.8"
    v-model="WrongListDrawerOpen"
    overlay
    class="wrong-list-drawer"
  >
    <div class="q-pa-md row drawer-header">
      <div class="text-h6">错题集</div>
      <q-space></q-space>
      <q-btn
        round
        flat
        icon="clear"
        color="red"
        @click="WrongListDrawerOpen = false"
      />
    </div>
    <q-separator />
    <q-scroll-area style="height: calc(100% - 76px)">
      <q-list bordered separator>
        <q-item
          v-for="(item, index) in wrong_list"
          :key="item.id"
          class="wrong-item"
        >
          <q-item-section avatar>
            <q-icon name="close" color="red" size="md" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="wrong-question">
              {{ item.num1 }} {{ item.operator }} {{ item.num2 }} =
              {{ item.wrong_answer }}
            </q-item-label>
            <q-item-label caption>
              正确答案: {{ calculateCorrectAnswer(item) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              round
              flat
              dense
              icon="delete"
              color="negative"
              @click="removeWrongItem(index)"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="wrong_list.length === 0">
          <q-item-section class="text-center">
            <q-item-label>暂无错题</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="q-pa-md">
        <q-btn
          v-if="wrong_list.length > 0"
          color="negative"
          label="清空错题"
          class="full-width"
          @click="clearWrongList()"
        />
      </div>
    </q-scroll-area>
  </q-drawer>

  <!-- 设置抽屉 -->
  <q-drawer
    elevated
    side="right"
    :width="$q.screen.width > 600 ? 500 : $q.screen.width * 0.8"
    v-model="CalculateSettingDrawerOpen"
    overlay
    class="settings-drawer"
  >
    <div class="q-pa-md row drawer-header">
      <div class="text-h6">配置</div>
      <q-space></q-space>
      <q-btn
        round
        flat
        icon="clear"
        color="red"
        @click="CalculateSettingDrawerOpen = false"
      />
    </div>
    <q-separator />
    <q-scroll-area style="height: calc(100% - 76px)">
      <div class="q-pa-md q-gutter-md">
        <!-- 游戏模式设置 -->
        <div class="text-subtitle2 q-mb-sm">游戏模式</div>
        <div class="q-gutter-sm">
          <q-toggle
            v-model="settings.gameMode"
            label="开启游戏模式（连续答对特效、完成提示）"
            color="primary"
          />
          <q-input
            v-if="settings.gameMode"
            v-model="settings.targetScore"
            type="number"
            dense
            outlined
            label="目标题数"
            class="q-mt-sm"
            min="5"
            max="100"
          />
          <div v-if="settings.gameMode" class="text-caption q-mt-xs">
            答题数量达到目标后将显示统计信息
          </div>
        </div>

        <q-separator spaced />

        <div class="text-subtitle2 q-mb-sm">难度级别</div>
        <q-option-group
          v-model="settings.difficultyLevel"
          :options="difficultyOptions"
          color="primary"
          inline
        />

        <q-separator spaced />

        <div class="text-subtitle2 q-mb-sm">数字范围</div>
        <div class="row q-col-gutter-md q-ml-md">
          <div class="col-6">
            <q-input
              v-model="settings.minNumber"
              type="number"
              dense
              outlined
              label="最小值"
              @update:model-value="updateSettings"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="settings.maxNumber"
              type="number"
              dense
              outlined
              label="最大值"
              @update:model-value="updateSettings"
            />
          </div>
        </div>

        <q-separator spaced />

        <div class="text-subtitle2 q-mb-sm">运算类型</div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-checkbox
              v-model="settings.operators"
              val="+"
              label="加法 (+)"
              @update:model-value="updateSettings"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="settings.operators"
              val="-"
              label="减法 (-)"
              @update:model-value="updateSettings"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="settings.operators"
              val="×"
              label="乘法 (×)"
              @update:model-value="updateSettings"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="settings.operators"
              val="÷"
              label="除法 (÷)"
              @update:model-value="updateSettings"
            />
          </div>
        </div>

        <q-separator spaced />

        <div class="text-subtitle2 q-mb-sm">界面设置</div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-toggle
              v-model="settings.showAnimation"
              label="显示动画效果"
              color="positive"
            />
          </div>
          <div class="col-6">
            <q-toggle
              v-model="settings.soundEffects"
              label="音效"
              color="positive"
            />
          </div>
          <div class="col-6">
            <q-toggle
              v-model="settings.autoFocus"
              label="自动聚焦输入框"
              color="positive"
            />
          </div>
        </div>

        <q-separator spaced />

        <div class="text-subtitle2 q-mb-sm">答题设置</div>
        <q-slider
          v-model="settings.checkDelay"
          :min="300"
          :max="2000"
          :step="100"
          label
          label-always
          color="primary"
        >
          <template v-slot:marker-label>
            <q-badge color="primary" text-color="white">
              {{ settings.checkDelay }}ms
            </q-badge>
          </template>
        </q-slider>
        <div class="text-caption">答题检查延迟 (毫秒)</div>

        <div class="q-mt-lg">
          <q-btn
            color="primary"
            label="应用设置"
            class="full-width"
            @click="applySettings"
          />
        </div>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import {
  QuestionItem,
  CalculateSettings,
  GameStats,
} from 'src/components/models';

defineOptions({
  name: 'CalculatePage',
});

const $q = useQuasar();

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
let timeoutId: NodeJS.Timeout | undefined; // 检查延时的计时器ID

// 答题输入
let input_result = ref<number | null>(null); // 绑定用户输入的input
const answerInput = ref<HTMLElement | null>(null); // 输入框引用

// 答题统计
let total_count = ref(0); // 总题数
let correct_count = ref(0); // 答对题数
let wrong_count = ref(0); // 答错题数
let already_answered = false;
let display_wrong = ref(false);
let display_correct = ref(false);
let wrong_list = ref<QuestionItem[]>([]);
let WrongListDrawerOpen = ref(false);

// 答题计时
let minutes = ref(0);
let seconds = ref(0);
let timerInterval: NodeJS.Timeout | undefined;

// 进度条
let progressValue = ref(0);

// 游戏化元素
let gameStats = ref<GameStats>({
  level: 1,
  streak: 0,
  maxStreak: 0,
  stars: 0,
  achievements: [],
});
let showStreakEffect = ref(false);
let showAchievement = ref(false);
let currentAchievement = ref('');
let levelCompleted = ref(false);

// 配置
let CalculateSettingDrawerOpen = ref(false);
let settings = ref<CalculateSettings>({
  minNumber: 1,
  maxNumber: 20,
  operators: ['+', '-'],
  checkDelay: 800,
  difficultyLevel: 'easy',
  showAnimation: true,
  soundEffects: true,
  gameMode: true, // 默认开启游戏模式
  targetScore: 100, // 默认目标分数
  autoFocus: true, // 默认自动聚焦
});

// 难度选项
const difficultyOptions = [
  { label: '简单 (3-4岁)', value: 'easy' },
  { label: '中等 (4-5岁)', value: 'medium' },
  { label: '困难 (5-6岁)', value: 'hard' },
];

// 记忆曲线
let need_retest: QuestionItem[] = [];
let insert_wrong: QuestionItem | null = null;
const memoryCurveIntervals = [60000, 150000, 300000]; // 间隔时间 (以毫秒为单位) 模拟记忆曲线

// 音效
let correctSound: HTMLAudioElement | null = null;
let wrongSound: HTMLAudioElement | null = null;
let streakSound: HTMLAudioElement | null = null;
let levelUpSound: HTMLAudioElement | null = null;
let achievementSound: HTMLAudioElement | null = null;

// 成就列表
const achievements = [
  {
    id: 'first_correct',
    name: '初次成功',
    description: '答对第一题',
    unlocked: false,
  },
  {
    id: 'streak_5',
    name: '小小学霸',
    description: '连续答对5题',
    unlocked: false,
  },
  {
    id: 'streak_10',
    name: '数学天才',
    description: '连续答对10题',
    unlocked: false,
  },
  {
    id: 'level_complete',
    name: '闯关成功',
    description: '完成一个关卡',
    unlocked: false,
  },
  {
    id: 'all_correct',
    name: '全对',
    description: '一个关卡内全部答对',
    unlocked: false,
  },
  {
    id: 'speed_master',
    name: '速度之星',
    description: '在30秒内答对5题',
    unlocked: false,
  },
];

// 初始化
onMounted(() => {
  // 初始化音效
  correctSound = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'
  );
  wrongSound = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'
  );
  streakSound = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'
  );
  levelUpSound = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
  );
  achievementSound = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'
  );

  // 应用难度设置
  applyDifficultySettings();

  // 启动计时器
  startTimer();

  // 自动聚焦输入框
  focusAnswerInput();
});

// 监听难度变化
watch(
  () => settings.value.difficultyLevel,
  () => {
    applyDifficultySettings();
  }
);

// 根据难度应用设置
function applyDifficultySettings() {
  switch (settings.value.difficultyLevel) {
    case 'easy':
      settings.value.minNumber = 1;
      settings.value.maxNumber = 10;
      settings.value.operators = ['+', '-'];
      settings.value.targetScore = 10;
      break;
    case 'medium':
      settings.value.minNumber = 1;
      settings.value.maxNumber = 20;
      settings.value.operators = ['+', '-', '×'];
      settings.value.targetScore = 15;
      break;
    case 'hard':
      settings.value.minNumber = 1;
      settings.value.maxNumber = 30;
      settings.value.operators = ['+', '-', '×', '÷'];
      settings.value.targetScore = 20;
      break;
  }

  // 更新进度条
  updateProgressValue();
}

// 更新设置
function updateSettings() {
  // 确保至少选择一个运算符
  if (settings.value.operators.length === 0) {
    settings.value.operators = ['+'];
  }

  // 确保最小值小于最大值
  if (settings.value.minNumber >= settings.value.maxNumber) {
    settings.value.maxNumber = settings.value.minNumber + 5;
  }
}

// 应用设置并重新开始
function applySettings() {
  // 重置统计
  resetStats();

  // 关闭设置抽屉
  CalculateSettingDrawerOpen.value = false;

  // 生成新题目
  generate();

  // 显示提示
  $q.notify({
    message: '设置已应用，游戏重新开始！',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000,
  });
}

// 重置统计数据
function resetStats() {
  correct_count.value = 0;
  wrong_count.value = 0;
  total_count.value = 0;
  minutes.value = 0;
  seconds.value = 0;
  progressValue.value = 0;

  // 重置游戏数据
  if (settings.value.gameMode) {
    gameStats.value = {
      level: 1, // 保留字段但不再使用
      streak: 0,
      maxStreak: 0,
      stars: 0, // 保留字段但不再使用
      achievements: [],
    };
    levelCompleted.value = false;
  }
}

// 启动计时器
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (seconds.value === 59) {
      minutes.value += 1;
      seconds.value = 0;
    } else {
      seconds.value += 1;
    }

    // 检查速度成就
    checkSpeedAchievement();
  }, 1000);
}

// 生成题目
function generate_question() {
  // 出新题
  const min = settings.value.minNumber;
  const max = settings.value.maxNumber;
  const operators = settings.value.operators;

  let question: QuestionItem = {
    id: question_index,
    num1: Math.floor(Math.random() * (max - min)) + min,
    operator: operators[Math.floor(Math.random() * operators.length)],
    num2: Math.floor(Math.random() * (max - min)) + min,
    wrong_answer: null,
    next: null,
    correct_count: 0,
  };
  question_index += 1;

  // 根据运算符调整数字
  switch (question.operator) {
    case '-':
      // 确保结果为正数
      [question.num1, question.num2] = [
        Math.max(question.num1, question.num2),
        Math.min(question.num1, question.num2),
      ];
      break;
    case '×':
      // 乘法使用较小的数字
      question.num1 = Math.floor(Math.random() * 10) + 1;
      question.num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case '÷':
      // 除法确保能整除
      question.num2 = Math.floor(Math.random() * 9) + 1; // 1-9的除数
      const result = Math.floor(Math.random() * 10) + 1; // 1-10的结果
      question.num1 = question.num2 * result; // 确保能整除
      break;
  }

  return question;
}

function generate() {
  if (insert_wrong !== null) {
    current_quesstion.value = insert_wrong;
    return;
  } else {
    current_quesstion.value = generate_question();
  }

  // 自动聚焦输入框
  if (settings.value.autoFocus) {
    focusAnswerInput();
  }
}

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

// 计算正确答案
function calculateCorrectAnswer(question: QuestionItem): number {
  switch (question.operator) {
    case '+':
      return question.num1 + question.num2;
    case '-':
      return question.num1 - question.num2;
    case '×':
      return question.num1 * question.num2;
    case '÷':
      return question.num1 / question.num2;
    default:
      return 0;
  }
}

// 播放音效
function playSound(
  type: 'correct' | 'wrong' | 'streak' | 'levelUp' | 'achievement'
) {
  if (!settings.value.soundEffects) return;

  switch (type) {
    case 'correct':
      if (correctSound) {
        correctSound.currentTime = 0;
        correctSound.play();
      }
      break;
    case 'wrong':
      if (wrongSound) {
        wrongSound.currentTime = 0;
        wrongSound.play();
      }
      break;
    case 'streak':
      if (streakSound) {
        streakSound.currentTime = 0;
        streakSound.play();
      }
      break;
    case 'levelUp':
      if (levelUpSound) {
        levelUpSound.currentTime = 0;
        levelUpSound.play();
      }
      break;
    case 'achievement':
      if (achievementSound) {
        achievementSound.currentTime = 0;
        achievementSound.play();
      }
      break;
  }
}

// 显示正确动画
function showCorrectAnimation() {
  display_correct.value = true;
  setTimeout(() => {
    display_correct.value = false;
  }, 1000);
}

// 自动聚焦输入框
function focusAnswerInput() {
  nextTick(() => {
    const inputEl = answerInput.value as unknown as {
      focus: () => void;
    } | null;
    if (inputEl && typeof inputEl.focus === 'function') {
      inputEl.focus();
    }
  });
}

// 更新进度条
function updateProgressValue() {
  // 确保进度条在达到目标时显示100%
  progressValue.value = Math.min(
    1,
    correct_count.value / settings.value.targetScore
  );

  // 当答题数量达到目标时，显示成功对话框
  if (
    settings.value.gameMode &&
    correct_count.value >= settings.value.targetScore &&
    !levelCompleted.value
  ) {
    // 确保在下一个事件循环中调用，避免与其他UI更新冲突
    setTimeout(() => {
      showCompletionDialog();
    }, 0);
  }
}

// 显示连续答对特效
function showStreakAnimation() {
  if (gameStats.value.streak >= 3) {
    showStreakEffect.value = true;
    playSound('streak');

    setTimeout(() => {
      showStreakEffect.value = false;
    }, 1500);
  }
}

// 检查成就
function checkAchievements() {
  // 初次成功
  if (correct_count.value === 1 && !achievements[0].unlocked) {
    unlockAchievement('first_correct');
  }

  // 连续答对5题
  if (gameStats.value.streak >= 5 && !achievements[1].unlocked) {
    unlockAchievement('streak_5');
  }

  // 连续答对10题
  if (gameStats.value.streak >= 10 && !achievements[2].unlocked) {
    unlockAchievement('streak_10');
  }

  // 闯关成功
  if (levelCompleted.value && !achievements[3].unlocked) {
    unlockAchievement('level_complete');
  }

  // 全对
  if (
    levelCompleted.value &&
    wrong_count.value === 0 &&
    !achievements[4].unlocked
  ) {
    unlockAchievement('all_correct');
  }
}

// 检查速度成就
function checkSpeedAchievement() {
  // 在30秒内答对5题
  if (
    minutes.value === 0 &&
    seconds.value <= 30 &&
    correct_count.value >= 5 &&
    !achievements[5].unlocked
  ) {
    unlockAchievement('speed_master');
  }
}

// 解锁成就
function unlockAchievement(id: string) {
  const achievement = achievements.find((a) => a.id === id);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    gameStats.value.achievements.push(id);

    // 显示成就通知
    currentAchievement.value =
      achievement.name + ': ' + achievement.description;
    showAchievement.value = true;
    playSound('achievement');

    setTimeout(() => {
      showAchievement.value = false;
    }, 3000);
  }
}

// 显示完成对话框
function showCompletionDialog() {
  if (
    settings.value.gameMode &&
    correct_count.value >= settings.value.targetScore &&
    !levelCompleted.value
  ) {
    levelCompleted.value = true;

    // 计算正确率
    const totalAnswered = correct_count.value + wrong_count.value;
    const accuracy =
      totalAnswered > 0
        ? Math.round((correct_count.value / totalAnswered) * 100)
        : 0;

    // 计算平均用时
    const totalSeconds = minutes.value * 60 + seconds.value;
    const averageTime =
      totalAnswered > 0 ? (totalSeconds / totalAnswered).toFixed(1) : 0;

    // 显示完成通知
    $q.dialog({
      title: '恭喜！',
      message: `<div class="text-center">
        <p class="text-h6">你已完成目标题数！</p>
        <div class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-subtitle1">答对题数</div>
              <div class="text-h5 text-positive">${correct_count.value}</div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1">答错题数</div>
              <div class="text-h5 text-negative">${wrong_count.value}</div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1">正确率</div>
              <div class="text-h5 text-primary">${accuracy}%</div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1">平均用时</div>
              <div class="text-h5 text-secondary">${averageTime}秒/题</div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1">最大连击</div>
              <div class="text-h5 text-orange">${gameStats.value.maxStreak}</div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1">总用时</div>
              <div class="text-h5">${minutes.value}分${seconds.value}秒</div>
            </div>
          </div>
        </div>
      </div>`,
      html: true,
      ok: '继续练习',
      cancel: '重新开始',
      persistent: true,
    })
      .onOk(() => {
        // 继续练习，重置部分状态
        levelCompleted.value = false;
        // 生成新题目
        generate();
      })
      .onCancel(() => {
        // 重新开始
        resetStats();
        generate();
      });

    // 播放完成音效
    playSound('levelUp');

    // 检查成就
    checkAchievements();
  }
}

// 延时检查输入答案
function checkResult() {
  // 更新显示的值
  display_result.value =
    input_result.value !== null ? input_result.value.toString() : '?';

  // 清除错误图标
  display_wrong.value = false;

  // 清除上一个检查延时的计时器
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // 设置新的检查延时的计时器
  timeoutId = setTimeout(() => {
    //  计算正确答案
    let question = current_quesstion.value;
    let correct_answer = calculateCorrectAnswer(question);

    if (Number(input_result.value) === correct_answer) {
      // 答对了
      playSound('correct');
      showCorrectAnimation();

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

        // 游戏模式：更新连续答对计数
        if (settings.value.gameMode) {
          gameStats.value.streak += 1;

          // 更新最大连续答对记录
          if (gameStats.value.streak > gameStats.value.maxStreak) {
            gameStats.value.maxStreak = gameStats.value.streak;
          }

          // 显示连续答对特效
          if (gameStats.value.streak >= 3 && gameStats.value.streak % 3 === 0) {
            showStreakAnimation();
          }

          // 检查成就
          checkAchievements();

          // 更新进度条（会自动检查是否完成）
          // 确保在状态更新后再检查进度
          nextTick(() => {
            updateProgressValue();
          });
        }

        // 更新进度条
        updateProgressValue();
      }
      total_count.value += 1;
      already_answered = false;

      // 延迟显示新题目
      setTimeout(() => {
        display_result.value = '?';
        // 出新题
        generate();
      }, 1000);
    } else {
      // 答错了
      playSound('wrong');
      display_wrong.value = true;

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

        // 游戏模式：重置连续答对计数
        if (settings.value.gameMode) {
          gameStats.value.streak = 0;
        }

        let wrong_item = { ...current_quesstion.value }; // 创建副本
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
    }
    input_result.value = null;

    // 自动聚焦输入框
    if (settings.value.autoFocus) {
      focusAnswerInput();
    }
  }, settings.value.checkDelay);
}

// 删除错题
function removeWrongItem(index: number) {
  const item = wrong_list.value[index];

  // 从错题列表中删除
  wrong_list.value.splice(index, 1);

  // 从需要复习的列表中删除
  need_retest = need_retest.filter((i) => i.id !== item.id);

  // 如果当前正在做这道错题，则生成新题
  if (insert_wrong && insert_wrong.id === item.id) {
    insert_wrong = null;
    generate();
  }

  // 显示提示
  $q.notify({
    message: '已删除错题',
    color: 'info',
    position: 'top',
    timeout: 1000,
  });
}

// 清空错题列表
function clearWrongList() {
  $q.dialog({
    title: '确认',
    message: '确定要清空所有错题吗？',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    wrong_list.value = [];
    need_retest = [];

    // 如果当前正在做错题，则生成新题
    if (insert_wrong !== null) {
      insert_wrong = null;
      generate();
    }

    // 显示提示
    $q.notify({
      message: '已清空所有错题',
      color: 'info',
      position: 'top',
      timeout: 1000,
    });
  });
}

// 初始化
generate();
total_count.value += 1;
</script>

<style lang="scss" scoped>
.calculate-container {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

/* 游戏模式顶部 */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

.streak-badge,
.max-streak-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.streak-badge {
  color: #ff9800;
}

.max-streak-badge {
  color: #ffc107;
}

/* 统计信息 */
.stats-row {
  margin-bottom: 20px;
}

.stat-chip {
  font-size: 1.2rem;
}

.streak-chip {
  font-size: 1.1rem;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

.stat-label {
  font-weight: bold;
}

.timer {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 题目区域 */
.question-container {
  margin: 40px 0;
  display: flex;
  justify-content: center;
  position: relative;
  min-height: 150px;
}

.question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 3rem;
  font-weight: bold;
}

.number,
.operator,
.equals {
  font-size: 3.5rem;
}

.result {
  font-size: 3.5rem;
  min-width: 80px;
  text-align: center;

  &.wrong-answer {
    color: red;
  }
}

.wrong-icon,
.correct-icon {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5rem;
}

/* 连续答对特效 */
.streak-effect {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 152, 0, 0.9);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.5s ease-out, glow 1.5s infinite alternate;
  z-index: 10;
}

/* 输入区域 */
.input-container {
  margin-top: 30px;
}

.answer-input {
  font-size: 1.5rem;
}

.input-label {
  font-size: 1.2rem;
  font-weight: bold;
}

/* 进度条 */
.progress-container {
  margin-top: 40px;
}

.progress-bar {
  border-radius: 8px;
}

/* 成就通知 */
.achievement-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 300px;
}

.achievement-text {
  display: flex;
  flex-direction: column;
}

.achievement-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #ff9800;
  margin-bottom: 5px;
}

/* 错题集 */
.wrong-item {
  padding: 15px;
}

.wrong-question {
  font-size: 1.2rem;
  font-weight: bold;
}

.drawer-header {
  align-items: center;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) translateX(-50%);
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(-50%);
  }
  50% {
    transform: scale(1.2) translateY(-50%);
  }
  100% {
    transform: scale(1) translateY(-50%);
  }
}

@keyframes slideDown {
  0% {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(255, 152, 0, 0.8), 0 0 10px rgba(255, 152, 0, 0.5);
  }
  to {
    box-shadow: 0 0 10px rgba(255, 152, 0, 0.8), 0 0 20px rgba(255, 152, 0, 0.5);
  }
}
</style>
